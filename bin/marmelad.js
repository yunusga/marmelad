#!/usr/bin/env node

'use strict';

const commander     = require('commander');
const path          = require('path');
const fs            = require('fs');
const jsonfile      = require('jsonfile');
const gulp          = require('gulp');
//const logger        = require('../modules/logger')(gulp);
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
const emoji         = require('node-emoji').emoji;

let settings = {};

/**
 * фдаг финальная сборка
 */
let isRelease = false;

/**
 * данные для шаблонов
 */
let db = {
    pageTitle : 'Marmelad project'
};

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
}

/**
 * сборка шаблонов handlebars
 * https://www.npmjs.com/package/gulp-compile-handlebars
 */
gulp.task('handlebars', function(done) {

    let stream = gulp.src([
            settings.paths.pages + '/**/*.{hbs,handlebars}',
            '!' + settings.paths.pages + '/**/_*.{hbs,handlebars}'
        ])
        .pipe($.plumber())
        .pipe(
            $.compileHandlebars(db, {
                ignorePartials: false,
                batch: getPartialsPaths(settings.paths.blocks)
            })
        )
        .on('error', $.notify.onError({title: 'Handlebars'}))
        .pipe(pipeErrorStop()) // на случай если handlebars сломается, иначе таск останавливается
        .pipe($.beml(settings.app.beml))
        .pipe(iconizer({path: settings.paths.iconizer + '/sprite.svg'}))
        //.pipe($.prettify({indent_size: 4}))
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
        .pipe(
            $.svgSprite(settings.app.svgSprite)
        )
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
 * обновление данных для шаблонов
 */
gulp.task('get-data', (done) => {

    jsonfile.readFile(settings.paths.assets + '/data.json', (error, data) => {

        if (error) {
            data = {
                pageTitle : 'Error in data.json'
            };
        }

        db = data;

        done();
    });
});

/**
 * обновление данных для шаблонов
 * пересборка шаблонов с новыми данными
 */
gulp.task('refresh-data', (cb) => {
    runSequence('get-data', 'handlebars', cb);
});


/**
 * сборка стилей блоков, для каждого отдельный css
 */
gulp.task('stylus:blocks', function() {

    return gulp.src([settings.paths.blocks + '/**/*.styl'])
        .pipe($.plumber())
        .pipe($.stylus({
            'include css' : true
        }))
        .pipe($.autoprefixer())
        .pipe($.groupCssMediaQueries())
        .pipe(gulp.dest(function(file) {
            return file.base;
        }));
});

/**
 * СТИЛИ ПАГИНОВ
 */
gulp.task('styles:plugins', () => {
    return gulp.src([
            settings.paths.styles + '/libs/_variables.styl',
            settings.paths.plugins + '/**/*.css',
            settings.paths.plugins + '/**/*.styl'
        ])
        .pipe($.plumber({errorHandler: onError}))
        .pipe(
            $.stylus({
                'include css': true
            })
        )
        .pipe($.concat('plugins.min.css'))
        .pipe($.autoprefixer())
        .pipe($.csso())
        .pipe(gulp.dest(settings.paths.storage + settings.base.styles))
        .pipe($.if(!isRelease, browserSync.stream()));
});

/**
 * СТИЛИ ОСНОВНЫЕ
 */
gulp.task('styles:main', () => {
    return gulp.src([
            settings.paths.styles + '/libs/**/*.styl',
            settings.paths.styles + '/*.styl',
            settings.paths.blocks + '/**/*.styl'
        ])
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.concat('app.styl'))
        .pipe(
            $.stylus({
                'include css': true
            })
        )
        .pipe($.autoprefixer(settings.app.autoprefixer))
        .pipe($.groupCssMediaQueries())
        .pipe(gulp.dest(settings.paths.storage + settings.base.styles))
        .pipe($.if(isRelease, $.csso()))
        .pipe($.if(isRelease, $.rename({suffix: '.min'})))
        .pipe($.if(isRelease, gulp.dest(settings.paths.storage + settings.base.styles)))
        .pipe(browserSync.stream());
});

gulp.task('css:main:dist', () => {
    return gulp.src([
            settings.paths.styles + '/libs/**/*.styl',
            settings.paths.styles + '/*.styl',
            settings.paths.blocks + '/**/*.styl'
        ])
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.concat('app.styl'))
        .pipe(
            $.stylus({
                'include css': true
            })
        )
        .pipe($.autoprefixer(settings.app.autoprefixer))
        .pipe($.groupCssMediaQueries())
        .pipe(gulp.dest(settings.paths.storage + settings.base.styles))
        .pipe($.csso())
        .pipe($.rename({suffix: '.min'}))
        .pipe(gulp.dest(settings.paths.storage + settings.base.styles));
});

