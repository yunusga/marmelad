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
const requireDir    = require('require-dir');
const hbsLayouts    = require('handlebars-layouts');
const notifier      = require('node-notifier');
const svgMix        = require('../modules/gulp-svg-mix');
const browserSync   = require('browser-sync').create();
const pkg           = require('../package.json');

/**
 * конфиг по умолчанию
 */
let config = require('../modules/config');


/**
 * фдаг финальная сборка
 */
let isRelease = false;

config.app.browserSync.server.baseDir = config.base.dist;
config.version = pkg.version;
config.name    = pkg.name;
config.description = pkg.description;

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
gulp.task('svg-sprite', () => {

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
gulp.task('refresh-svg', (cb) => {
    runSequence('svg-sprite', 'handlebars', cb);
});

/**
 * обновление данных для шаблонов
 */
gulp.task('get-data', (done) => {

    jsonfile.readFile(config.paths.assets + '/data.json', (error, data) => {

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
 * СТИЛИ ПАГИНОВ
 */
gulp.task('styles:plugins', () => {
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
        .pipe($.if(!isRelease, browserSync.stream()));
});

/**
 * СТИЛИ ОСНОВНЫЕ
 */
gulp.task('styles:main', () => {
    return gulp.src([
            config.paths.styles + '/libs/**/*.styl',
            config.paths.styles + '/*.styl',
            config.paths.blocks + '/**/*.styl'
        ])
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.concat('app.styl'))
        .pipe(
            $.stylus({
                'include css': true
            })
        )
        .pipe($.autoprefixer(config.app.autoprefixer))
        .pipe($.groupCssMediaQueries())
        .pipe(gulp.dest(config.paths.storage + config.base.styles))
        .pipe($.if(isRelease, $.csso()))
        .pipe($.if(isRelease, $.rename({suffix: '.min'})))
        .pipe($.if(isRelease, gulp.dest(config.paths.storage + config.base.styles)))
        .pipe(browserSync.stream());
});

gulp.task('css:main:dist', () => {
    return gulp.src([
            config.paths.styles + '/libs/**/*.styl',
            config.paths.styles + '/*.styl',
            config.paths.blocks + '/**/*.styl'
        ])
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.concat('app.styl'))
        .pipe(
            $.stylus({
                'include css': true
            })
        )
        .pipe($.autoprefixer(config.app.autoprefixer))
        .pipe($.groupCssMediaQueries())
        .pipe(gulp.dest(config.paths.storage + config.base.styles))
        .pipe($.csso())
        .pipe($.rename({suffix: '.min'}))
        .pipe(gulp.dest(config.paths.storage + config.base.styles));
});

/**
 * СКРИПТЫ ВЕНДОРНЫЕ
 */
gulp.task('scripts:vendor', () => {

    return gulp.src([config.paths.scripts.vendor + '/**/*.js'])
        .pipe($.plumber({errorHandler: onError}))
        .pipe(gulp.dest(config.paths.storage + config.base.scripts + '/vendor'));
});

/**
 * СКРИПТЫ ПЛАГИНОВ
 */
gulp.task('scripts:plugins', () => {
    return gulp.src([config.paths.plugins + '/**/*.js'])
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.concat('plugins.min.js'))
        .pipe($.uglify())
        .pipe(gulp.dest(config.paths.storage + config.base.scripts));
});

/**
 * СКРИПТЫ ПРОЧИЕ
 */
gulp.task('scripts:others', function() {

    return gulp.src([config.paths.scripts.main + '/others/*.js'])
        .pipe($.plumber({errorHandler: onError}))
        .pipe(gulp.dest(config.paths.storage + config.base.scripts))
});

gulp.task('js:others:dist', function() {

    return gulp.src([config.paths.scripts.main + '/others/*.js'])
        .pipe($.plumber({errorHandler: onError}))
        .pipe(
            $.jsPrettify({
                indent_size: 4,
                indent_char: " ",
                eol: "\n",
                collapseWhitespace: true
            })
        )
        .pipe(gulp.dest(config.paths.storage + config.base.scripts))
        .pipe($.uglify())
        .pipe($.rename({suffix: '.min'}))
        .pipe(gulp.dest(config.paths.storage + config.base.scripts));
});

/**
 * СКРИПТЫ ОСНОВНЫЕ
 */
gulp.task('scripts:main', (done) => {

    let stream = gulp.src([
            config.paths.scripts.main + '/*.js',
            config.paths.blocks + '/**/*.js',
            '!' + config.paths.scripts + '/**/_*.*'
        ])
        .pipe($.plumber({errorHandler: onError}))
        .pipe($.concat('main.js'))
        .pipe($.wrap('$(document).ready(function(){\n\n"use strict";\n\n<%= contents %>\n});'))
        .pipe(gulp.dest(config.paths.storage + config.base.scripts));

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
        .pipe(gulp.dest(config.paths.storage + config.base.scripts))
        .pipe($.uglify())
        .pipe($.rename({suffix: '.min'}))
        .pipe(gulp.dest(config.paths.storage + config.base.scripts));

});

/**
 * перекладываем картинки
 */
gulp.task('images', (done) => {

    let stream = gulp.src(config.paths.images.src + '/**/*')
        .pipe($.plumber({errorHandler: onError}))
        .pipe(gulp.dest(config.paths.images.dest));

    stream.on('end', () => {
        browserSync.reload();
        done();
    });

    stream.on('error', (err) => {
        done(err);
    });
});

/**
 * перекладываем шрифты
 */
gulp.task('font', (done) => {

    let stream = gulp.src(config.paths.font.src + '/**/*')
        .pipe($.plumber({errorHandler: onError}))
        .pipe(gulp.dest(config.paths.font.dest));

    stream.on('end', () => {
        browserSync.reload();
        done();
    });

    stream.on('error', (err) => {
        done(err);
    });
});

/**
 * перекладываем прочие файлы
 */
gulp.task('files', (done) => {

    let stream = gulp.src(config.paths.files.src + '/**/*')
        .pipe($.plumber({errorHandler: onError}))
        .pipe(gulp.dest(config.paths.files.dest));

    stream.on('end', () => {
        browserSync.reload();
        done();
    });

    stream.on('error', (err) => {
        done(err);
    });
});

/**
 * очищаем папку сборки перед сборкой Ж)
 */
gulp.task('clean', () => {
    del('dist');
});

gulp.task('watch', () => {

    /* СТИЛИ */
    $.watch(config.paths.plugins + '/**/*.css', $.batch((events, done) => {
        gulp.start('styles:plugins', done);
    }));
    $.watch(config.paths.styles + '/**/*.{styl,css}', $.batch((events, done) => {
        gulp.start('styles:main', done);
    }));
    $.watch(config.paths.blocks + '/**/*.{styl,css}', $.batch((events, done) => {
        gulp.start('styles:main', done);
    }));

    /* СКРИПТЫ */
    $.watch(config.paths.scripts.vendor + '/**/*.js', $.batch((events, done) => {
        gulp.start('scripts:vendor', done);
    }));
    $.watch(config.paths.plugins + '/**/*.js', $.batch((events, done) => {
        gulp.start('scripts:plugins', done);
    }));
    $.watch(config.paths.scripts.main + '/*.js', $.batch((events, done) => {
        gulp.start('scripts:main', done);
    }));
    $.watch(config.paths.scripts.main + '/others/*.js', $.batch((events, done) => {
        gulp.start('scripts:others', done);
    }));
    $.watch(config.paths.blocks + '/**/*.js', $.batch((events, done) => {
        gulp.start('scripts:main', done);
    }));

    /* ШАБЛОНЫ */
    $.watch(config.paths.pages + '/**/*.{hbs,handlebars}', $.batch((events, done) => {
        gulp.start('handlebars', done);
    }));
    $.watch(config.paths.blocks + '/**/*.{hbs,handlebars}', $.batch((events, done) => {
        gulp.start('handlebars', done);
    }));

    /* SVG-ИКОНКИ */
    $.watch(config.paths.svg + '/icons/*.svg', $.batch((events, done) => {
        gulp.start('refresh-svg', done);
    }));

    /* ДАННЫЕ ДЛЯ ШАБЛОНОВ */
    $.watch(config.paths.assets + '/data.json', $.batch((events, done) => {
        gulp.start('refresh-data', done);
    }));

    /* КАРТИНКИ ДЛЯ САЙТА*/
    $.watch(config.paths.images.src + '/**', $.batch((events, done) => {
        gulp.start('images', done);
    }));

    /* ШРИФТЫ ДЛЯ САЙТА*/
    $.watch(config.paths.font.src + '/**', $.batch((events, done) => {
        gulp.start('font', done);
    }));

    /* ФАЙЛЫ ДЛЯ САЙТА*/
    $.watch(config.paths.files.src + '/**', $.batch((events, done) => {
        gulp.start('files', done);
    }));

});

gulp.task('server', () => {

    browserSync.init(config.app.browserSync);

});

gulp.task('startup', (cb) => {

    runSequence(
        'clean',
        'server',
        'get-data',
        'svg-sprite',
        'handlebars',
        'styles:plugins',
        'styles:main',
        'scripts:vendor',
        'scripts:plugins',
        'scripts:others',
        'scripts:main',
        'images',
        'font',
        'files',
        'watch',
        cb);
});

gulp.task('startup:dist', (cb) => {

    runSequence(
        'clean',
        'server',
        'get-data',
        'svg-sprite',
        'handlebars',
        'styles:plugins',
        'css:main:dist',
        'scripts:vendor',
        'scripts:plugins',
        'js:others:dist',
        'js:main:dist',
        'images',
        'font',
        'files',
        cb);
});


/**
 * создание файла конфигурации проекта
 */
gulp.task('writeConfiguration', (done) => {

    jsonfile.writeFile('marmelad.json', config, {spaces: 4}, (err) => {
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
 * копирование хелперов для Handlebars
 */
gulp.task('copyHbsHelpers', () => {
    return gulp.src(__dirname.replace('bin', '') + 'assets/helpers/*.*')
        .pipe(gulp.dest(process.cwd() + '/assets/helpers'));
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
 * копирование заготовки проекта
 */
gulp.task('copyAssets', () => {
    return gulp.src(__dirname.replace('bin', '') + 'assets/**/*.*')
        .pipe(gulp.dest(process.cwd() + '/assets'));
});

/**
 * инициализация нового проекта
 */
gulp.task('initialize', (done) => {

    runSequence(
        'writeConfiguration',
        'copyAssets',
        'startup',
        done
    );
});

gulp.task('addHelpers', function(done) {

    runSequence(
        'copyHbsHelpers',
        'registerHbsHelpers',
        'startup',
        done
    );
});

gulp.task('addHelpers:dist', function(done) {

    runSequence(
        'copyHbsHelpers',
        'registerHbsHelpers',
        'startup:dist',
        done
    );
});

let init = () => {

    if (process.argv[2] == 'dist') {
        isRelease = true;
    }

    fs.exists('marmelad.json', (exist) => {

        if (exist) {
            config = require(process.cwd() + '/marmelad.json');
            config.app.version     = pkg.version;
            config.app.name        = pkg.name;
            config.app.description = pkg.description;


            fs.exists(process.cwd() + '/assets/helpers', function(exists) {

                if (!exist) {
                    isRelease ? gulp.start('startup:dist') : gulp.start('startup');
                } else {
                    isRelease ? gulp.start('addHelpers:dist') : gulp.start('addHelpers');
                }

            });


        } else {
            gulp.start('initialize');
        }

    });
}


init();
