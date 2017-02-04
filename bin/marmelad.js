#!/usr/bin/env node

'use strict';

const commander     = require('commander');
const path          = require('path');
const fs            = require('fs');
const jsonfile      = require('jsonfile');
const gulp          = require('gulp');
const decache       = require('decache');
const logger        = require('../modules/logger')(gulp);
const $             = require('gulp-load-plugins')();
const runSequence   = require('run-sequence');
const pipeErrorStop = require('pipe-error-stop');
const del           = require('del');
const requireDir    = require('require-dir');
const hbsLayouts    = require('handlebars-layouts');
const notifier      = require('node-notifier');
const iconizer      = require('../modules/gulp-iconizer');
const browserSync   = require('browser-sync').create();
const pkg           = require('../package.json');
const terminal      = require('terminal-logger')('marmelad');
const chalk         = require('chalk');

fs.exists('marmelad.json', (exist) => {

    if (exist) {

        console.info(`\n`);

        console.info(` ${chalk.bold.red('ВНИМАНИЕ!')}`);
        console.info(` Вы запустили ${chalk.bold.yellow('marmelad!')} ветки ${chalk.bold.green('develop')} для старой сборки`);
        console.info(` Переключитесь на ветку ${chalk.bold.green('master')}`);
        process.exit(1);
    }

});

// обработка аргументов командной строки
commander
    .version(pkg.version)
    .option('-r, --release', 'Release build')
    .parse(process.argv);

let settings = require('../assets/marmelad.settings');
let database = {};
let isRelease = false;

if (commander.release) {
    isRelease = true;
}

/**
 * обработчик ошибок для plumber
 */
let onError = function(err) {

    $.util.log(err.message);

    notifier.notify({
        'title': 'Error',
        'message': err.message
    });

    this.emit('end');
};



/**
 * регистрация хелперов расширения шаблонов handlebars-layouts
 * https://www.npmjs.com/package/handlebars-layouts
 */
$.compileHandlebars.Handlebars.registerHelper(hbsLayouts($.compileHandlebars.Handlebars));

/**
 * Получение списка директорий Блоков для их подключения в шаблоны
 *
 * @author Yunus Gaziev <yunus.gaziev@gmail.com>
 * @param dest {String} путь до папки в которой лежат блоки
 * @returns {Array} массив путей до шаблонов handlebars
 */
let getPartialsPaths = (dest) => {

    let folders = fs.readdirSync(dest); // массив папок-блоков
    let partials = []; // массив путей до шаблонов handlebars

    folders.forEach(function (el) {
        partials.push(dest + '/' + el);
    });

    return partials;
};

/**
 * обновление данных для шаблонов
 */
gulp.task('get:data', (done) => {

    let dataPath = path.join(process.cwd(), settings.paths.assets, 'marmelad.data.js');

    decache(dataPath);

    database = require(dataPath);

    Object.assign(database.app, {
        package  : pkg,
        settings : settings
    });

    terminal
        .write()
        .tick(`database for handlebars templates ${chalk.bold.yellow('refreshed')}\n`);

    done();

});

/**
 * обновление данных для шаблонов
 * пересборка шаблонов с новыми данными
 */
gulp.task('refresh:data', (cb) => {
    runSequence('get:data', 'handlebars', cb);
});

/**
 * сборка шаблонов handlebars
 * https://www.npmjs.com/package/gulp-compile-handlebars
 */
gulp.task('handlebars', function(done) {

    let stream = gulp.src(settings.paths.pages + '/**/*.{hbs,handlebars}')
        .pipe($.plumber())
        .pipe(
            $.compileHandlebars(database, {
                ignorePartials: false,
                batch: getPartialsPaths(settings.paths.blocks)
            })
        )
        .pipe(pipeErrorStop()) // на случай если handlebars сломается, иначе таск останавливается
        .pipe($.beml(settings.app.beml))
        .pipe(iconizer({path: settings.paths.iconizer.src + '/sprite.svg'}))
        .pipe($.rename({extname: '.html'}))
        .pipe(gulp.dest(settings.paths.dist));

    stream.on('end', function() {
        browserSync.reload();
        done();
    });

    stream.on('error', function(err) {
        done(err);
    });
});


/**
 * генерация svg спрайта
 */
gulp.task('build:iconizer', () => {

    return gulp.src(settings.paths.iconizer.icons + '/*.svg')
        .pipe($.svgSprite(settings.app.svgSprite))
        .pipe(gulp.dest('.'));
});