/**
 * СКРИПТЫ ВЕНДОРНЫЕ
 */
gulp.task('scripts:vendor', () => {

    return gulp.src([settings.paths.scripts.vendor + '/**/*.js'])
        .pipe($.plumber({errorHandler: onError}))
        .pipe(gulp.dest(settings.paths.storage + settings.base.scripts + '/vendor'));
});

/**
 * СКРИПТЫ ПЛАГИНОВ
 */
gulp.task('scripts:plugins', () => {
    return gulp.src([settings.paths.plugins + '/**/*.js'])
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.concat('plugins.min.js'))
        .pipe($.uglify())
        .pipe(gulp.dest(settings.paths.storage + settings.base.scripts));
});

/**
 * СКРИПТЫ ПРОЧИЕ
 */
gulp.task('scripts:others', function() {

    return gulp.src([settings.paths.scripts.main + '/others/*.js'])
        .pipe($.plumber({errorHandler: onError}))
        .pipe(gulp.dest(settings.paths.storage + settings.base.scripts))
});

gulp.task('js:others:dist', function() {

    return gulp.src([settings.paths.scripts.main + '/others/*.js'])
        .pipe($.plumber({errorHandler: onError}))
        .pipe(
            $.jsPrettify({
                indent_size: 4,
                indent_char: " ",
                eol: "\n",
                collapseWhitespace: true
            })
        )
        .pipe(gulp.dest(settings.paths.storage + settings.base.scripts))
        .pipe($.uglify())
        .pipe($.rename({suffix: '.min'}))
        .pipe(gulp.dest(settings.paths.storage + settings.base.scripts));
});

/**
 * СКРИПТЫ ОСНОВНЫЕ
 */
gulp.task('scripts:main', (done) => {

    let stream = gulp.src([
            settings.paths.scripts.main + '/*.js',
            settings.paths.blocks + '/**/*.js',
            '!' + settings.paths.scripts + '/**/_*.*'
        ])
        .pipe($.plumber())
        .pipe($.concat('main.js'))
        .pipe($.wrap('$(document).ready(function(){\n\n"use strict";\n\n<%= contents %>\n});'))
        .pipe(gulp.dest(settings.paths.storage + settings.base.scripts));

    stream.on('end', () => {
        browserSync.reload();
        done();
    });

    stream.on('error', (err) => {
        done(err);
    });
});

