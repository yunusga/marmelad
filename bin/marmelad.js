#!/usr/bin/env node

'use strict';

const fs                = require('fs');
const CLI               = require('commander');
const path              = require('path');
const pkg               = require('../package.json');
const chalk             = require('chalk');
const gulp              = require('gulp');
const bsSP              = require('browser-sync').create();
const tap               = require('gulp-tap');
const iconizer          = require('../modules/gulp-iconizer');

const babel             = require('gulp-babel');
const jscs              = require('gulp-jscs');
const uglify            = require('gulp-uglify');

const nunjucks          = require('../modules/nunjucks');
const frontMatter       = require('gulp-front-matter');
const translit          = require('translit')(require('translit-russian'));

const postHTML          = require('gulp-posthtml');
const svgSprite         = require('gulp-svg-sprite');

const stylus            = require('gulp-stylus');
const postcss           = require('gulp-postcss');
const focus             = require('postcss-focus');
const flexBugsFixes     = require('postcss-flexbugs-fixes');
const momentumScrolling = require('postcss-momentum-scrolling');
const autoprefixer      = require('autoprefixer');
const cssnano           = require('cssnano');
const sass              = require('gulp-sass');
const sassGlob          = require('gulp-sass-glob');

const sourcemaps        = require('gulp-sourcemaps');
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
const getIconsNamesList = (path) => {
    let iconsList = [];
    
    if (fs.existsSync(path)) {
        iconsList =  fs.readdirSync(path).map((iconName) => iconName.replace(/.svg/g, ''));
    }

    return iconsList
} ;
const getNunJucksBlocks = (blocksPath) => fs.readdirSync(blocksPath).map((el) => blocksPath + '/' + el);

/**
 * Установка флагов/параметров для командной строки
 */
CLI
    .version(pkg.version)
    .option('-a, --auth [user@password]', `set user@password for authorization`)
    .option('-c, --clipboard', `copy server URL to clipboard on startup`)
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

    let templateName = '',
        error = false;

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
            ext: '.html',

            // TODO: https://gist.github.com/yunusga/1c5236331ddb6caa41a2a71928ac408a

            setUp: function(env) {

                env.addFilter('translit', (str) => translit(str).replace(/ /, '_').toLowerCase());

                env.addFilter('limitTo', require('../modules/njk-limitTo'));

                return env;
            }
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
        .pipe(postHTML([
            require('posthtml-bem')(settings.app.beml),
        ]))
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
    runSequence('db', 'styles', 'nunjucks', done);
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
            presets: ['@babel/preset-env'].map(require.resolve),
            plugins: ['@babel/plugin-transform-object-assign'].map(require.resolve),
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
            momentumScrolling(),
            flexBugsFixes(),
            cssnano({ zindex:false })
        ], { from: undefined } ))
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

gulp.task('styles', (done) => {

    let $data = {
        beml : settings.app.beml
    };

    Object.assign($data, database.app.stylus);

    gulp.src(path.join(settings.paths.styles, '*.{styl,scss,sass}'))
        .pipe(plumber())
        .pipe(gif('*.styl', stylus({
          'include css': true,
          rawDefine : { $data }
        })))
        .pipe(gif('*.scss', sassGlob()))
        .pipe(gif('*.scss', sass()))
        .pipe(gif('*.sass', sass({
            indentedSyntax: true
        })))
        .pipe(groupMQ())
        .pipe(postcss([
            focus(),
            momentumScrolling(),
            flexBugsFixes(),
            autoprefixer(settings.app.autoprefixer)
        ], { from: undefined } ))
        .pipe(gif('*.min.css', postcss([
            cssnano(settings.app.cssnano)
        ])))
        .pipe(gulp.dest(path.join(settings.paths.storage, 'css')))
        .on('end', () => {
            gutil.log(`Styles CSS .......................... ${chalk.bold.green('Done')}`);
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

        let clipboardMsg = '';

        if (CLI.clipboard) {

            clipboardMsg = `\n\n${chalk.bold.green(urls.get('local'))} сopied to clipboard!${authString}`;

            clipboardy.writeSync(urls.get('local'));
        }

        console.log(boxen(`${chalk.bold.yellow(pkg.name.toUpperCase())} v${pkg.version} is Started!${clipboardMsg}`, {
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'green'
        }));

        done();
    });
});

/** ^^^
 * Bootstrap 4 tasks
 ==================================================================== */
gulp.task('bootstrap', (done) => {

    if (settings.app.bts.use) {

        gulp.start('bts4:sass');
        gulp.start('bts4:js');
    
        /* SCSS */
        watch(path.join(settings.app.bts['4'].src.css, '**', '*.scss'), batch((events, done) => {
            gulp.start('bts4:sass', done);
        }));
    
        /* JS */
        watch(path.join(settings.app.bts['4'].src.js, '**', '*.js'), batch((events, done) => {
            gulp.start('bts4:js', done);
        }));
    }
    
    done();
});

gulp.task('bts4:sass', (done) => {

    gulp.src(path.join(settings.app.bts['4'].src.css, 'scss', '[^_]*.scss'))
        .pipe(sourcemaps.init())
        .pipe(sass(settings.app.bts['4'].sass))
        .pipe(postcss([
            momentumScrolling(),
            autoprefixer(settings.app.bts['4'].autoprefixer)
        ]))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(settings.app.bts['4'].dest.css))
        .on('end', () => {
            gutil.log(`Bootstrap ${settings.app.bts['4'].code} SASS ........... ${chalk.bold.green('Done')}`);
        })
        .pipe(bsSP.stream());

        done();
});

gulp.task('bts4:js', (done) => {

    let stream = gulp.src(path.join(settings.app.bts['4'].src.js, '**', '*.js'))
        .pipe(plumber())
        .pipe(changed(path.join(settings.app.bts['4'].dest.js)))
        .pipe(gulp.dest(settings.app.bts['4'].dest.js));

    stream.on('end', () => {
        gutil.log(`Bootstrap ${settings.app.bts['4'].code} JS ............. ${chalk.bold.green('Done')}`);
        bsSP.reload();
        done();
    });

    stream.on('error', (err) => {
        done(err);
    });

});

gulp.task('watch', () => {

    /* СТАТИКА */
    watch([
        settings.paths.static + '/**/*.*',
        '!' + settings.paths.static + '/**/Thumbs.db',
        '!' + settings.paths.static + '/**/*tmp*'
    ], {
        awaitWriteFinish: {
            stabilityThreshold: 1000,
            pollInterval: 500
        }
    }, batch((events, done) => {
        gulp.start('static', done);
    }));

    /* STYLES */
    watch([
        path.join(settings.paths._blocks, '**', '*.{styl,scss,sass}'),
        path.join(settings.paths.styles, '**', '*.{styl,scss,sass}'),
    ], batch((events, done) => {
        gulp.start('styles', done);
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
        'styles',
        'bootstrap',
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

        console.log(boxen(`${chalk.bold.yellow(pkg.name.toUpperCase())} v${pkg.version}\nBoilerplate successfully copied\n\ntype ${pkg.name} --help for CLI help`, {
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
