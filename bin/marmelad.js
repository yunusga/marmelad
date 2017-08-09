#!/usr/bin/env node

'use strict';

const fs                = require('fs');
const path              = require('path');
const CLI               = require('commander');
const pkg               = require('../package.json');
const chalk             = require('chalk');
const bsSP              = require('browser-sync').create();
const gulp              = require('gulp');
const tap               = require('gulp-tap');
const iconizer          = require('../modules/gulp-iconizer');

const babel             = require('gulp-babel');
const jscs              = require('gulp-jscs');
const uglify            = require('gulp-uglify');

const nunjucks          = require('gulp-nunjucks-html');
const frontMatter       = require('gulp-front-matter');

const beml              = require('gulp-beml');
const svgSprite         = require('gulp-svg-sprite');

const stylus            = require('gulp-stylus');
const postcss           = require('gulp-postcss');
const focus             = require('postcss-focus');
const autoprefixer      = require('autoprefixer');
const flexBugsFixes     = require('postcss-flexbugs-fixes');
const cssnano           = require('cssnano');

const gif               = require('gulp-if');
const gutil             = require('gulp-util');
const plumber           = require('gulp-plumber');
const groupMQ           = require('gulp-group-css-media-queries');
const rename            = require('gulp-rename');
const header            = require('gulp-header');
const changed           = require('gulp-changed');
const concat            = require('gulp-concat');
const include           = require('gulp-include');
const watch             = require('gulp-watch');
const batch             = require('gulp-batch');

const decache           = require('decache');
const runSequence       = require('run-sequence');
const pipeErrorStop     = require('pipe-error-stop');
const del               = require('del');
const boxen             = require('boxen');
const clipboardy        = require('clipboardy');
const getAuthParams     = (params) => typeof params !== 'string' ? [pkg.name, false] : params.split('@');
const getIconsNamesList = (path) => fs.readdirSync(path).map((iconName) => iconName.replace(/.svg/g, ''));
const getNunJucksBlocks = (blocksPath) => fs.readdirSync(blocksPath).map((el) => blocksPath + '/' + el);

/**
 * Установка флагов/параметров для командной строки
 */
CLI
    .version(pkg.version)
    .option('-a, --auth [user@password]', `set user@password for authorization`)
    .parse(process.argv);

/**
 * Проверка правильности установки логина и пароля для авторизации
 */
bsSP.use(require('bs-auth'), {
    user : getAuthParams(CLI.auth)[0],
    pass : getAuthParams(CLI.auth)[1],
    use  : CLI.auth
});

let settings = require(path.join('..', 'boilerplate', 'settings.marmelad'));
let database = {};
let isNunJucksUpdate = false;

/**
 * NUNJUCKS
 */
gulp.task('nunjucks', (done) => {

    let templateName = '';
    let error = false;

    let stream = gulp.src(path.join(settings.paths._pages,'**', '*.html'))
        .pipe(plumber())
        .pipe(gif(!isNunJucksUpdate, changed(settings.paths.dist)))
        .pipe(tap((file) => {
            templateName = path.basename(file.path);
        }))
        .pipe(frontMatter())
        .pipe(nunjucks({
            searchPaths: getNunJucksBlocks(settings.paths._blocks),
            locals: database,
            ext: '.html'
        }))
        .pipe(pipeErrorStop({
            errorCallback: (err) => {
                error = true;
                console.log(`\n${err.name}: ${err.message.replace(/(unknown path)/, templateName)}\n`);
            },
            successCallback: () => {
                error = false;
                isNunJucksUpdate = false;
            }
        }))
        .pipe(iconizer({path: path.join(settings.paths.iconizer.src, 'sprite.svg'), _beml : settings.app.beml}))
        .pipe(beml(settings.app.beml))
        .pipe(gulp.dest(settings.paths.dist));

    stream.on('end', () => {

        gutil.log(`NunJucks ${chalk.gray('............................')} ${error ? chalk.bold.red('ERROR\n') : chalk.bold.green('Done')}`);

        bsSP.reload();
        done();
    });

    stream.on('error', (err) => {
        done(err);
    });
});

/**
 * DB
 */
gulp.task('db', (done) => {

    let dataPath = path.join(process.cwd(), 'marmelad', 'data.marmelad.js');

    decache(dataPath);

    database = require(dataPath);

    Object.assign(database.app, {
        package  : pkg,
        settings : settings,
        storage  : settings.folders.storage,
        icons    : getIconsNamesList(settings.paths.iconizer.icons)
    });

    isNunJucksUpdate = true;

    gutil.log(`DB for templates .................... ${chalk.bold.yellow('Refreshed')}`);

    done();

});

/**
 * DB:update
 */
gulp.task('db:update', (done) => {
    runSequence('db', 'stylus', 'nunjucks', done);
});



/**
 * Iconizer
 */
