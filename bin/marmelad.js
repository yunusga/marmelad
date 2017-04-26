#!/usr/bin/env node

'use strict';

let path              = require('path');
let fs                = require('fs-extra');
let program           = require('commander');
let bsSP              = require('browser-sync').create();
let basicAuth         = require('basic-auth');
let gulp              = require('gulp');
let glogger           = require('../modules/gulp-event-logger')(gulp);
let iconizer          = require('../modules/gulp-iconizer');
let gutil             = require('gulp-util');
let plumber           = require('gulp-plumber');
let eslint            = require('gulp-eslint');
let compileHandlebars = require('gulp-compile-handlebars');
let beml              = require('gulp-beml');
let svgSprite         = require('gulp-svg-sprite');
let stylus            = require('gulp-stylus');
let autoprefixer      = require('gulp-autoprefixer');
let csso              = require('gulp-csso');
let rename            = require('gulp-rename');
let header            = require('gulp-header');
let changed           = require('gulp-changed');
let concat            = require('gulp-concat');
let uglify            = require('gulp-uglify');
let include           = require('gulp-include');
let groupCssMQ        = require('gulp-group-css-media-queries');
let watch             = require('gulp-watch');
let batch             = require('gulp-batch');
let hbsLayouts        = require('handlebars-layouts');
let decache           = require('decache');
let requireDir        = require('require-dir');
let runSequence       = require('run-sequence');
let pipeErrorStop     = require('pipe-error-stop');
let del               = require('del');
let chalk             = require('chalk');
let pkg               = require('../package');

let settings = require(path.join('..', 'boilerplate', 'settings.marmelad'));
let database = {};

program
    .version(pkg.version)
    .option('-a, --auth', 'enable basic access authentication')
    .option('-u, --user [username]', 'set authentication user')
    .option('-p, --pass [password]', 'set authentication password')
    .parse(process.argv);

if (program.auth) {

    if (!program.user || !program.pass) {
        gutil.log(`You are running ${chalk.bold.yellow('marmelad')} with basic auth but did not set the USER ${chalk.bold.yellow('-u')} and PASSWORD ${chalk.bold.yellow('-p')} with cli args.`);
        process.exit(1);
    }
}

/**
 * plumber onError handler
 */
let plumberOnError = function(err) {
    gutil.log(gutil.colors.red('Error (' + err.plugin + '): ' + err.message));
    this.emit('end');
};

/**
 * list of blocks directories
 *
 * @param blocksPath {String} path to blocks destination
 * @returns {Array} blocks paths
 */
let getHbsPartialsPaths = (blocksPath) => {

    let folders = fs.readdirSync(blocksPath);
    let partials = [];

    folders.forEach(function (el) {
        partials.push(blocksPath + '/' + el);
    });

    return partials;
};

/**
 * register handlebars-layouts helpers
 * https://www.npmjs.com/package/handlebars-layouts
 */
compileHandlebars.Handlebars.registerHelper(hbsLayouts(compileHandlebars.Handlebars));

/**
 * обновление данных для шаблонов
 */
gulp.task('handlebars:data', (done) => {

    let dataPath = path.join(process.cwd(), 'marmelad', 'data.marmelad.js');

    decache(dataPath);

    database = require(dataPath);

    console.log(settings.paths.storage);

    Object.assign(database.app, {
        package  : pkg,
        settings : settings,
        storage  : settings.folders.storage
    });

    gutil.log(`database for handlebars templates ${chalk.bold.yellow('refreshed')}`);

    done();

});

/**
 * обновление данных для шаблонов
 * пересборка шаблонов с новыми данными
 */
gulp.task('handlebars:refresh', (done) => {
    runSequence('handlebars:data', 'handlebars:templates', done);
});

/**
 * сборка шаблонов handlebars
 * https://www.npmjs.com/package/gulp-compile-handlebars
 */
gulp.task('handlebars:templates', function(done) {

    let stream = gulp.src(settings.paths._pages + '/**/*.{hbs,handlebars}')
        .pipe(plumber({errorHandler: plumberOnError}))
        .pipe(
            compileHandlebars(database, {
                ignorePartials: false,
                batch: getHbsPartialsPaths(settings.paths._blocks),
                helpers: requireDir(path.join(process.cwd(), settings.paths._helpers))
            })
        )
        .pipe(pipeErrorStop()) // на случай если handlebars сломается, иначе таск останавливается
        .pipe(beml(settings.app.beml))
        .pipe(iconizer({path: path.join(settings.paths.iconizer.src, 'sprite.svg')}))
        .pipe(rename({extname: '.html'}))
        .pipe(gulp.dest(settings.paths.dist));

    stream.on('end', function() {

        bsSP.reload();

        done();
    });

    stream.on('error', function(err) {
        done(err);
    });
});

/**
 * генерация svg спрайта
 */
gulp.task('iconizer', () => {

    return gulp.src(settings.paths.iconizer.icons + '/*.svg')
        .pipe(svgSprite(settings.app.svgSprite))
        .pipe(gulp.dest('.'));
});

/**
 * обновляет svg спрайт
 * пересборка шаблонов
 */
gulp.task('iconizer:refresh', (done) => {
    runSequence('iconizer', 'handlebars:templates', done);
});

/**
 * scripts from blocks
 */
gulp.task('scripts:blocks', (done) => {

    return gulp.src(path.join(settings.paths._blocks, '**', '*.js'))
        .pipe(plumber({errorHandler: plumberOnError}))
        .pipe(eslint(settings.app.eslint))
        .pipe(eslint.format());
        // .pipe(concat('blocks.js'))
        // .pipe(gulp.dest(path.join(settings.paths.storage,  settings.folders.js.src)));
});