/**
 * обновляет svg спрайт
 * пересборка шаблонов
 */
gulp.task('build:iconizer:refresh', (cb) => {
    runSequence('build:iconizer', 'handlebars', cb);
});


/**
 * сборка стилей блоков, для каждого отдельный css
 */
gulp.task('stylus:main', function() {

    return gulp.src([
            path.join(settings.paths.stylus, '**', '_*.styl'),
            path.join(settings.paths.stylus, 'app.styl'),
            path.join(settings.paths.blocks, '**', '*.styl')
        ])
        .pipe($.plumber())
        .pipe($.concat('app.styl'))
        .pipe($.stylus())
        .pipe($.autoprefixer())
        .pipe($.groupCssMediaQueries())
        .pipe($.if(isRelease, $.csso({restructure: false})))
        .pipe(gulp.dest(path.join(settings.paths.storage, 'css')))
        .pipe(browserSync.stream());

});

/**
 * СТИЛИ ПАГИНОВ
 */
gulp.task('stylus:plugins', () => {
    return gulp.src(path.join(settings.paths.js.plugins, '**', '*.{styl,css}'))
        .pipe($.plumber())
        .pipe(
            $.stylus({
                'include css': true
            })
        )
        .pipe($.concat('plugins.min.css'))
        .pipe($.autoprefixer())
        .pipe($.csso())
        .pipe(gulp.dest(path.join(settings.paths.storage, 'css')))
        .pipe(browserSync.stream());
});

/**
 * СКРИПТЫ ВЕНДОРНЫЕ
 */
