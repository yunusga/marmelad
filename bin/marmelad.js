#!/usr/bin/env node

'use strict';

const fs            = require('fs');
const jsonfile      = require('jsonfile');
const gulp          = require('gulp');
const logger        = require('../modules/logger')(gulp);
const $             = require('gulp-load-plugins')();
const runSequence   = require('run-sequence');
const pipeErrorStop = require('pipe-error-stop');
const del           = require('del');
const hbsLayouts    = require('handlebars-layouts');
const notifier      = require('node-notifier');
const svgMix       = require('../modules/gulp-svg-mix');
const browserSync  = require('browser-sync').create();

/**
 * конфиг по умолчанию
 */
let config = require('../modules/config');

/**
 * данные для шаблонов
 */
let db = {
    pageTitle : 'Marmelad project'
};

/**
 * обработчик ошибок для plumber
 */
let onError = function (err) {

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
 * хелпер сравнения, аля if
 */
$.compileHandlebars.Handlebars.registerHelper('compare', function(lvalue, rvalue, options) {

    if (arguments.length < 3)
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

    var operator = options.hash.operator || "==";

    var operators = {
        '=='     : function(l,r) { return l == r; },
        '==='    : function(l,r) { return l === r; },
        '!='     : function(l,r) { return l != r; },
        '<'      : function(l,r) { return l < r; },
        '>'      : function(l,r) { return l > r; },
        '<='     : function(l,r) { return l <= r; },
        '>='     : function(l,r) { return l >= r; },
        'typeof' : function(l,r) { return typeof l == r; }
    }

    if (!operators[operator])
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

    var result = operators[operator](lvalue,rvalue);

    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

});

/**
 * Получение списка директорий Блоков для их подключения в шаблоны
 *
 * @author Yunus Gaziev <yunus.gaziev@gmail.com>
 * @param dest {String} путь до папки в которой лежат блоки
 * @returns {Array} массив путей до шаблонов handlebars
 */
function getPartialsPaths(dest) {

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
gulp.task('handlebars', function (done) {

    let stream = gulp.src([
            config.paths.pages + '/**/*.{hbs,handlebars}',
            '!' + config.paths.pages + '/**/_*.{hbs,handlebars}'
        ])
        .pipe($.plumber({errorHandler: onError}))
        .pipe(
            $.compileHandlebars(db, {
                ignorePartials: false,
                batch: getPartialsPaths(config.paths.blocks)
            })
        )
        .on('error', $.notify.onError({title: 'Handlebars'}))
        .pipe(pipeErrorStop()) // на случай если handlebars сломается, иначе таск останавливается
        .pipe($.beml(config.app.beml))
        .pipe(svgMix({path: config.paths.svg + '/sprite.svg'}))
        .pipe($.prettify({indent_size: 4}))
        .pipe($.rename({extname: '.html'}))
        .pipe(gulp.dest(config.paths.dist));

    stream.on('end', function () {
        browserSync.reload();
        done();
    });

    stream.on('error', function (err) {
        done(err);
    });
});


/**
 * генерация svg спрайта
 */
gulp.task('svg-sprite', function () {
    return gulp.src(config.paths.svg + '/icons/*.svg')
        .pipe(
            $.svgSprite({
                mode: {
                    symbol: { // symbol mode to build the SVG
                        dest: config.paths.svg, // destination folder
                        sprite: 'sprite.svg', //sprite name
                        example: true // Build sample page
                    }
                },
                svg: {
                    xmlDeclaration: false, // strip out the XML attribute
                    doctypeDeclaration: false // don't include the !DOCTYPE declaration
                }
            })
        )
        .pipe(gulp.dest('.'));
});

/**
 * обновляет svg спрайт
 * пересборка шаблонов
 */
gulp.task('refresh-svg', function (cb) {
    runSequence('svg-sprite', 'handlebars', cb);
});

/**
 * обновление данных для шаблонов
 */
gulp.task('get-data', function(done) {

    jsonfile.readFile(config.paths.assets + '/data.json', function (error, data) {

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
gulp.task('refresh-data', function(cb) {
    runSequence('get-data', 'handlebars', cb);
});


/**
 * СТИЛИ ПАГИНОВ
 */
gulp.task('styles:plugins', function () {
    return gulp.src([
            config.paths.styles + '/libs/_variables.styl',
            config.paths.plugins + '/**/*.css',
            config.paths.plugins + '/**/*.styl'
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
        .pipe(gulp.dest(config.paths.storage + config.base.styles))
        .pipe(browserSync.stream());
});

/**
 * СТИЛИ ОСНОВНЫЕ
 */
gulp.task('styles:main', function () {
    return gulp.src([
            config.paths.styles + '/libs/_variables.styl',
            config.paths.styles + '/libs/_mixins.styl',
            config.paths.styles + '/libs/_normalize.styl',
            config.paths.styles + '/*.styl',
            config.paths.blocks + '/**/*.styl'
        ])
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.concat('main.styl'))
        .pipe(
            $.stylus({
                'include css': true
            })
        )
        .pipe($.autoprefixer(config.app.autoprefixer))
        .pipe(gulp.dest(config.paths.storage + config.base.styles))
        .pipe(browserSync.stream());
});

/**
 * СКРИПТЫ ВЕНДОРНЫЕ
 */
gulp.task('scripts:vendor', function () {
    return gulp.src([config.paths.scripts.vendor + '/**/*.js'])
        .pipe($.plumber({errorHandler: onError}))
        .pipe(gulp.dest(config.paths.storage + config.base.scripts + '/vendor'));
});

/**
 * СКРИПТЫ ПЛАГИНОВ
 */
gulp.task('scripts:plugins', function () {
    return gulp.src([config.paths.plugins + '/**/*.js'])
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.concat('plugins.min.js'))
        .pipe($.uglify())
        .pipe(gulp.dest(config.paths.storage + config.base.scripts));
});

/**
 * СКРИПТЫ ОСНОВНЫЕ
 */
gulp.task('scripts:main', function (done) {
    let stream = gulp.src([
            config.paths.scripts.main + '/*.js',
            config.paths.blocks + '/**/*.js',
            '!' + config.paths.scripts + '/**/_*.*'
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
        .pipe(gulp.dest(config.paths.storage + config.base.scripts));

    stream.on('end', function () {
        browserSync.reload();
        done();
    });

    stream.on('error', function (err) {
        done(err);
    });
});

/**
 * перекладываем картинки
 */
gulp.task('images', function (done) {

    let stream = gulp.src(config.paths.images.src + '/**/*')
        .pipe($.plumber({errorHandler: onError}))
        .pipe(gulp.dest(config.paths.images.dest));

    stream.on('end', function () {
        browserSync.reload();
        done();
    });

    stream.on('error', function (err) {
        done(err);
    });
});

/**
 * перекладываем прочие файлы
 */
gulp.task('files', function (done) {

    let stream = gulp.src(config.paths.files.src + '/**/*')
        .pipe($.plumber({errorHandler: onError}))
        .pipe(gulp.dest(config.paths.files.dest));

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
gulp.task('clean', function () {
    del('dist');
});

gulp.task('watch', function () {

    /* СТИЛИ */
    $.watch([config.paths.plugins + '/**/*.css'], ['styles:plugins']);
    $.watch([config.paths.styles + '/**/*.{styl,css}', config.paths.blocks + '/**/*.{styl,css}'], ['styles:main']);

    /* СКРИПТЫ */
    $.watch([config.paths.scripts.vendor + '/**/*.js'], ['scripts:vendor']);
    $.watch([config.paths.plugins + '/**/*.js'], ['scripts:plugins']);
    $.watch([config.paths.scripts.main + '/*.js', config.paths.blocks + '/**/*.js'], ['scripts:main']);

    /* ШАБЛОНЫ */
    $.watch([config.paths.pages + '/**/*.{hbs,handlebars}', config.paths.blocks + '/**/*.{hbs,handlebars}'], ['handlebars']);

    /* SVG-ИКОНКИ */
    $.watch([config.paths.svg + '/icons/*.svg'], ['refresh-svg']);

    /* ДАННЫЕ ДЛЯ ШАБЛОНОВ */
    $.watch([config.paths.assets + '/data.json'], ['refresh-data']);

    /* КАРТИНКИ ДЛЯ САЙТА*/
    $.watch(config.paths.images.src + '/**', ['images']);

    /* ФАЙЛЫ ДЛЯ САЙТА*/
    $.watch(config.paths.files.src + '/**', ['files']);

});

gulp.task('server', function () {

    browserSync.init({
        server: {
            baseDir: config.base.dist
        },
        plugins: ['bs-latency'],
        port: 5200,
        open: false,
        directory: true,
        ghostMode: false,
        notify: true
    });

});

gulp.task('startup', function (cb) {
    runSequence(
        'clean',
        'server',
        'get-data',
        'refresh-svg',
        'styles:plugins',
        'styles:main',
        'scripts:vendor',
        'scripts:plugins',
        'scripts:main',
        'images',
        'files',
        'watch',
        cb);
});


/**
 * создание файла конфигурации проекта
 */
gulp.task('writeConfiguration', function (done) {

    jsonfile.writeFile('marmelad.json', config, {spaces: 4}, function (err) {
        if (err) {
            $.util.log(err);
            done();
        } else {
            $.util.log('Configuration create success');
            done();
        }
    });
});


/**
 * копирование заготовки проекта
 */
gulp.task('copyAssets', function () {
    return gulp.src(__dirname.replace('bin', '') + 'assets/**/*.*')
        .pipe(gulp.dest(process.cwd() + '/assets'));
});

/**
 * копирование .editorconfig
 */
gulp.task('copyEditorconfig', function () {
    return gulp.src(__dirname.replace('bin', '') + '.editorconfig')
        .pipe(gulp.dest(process.cwd()));
});

/**
 * инициализация нового проекта
 */
gulp.task('initialize', function (done) {

    runSequence(
        'writeConfiguration',
        'copyAssets',
        'startup',
        done
    );
});

function init() {

    fs.exists('marmelad.json', function (exist) {

        if (exist) {
            gulp.start('startup');
        } else {
            gulp.start('initialize');
        }

    });
}


init();