gulp.task('iconizer', (done) => {

    let stream = gulp.src(path.join(settings.paths.iconizer.icons, '*.svg'))
        .pipe(svgSprite(settings.app.svgSprite))
        .pipe(gulp.dest('.'));

    stream.on('end', () => {

        Object.assign(database, {
            app : {
                icons : getIconsNamesList(settings.paths.iconizer.icons)
            }
        });

        gutil.log(`Iconizer ............................ ${chalk.bold.green('Done')}`);

        done();
    });

    stream.on('error', (err) => {
        done(err);
    });
});

/**
 * Iconizer update
 */
gulp.task('iconizer:update', (done) => {

    isNunJucksUpdate = true;
    
    runSequence('iconizer', 'db:update', done);
});


/**
 * scripts from blocks
 */
gulp.task('scripts:blocks', (done) => {

    return gulp.src(path.join(settings.paths._blocks, '**', '*.js'))
        .pipe(plumber())
        .pipe(jscs({ configPath : path.join('marmelad', '.jscsrc') }))
        .pipe(jscs.reporter());
});

/**
 * scripts from blocks
 */
gulp.task('scripts:others', ['scripts:blocks'], (done) => {

    let stream = gulp.src(path.join(settings.paths.js.src, '*.js'))
        .pipe(plumber())
        .pipe(include({
            extensions: 'js',
            hardFail: false
        })).on('error', gutil.log)
        .pipe(babel({
            presets: ['babel-preset-es2015'].map(require.resolve),
            plugins: ['babel-plugin-transform-object-assign'].map(require.resolve),
            babelrc: false
        }))
        .pipe(gulp.dest(path.join(settings.paths.storage,  settings.folders.js.src)));

    stream.on('end', () => {
        gutil.log(`Scripts others ...................... ${chalk.bold.green('Done')}`);
        bsSP.reload();
        done();
    });

    stream.on('error', (err) => {
        done(err);
    });
});

/**
 * СКРИПТЫ ВЕНДОРНЫЕ
 */
gulp.task('scripts:vendors', (done) => {

    let vendorsDist = path.join(settings.paths.storage,  settings.folders.js.src, settings.folders.js.vendors);

    let stream = gulp.src(settings.paths.js.vendors + '/**/*.js')
        .pipe(plumber())
        .pipe(changed(vendorsDist))
        .pipe(gulp.dest(vendorsDist));

    stream.on('end', () => {
        gutil.log(`Scripts vendors ..................... ${chalk.bold.green('Done')}`);
        bsSP.reload();
        done();
    });

    stream.on('error', (err) => {
        done(err);
    });

});

/**
 * СКРИПТЫ ПЛАГИНОВ
 */