gulp.task('scripts:vendors', (done) => {

    let vendorsDist = path.join(settings.paths.storage,  settings.folders.js.src, settings.folders.js.vendors);

    let stream = gulp.src(settings.paths.js.vendors + '/**/*.js')
        .pipe($.plumber())
        .pipe($.changed(vendorsDist))
        .pipe(gulp.dest(vendorsDist));

    stream.on('end', function () {
        browserSync.reload();
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
        .pipe($.plumber())
        .pipe($.concat('plugins.min.js'))
        .pipe($.uglify())
        .pipe(gulp.dest(path.join(settings.paths.storage,  settings.folders.js.src)));

    stream.on('end', function () {
        browserSync.reload();
        done();
    });

    stream.on('error', function (err) {
        done(err);
    });

});

/**
 * СКРИПТЫ ОСНОВНЫЕ
 */
gulp.task('scripts:app', (done) => {

    let stream = gulp.src([
            settings.paths.js.src + '/app.js',
            settings.paths.blocks + '/**/*.js',
        ])
        .pipe($.plumber())
        .pipe($.concat('app.js'))
        .pipe($.wrap("$(function () {\n\n    'use strict';\n\n<%= contents %>\n});"))
        .pipe($.if(isRelease, $.uglify()))
        .pipe(gulp.dest(path.join(settings.paths.storage,  settings.folders.js.src)));

    stream.on('end', () => {
        browserSync.reload();
        done();
    });

    stream.on('error', (err) => {
        done(err);
    });
});

/**
 * перекладываем картинки блоков
 */
gulp.task('blocks:images', (done) => {

    let stream = gulp.src(settings.paths.blocks + '/**/*.{jpg,png,gif,svg,bmp}')
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.rename({dirname: ''}))
        .pipe(gulp.dest(settings.paths.dist));

    stream.on('end', () => {
        browserSync.reload();
        done();
    });

    stream.on('error', (err) => {
        done(err);
    });
});

gulp.task('watch', () => {

    /* СТАТИКА */
    $.watch([
        settings.paths.static + '/**/*.*',
        '!' + settings.paths.static + '/**/Thumbs.db',
        '!' + settings.paths.static + '/**/*tmp*'
    ], $.batch((events, done) => {
        gulp.start('build:static', done);
    }));

    /* ICONIZER */
    $.watch(settings.paths.iconizer.icons + '/*.svg', $.batch(function (events, done) {
        gulp.start('build:iconizer:refresh', done);
    }));

    /* СТИЛИ */
    $.watch([
        path.join(settings.paths.stylus, '**', '*.styl'),
        path.join(settings.paths.blocks, '**', '*.styl')
    ], $.batch((events, done) => {
        gulp.start('stylus:main', done);
    }));

    $.watch([
        path.join(settings.paths.stylus, '**', '*.styl'),
        path.join(settings.paths.blocks, '**', '*.styl')
    ], $.batch((events, done) => {
        gulp.start('stylus:main', done);
    }));

    $.watch(path.join(settings.paths.js.plugins, '**', '*.css'), $.batch((events, done) => {
        gulp.start('stylus:plugins', done);
    }));
    // $.watch(settings.paths.blocks + '/**/*.{styl,css}', $.batch((events, done) => {
    //     gulp.start('styles:main', done);
    // }));

    /* СКРИПТЫ */
    $.watch(path.join(settings.paths.js.vendors, '**', '*.js'), $.batch((events, done) => {
        gulp.start('scripts:vendors', done);
    }));
    $.watch(path.join(settings.paths.js.plugins, '**', '*.js'), $.batch((events, done) => {
        gulp.start('scripts:plugins', done);
    }));
    $.watch([
            settings.paths.js.src + '/app.js',
            settings.paths.blocks + '/**/*.js',
        ], $.batch((events, done) => {
            gulp.start('scripts:app', done);
        }));

    /* ДАННЫЕ ДЛЯ ШАБЛОНОВ */
    $.watch(path.join(settings.paths.assets, 'marmelad.data.js'), $.batch((events, done) => {
        gulp.start('refresh:data', done);
    }));

    /* ШАБЛОНЫ */
    $.watch(settings.paths.pages + '/**/*.{hbs,handlebars}', $.batch((events, done) => {
        gulp.start('handlebars', done);
    }));
    $.watch(settings.paths.blocks + '/**/*.{hbs,handlebars}', $.batch((events, done) => {
        gulp.start('handlebars', done);
    }));

    /* КАРТИНКИ БЛОКОВ*/
    // $.watch(settings.paths.blocks + '/**/*.{jpg,png,gif,svg,bmp}', $.batch((events, done) => {
    //     gulp.start('blocks:images', done);
    // }));

});

/**
 * СТАТИКА
 */
gulp.task('build:static', function(done) {

    let stream = gulp.src([
            settings.paths.static + '/**/*.*',
            '!' + settings.paths.static + '/**/Thumbs.db',
            '!' + settings.paths.static + '/**/*tmp*'
        ])
        .pipe($.plumber())
        .pipe($.changed(settings.paths.dist))
        .pipe(gulp.dest(settings.paths.dist));

    stream.on('end', function () {
        browserSync.reload();
        done();
    });

    stream.on('error', function (err) {
        done(err);
    });
});

/**
 * очищаем папку сборки перед сборкой Ж)
 */
gulp.task('build:clean', (done) => {
    del.sync(settings.paths.dist);
    done();
});

gulp.task('build:server', (done) => {
    browserSync.init(settings.app.browserSync, done);
});

gulp.task('handlebars:registerHelpers', function(done) {

    /**
     * Регистрация кастомных хелперов для Handlebars
     */
    const hbsHelpers = requireDir(path.join(process.cwd(), settings.paths.helpers));

    Object.keys(hbsHelpers).forEach(function(name) {
        $.compileHandlebars.Handlebars.registerHelper(name, hbsHelpers[name]);
    });

    done();
});

/**
 * инициализация нового проекта
 */
gulp.task('marmelad:init', (done) => {

    let stream = gulp.src(path.join(__dirname.replace('bin', ''), 'assets', '**', '*.*'))
        .pipe($.plumber())
        .pipe($.logger({
            before     : '[MARMELAD:INIT] STARTING',
            after      : '[MARMELAD:INIT] COMPLETE',
            showChange : true,
            display    : 'name'
        }))
        .pipe(gulp.dest(path.join(process.cwd(), 'assets')));

    stream.on('end', function () {

        terminal
            .write()
            .tick(`All good, just type ${chalk.bold.yellow('marmelad')} and start build`);

        done();
    });

    stream.on('error', function (err) {
        done(err);
    });

});

gulp.task('marmelad:start', function(done) {

    runSequence(
        'build:clean',
        'build:server',
        'build:static',
        'build:iconizer',
        'get:data',
        'handlebars:registerHelpers',
        'handlebars',
        'stylus:main',
        'stylus:plugins',
        'scripts:vendors',
        'scripts:plugins',
        'scripts:app',
        // 'blocks:images',
        'watch',
        done);
});

let init = () => {

    fs.exists('assets/marmelad.settings.js', (exist) => {

        if (exist) {

            settings = require(path.join(process.cwd(), 'assets', 'marmelad.settings'));

            settings.app.package = pkg;

            gulp.start('marmelad:start');

        } else {
            gulp.start('marmelad:init');
        }

    });
};


init();