/**
 * scripts from blocks
 */
gulp.task('scripts:others', ['scripts:blocks'], (done) => {

    let stream = gulp.src(path.join(settings.paths.js.src, '*.js'))
        .pipe(plumber({errorHandler: plumberOnError}))
        .pipe(include({
            extensions: 'js',
            hardFail: false
        }))
            .on('error', gutil.log)
        .pipe(eslint(settings.app.eslint))
        .pipe(eslint.format())
        .pipe(gulp.dest(path.join(settings.paths.storage,  settings.folders.js.src)));

    stream.on('end', () => {

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

    stream.on('end', function () {

        bsSP.reload();

        done();
    });

    stream.on('error', function (err) {
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

    stream.on('end', function () {

        bsSP.reload();

        done();
    });

    stream.on('error', function (err) {
        done(err);
    });

});

/**
 * СТИЛИ ПЛАГИНОВ
 */
gulp.task('styles:plugins', (done) => {

    let stream = gulp.src(settings.paths.js.plugins + '/**/*.css')
        .pipe(plumber())
        .pipe(concat('plugins.min.css'))
        .pipe(groupCssMQ())
        .pipe(csso())
        .pipe(gulp.dest(path.join(settings.paths.storage, 'css')));

    stream.on('end', function () {

        bsSP.stream();

        done();
    });

    stream.on('error', function (err) {
        done(err);
    });

});

/**
 * сборка стилей блоков, для каждого отдельный css
 */
gulp.task('stylus', function() {

    return gulp.src(path.join(settings.paths.stylus, '*.styl'))
        .pipe(plumber({errorHandler: plumberOnError}))
        .pipe(stylus({
            'include css': true
        }))
        .pipe(autoprefixer(settings.app.autoprefixer))
        .pipe(groupCssMQ())
        .pipe(gulp.dest(path.join(settings.paths.storage, 'css')))
        .pipe(bsSP.stream());
});

/**
 * СТАТИКА
 */
gulp.task('static', function(done) {

    let stream = gulp.src([
        settings.paths.static + '/**/*.*',
        '!' + settings.paths.static + '/**/Thumbs.db',
        '!' + settings.paths.static + '/**/*tmp*'
    ])
        .pipe(plumber())
        .pipe(changed(settings.paths.dist))
        .pipe(gulp.dest(settings.paths.dist));

    stream.on('end', function () {

        bsSP.reload();

        done();
    });

    stream.on('error', function (err) {
        done(err);
    });
});

/**
 * static server
 */
gulp.task('server:static', (done) => {

    if (program.auth) {

        settings.app.bsSP.server.middleware = function (req, res, next) {

            let auth = basicAuth(req);

            if (auth && auth.name === program.user && auth.pass === program.pass) {
                return next();
            } else {
                res.statusCode = 401;
                res.setHeader('WWW-Authenticate', 'Basic realm="Marmelad Static Server"');
                res.end('Access denied');
            }

        }
    }

    bsSP.init(settings.app.bsSP, done);
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
    ], batch(function (events, done) {
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

    watch(path.join(settings.paths._blocks, '**', '*.js'), batch(function (events, done) {
        gulp.start('scripts:others', done);
    }));
    watch(path.join(settings.paths.js.src, '*.js'), batch(function (events, done) {
        gulp.start('scripts:others', done);
    }));

    /* ICONIZER */
    watch(path.join(settings.paths.iconizer.icons, '*.svg'), batch(function (events, done) {
        gulp.start('iconizer:refresh', done);
    }));

    /* ДАННЫЕ ДЛЯ ШАБЛОНОВ */
    watch(path.join(settings.paths.marmelad, 'data.marmelad.js'), batch((events, done) => {
        gulp.start('handlebars:refresh', done);
    }));

    /* ШАБЛОНЫ */
    watch(path.join(settings.paths._pages, '**', '*.{hbs,handlebars}'), batch((events, done) => {
        gulp.start('handlebars:templates', done);
    }));
    watch(path.join(settings.paths._blocks, '**', '*.{hbs,handlebars}'), batch((events, done) => {
        gulp.start('handlebars:templates', done);
    }));

});

/**
 * очищаем папку сборки перед сборкой Ж)
 */
gulp.task('clean', (done) => {
    del.sync(settings.paths.dist);
    done();
});

gulp.task('marmelad:start', function(done) {

    runSequence(
        'clean',
        'server:static',
        'static',
        'iconizer',
        'handlebars:data',
        'handlebars:templates',
        'scripts:vendors',
        'scripts:plugins',
        'scripts:others',
        'stylus',
        'styles:plugins',
        'watch',
        done);

});

/**
 * project init
 */
gulp.task('marmelad:init', function(done) {

    let stream = gulp.src(
        [path.join(__dirname.replace('bin', ''), 'boilerplate', '**', '*.*')],
        {
            dot: true
        })
        .pipe(gulp.dest(path.join(process.cwd(), 'marmelad')));

    stream.on('end', function () {
        done();
    });

    stream.on('error', function (err) {
        done(err);
    });

});

fs.exists(path.join('marmelad', 'settings.marmelad.js'), function(exists) {

    if (exists) {

        settings = require(path.join(process.cwd(), 'marmelad', 'settings.marmelad'));

        gulp.start('marmelad:start');

    } else {
        gulp.start('marmelad:init');
    }
});