gulp.task('scripts:plugins', (done) => {

    let stream = gulp.src(settings.paths.js.plugins + '/**/*.js')
        .pipe(plumber())
        .pipe(concat('plugins.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.join(settings.paths.storage,  settings.folders.js.src)));

    stream.on('end', () => {
        gutil.log(`Scripts plugins ..................... ${chalk.bold.green('Done')}`);
        bsSP.reload();
        done();
    });

    stream.on('error', (err) => {
        done(err);
    });

});

/**
 * СТИЛИ ПЛАГИНОВ
 */
gulp.task('styles:plugins', (done) => {

    gulp.src(path.join(settings.paths.js.plugins, '**', '*.css'))
        .pipe(plumber())
        .pipe(concat('plugins.min.css'))
        .pipe(groupMQ())
        .pipe(postcss([
            focus(),
            flexBugsFixes(),
            cssnano({ zindex:false })
        ]))
        .pipe(gulp.dest(path.join(settings.paths.storage, 'css')))
        .on('end', () => {
            gutil.log(`Plugins CSS ......................... ${chalk.bold.green('Done')}`);
        })
        .pipe(bsSP.stream());

    done();

});

/**
 * сборка стилей блоков, для каждого отдельный css
 */
gulp.task('stylus', (done) => {

    let $data = {
        beml : settings.app.beml
    };

    Object.assign($data, database.app.stylus);

    gulp.src(path.join(settings.paths.stylus, '*.styl'))
        .pipe(plumber())
        .pipe(stylus({
            'include css': true,
            rawDefine : { $data }
        }))
        .pipe(groupMQ())
        .pipe(postcss([
            focus(),
            flexBugsFixes(),
            autoprefixer(settings.app.autoprefixer)
        ]))
        .pipe(gif('*.min.css', postcss([
            cssnano(settings.app.cssnano)
        ])))
        .pipe(gulp.dest(path.join(settings.paths.storage, 'css')))
        .on('end', () => {
            gutil.log(`Stylus CSS .......................... ${chalk.bold.green('Done')}`);
        })
        .pipe(bsSP.stream());

    done();
});

/**
 * СТАТИКА
 */
gulp.task('static', (done) => {

    let stream = gulp.src([
        settings.paths.static + '/**/*.*',
        '!' + settings.paths.static + '/**/Thumbs.db',
        '!' + settings.paths.static + '/**/*tmp*'
    ])
        .pipe(plumber())
        .pipe(changed(settings.paths.storage))
        .pipe(gulp.dest(settings.paths.storage));

    stream.on('end', () => {
        gutil.log(`Static files copy ................... ${chalk.bold.green('Done')}`);
        bsSP.reload();
        done();
    });

    stream.on('error', (err) => {
        done(err);
    });
});

/**
 * static server
 */
gulp.task('server:static', (done) => {

    bsSP.init(settings.app.bsSP, () => {

        let urls = bsSP.getOption('urls'),
            bsAuth = bsSP.getOption('bsAuth'),
            authString = '';

        if (bsAuth && bsAuth.use) {
            authString = `\n\nuser: ${bsAuth.user}\npass: ${bsAuth.pass}`;
        }

        console.log(boxen(`${chalk.bold.yellow(pkg.name.toUpperCase())} v${pkg.version} is Started!\n\n${chalk.bold.green(urls.get('local'))} сopied to clipboard!${authString}`, {
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'green'
        }));

        clipboardy.writeSync(urls.get('local'));

        done();
    });
});

gulp.task('watch', () => {

    /* СТАТИКА */
    watch([
        settings.paths.static + '/**/*.*',
        '!' + settings.paths.static + '/**/Thumbs.db',
        '!' + settings.paths.static + '/**/*tmp*'
    ], batch((events, done) => {
        gulp.start('static', done);
    }));

    /* STYLUS */
    watch([
        path.join(settings.paths._blocks, '**', '*.styl'),
        path.join(settings.paths.stylus, '**', '*.styl')
    ], batch((events, done) => {
        gulp.start('stylus', done);
    }));

    /* СКРИПТЫ */
    watch(path.join(settings.paths.js.vendors, '**', '*.js'), batch((events, done) => {
        gulp.start('scripts:vendors', done);
    }));

    watch(path.join(settings.paths.js.plugins, '**', '*.js'), batch((events, done) => {
        gulp.start('scripts:plugins', done);
    }));
    watch(path.join(settings.paths.js.plugins, '**', '*.css'), batch((events, done) => {
        gulp.start('styles:plugins', done);
    }));

    watch(path.join(settings.paths._blocks, '**', '*.js'), batch((events, done) => {
        gulp.start('scripts:others', done);
    }));
    watch(path.join(settings.paths.js.src, '*.js'), batch((events, done) => {
        gulp.start('scripts:others', done);
    }));

    /* NunJucks Pages */
    watch(path.join(settings.paths._pages, '**', '*.html'), batch((events, done) => {
        gulp.start('nunjucks', done);
    }));

    /* NunJucks Blocks */
    watch([path.join(settings.paths._blocks, '**', '*.html')], batch((events, done) => {
        isNunJucksUpdate = true;
        gulp.start('nunjucks', done);
    }));

    /* NunJucks database */
    watch(path.join(settings.paths.marmelad, 'data.marmelad.js'), batch((events, done) => {
        gulp.start('db:update', done);
    }));


    /* Iconizer */
    watch(path.join(settings.paths.iconizer.icons, '*.svg'), batch((events, done) => {
        gulp.start('iconizer:update', done);
    }));

});

/**
 * очищаем папку сборки перед сборкой Ж)
 */
gulp.task('clean', (done) => {
    del.sync(settings.paths.dist);
    done();
});

gulp.task('marmelad:start', (done) => {

    runSequence(
        'clean',
        'server:static',
        'static',
        'iconizer',
        'db',
        'nunjucks',
        'scripts:vendors',
        'scripts:plugins',
        'scripts:others',
        'styles:plugins',
        'stylus',
        'watch',

        done);

});

/**
 * project init
 */
gulp.task('marmelad:init', (done) => {

    let stream = gulp.src(
        [path.join(__dirname.replace('bin', ''), 'boilerplate', '**', '*.*')],
        {
            dot: true
        })
        .pipe(gulp.dest(path.join(process.cwd(), 'marmelad')));

    stream.on('end', () => {

        console.log(boxen(`${pkg.name.toUpperCase()} v${pkg.version}\nBoilerplate successfully copied\n\ntype ${pkg.name} --help for CLI help`, {
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'yellow'
        }));

        done();
    });

    stream.on('error', (err) => {
        done(err);
    });

});

fs.exists(path.join('marmelad', 'settings.marmelad.js'), (exists) => {

    if (exists) {

        settings = require(path.join(process.cwd(), 'marmelad', 'settings.marmelad'));

        gulp.start('marmelad:start');

    } else {
        gulp.start('marmelad:init');
    }
});