gulp.task('js:main:dist', function() {

    return gulp.src([
            settings.paths.scripts.main + '/*.js',
            settings.paths.blocks + '/**/*.js',
            '!' + settings.paths.scripts + '/**/_*.*'
        ])
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.concat('main.js'))
        .pipe($.wrap('$(document).ready(function(){\n\n"use strict";\n\n<%= contents %>\n});'))
        .pipe(
            $.jsPrettify({
                indent_size: 4,
                indent_char: " ",
                eol: "\n",
                collapseWhitespace: true
            })
        )
        .pipe(gulp.dest(settings.paths.storage + settings.base.scripts))
        .pipe($.uglify())
        .pipe($.rename({suffix: '.min'}))
        .pipe(gulp.dest(settings.paths.storage + settings.base.scripts));

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
    $.watch(path.join(settings.paths.static, '**', '*.*'), $.batch((events, done) => {
        gulp.start('build:static', done);
    }));

    /* ICONIZER */
    $.watch(settings.paths.iconizer.icons + '/*.svg', $.batch(function (events, done) {
        gulp.start('build:iconizer:refresh', done);
    }));



    /* СТИЛИ */
    // $.watch(settings.paths.plugins + '/**/*.css', $.batch((events, done) => {
    //     gulp.start('styles:plugins', done);
    // }));
    // $.watch(settings.paths.styles + '/**/*.{styl,css}', $.batch((events, done) => {
    //     gulp.start('styles:main', done);
    // }));
    // $.watch(settings.paths.blocks + '/**/*.{styl,css}', $.batch((events, done) => {
    //     gulp.start('styles:main', done);
    // }));

    /* СКРИПТЫ */
    // $.watch(settings.paths.scripts.vendor + '/**/*.js', $.batch((events, done) => {
    //     gulp.start('scripts:vendor', done);
    // }));
    // $.watch(settings.paths.plugins + '/**/*.js', $.batch((events, done) => {
    //     gulp.start('scripts:plugins', done);
    // }));
    // $.watch(settings.paths.scripts.main + '/*.js', $.batch((events, done) => {
    //     gulp.start('scripts:main', done);
    // }));
    // $.watch(settings.paths.scripts.main + '/others/*.js', $.batch((events, done) => {
    //     gulp.start('scripts:others', done);
    // }));
    // $.watch(settings.paths.blocks + '/**/*.js', $.batch((events, done) => {
    //     gulp.start('scripts:main', done);
    // }));

    /* ШАБЛОНЫ */
    // $.watch(settings.paths.pages + '/**/*.{hbs,handlebars}', $.batch((events, done) => {
    //     gulp.start('handlebars', done);
    // }));
    // $.watch(settings.paths.blocks + '/**/*.{hbs,handlebars}', $.batch((events, done) => {
    //     gulp.start('handlebars', done);
    // }));



    /* ДАННЫЕ ДЛЯ ШАБЛОНОВ */
    // $.watch(settings.paths.assets + '/data.json', $.batch((events, done) => {
    //     gulp.start('refresh-data', done);
    // }));

    /* КАРТИНКИ БЛОКОВ*/
    // $.watch(settings.paths.blocks + '/**/*.{jpg,png,gif,svg,bmp}', $.batch((events, done) => {
    //     gulp.start('blocks:images', done);
    // }));

});

/**
 * СТАТИКА
 */
gulp.task('build:static', function(done) {

    let stream = gulp.src(settings.paths.static + '/**/*.*')
        .pipe($.plumber())
        .pipe($.changed(settings.paths.dist))
        .pipe($.logger({
            before     : '[static] starting',
            after      : '[static] complete',
            showChange : true,
            display    : 'name'
        }))
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

gulp.task('marmelad:start', function(done) {

    runSequence(
        'build:clean',
        'build:server',
        'build:static',
        // 'get-data',
        'build:iconizer',
        //'handlebars',
        //'stylus:blocks',
        // 'styles:plugins',
        // 'styles:main',
        // 'scripts:vendor',
        // 'scripts:plugins',
        // 'scripts:others',
        // 'scripts:main',
        // 'blocks:images',
        'watch',
        done);
});

gulp.task('registerHbsHelpers', function(done) {

    /**
     * Регистрация кастомных хелперов для Handlebars
     */
    const hbsHelpers = requireDir(process.cwd() + '/assets/helpers');

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

let init = () => {

    fs.exists('assets/marmelad.settings.js', (exist) => {

        if (exist) {

            settings = require(path.join(process.cwd(), 'assets', 'marmelad.settings.js'));

            settings.app.package = pkg;

            gulp.start('marmelad:start');

        } else {
            gulp.start('marmelad:init');
        }

    });
};


init();
