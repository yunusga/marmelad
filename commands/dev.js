const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const gulp = require('gulp');
const bsSP = require('browser-sync').create();
const tap = require('gulp-tap');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const frontMatter = require('gulp-front-matter');
const postHTML = require('gulp-posthtml');
const svgSprite = require('gulp-svg-sprite');
const stylus = require('gulp-stylus');
const postcss = require('gulp-postcss');
const flexBugsFixes = require('postcss-flexbugs-fixes');
const momentumScrolling = require('postcss-momentum-scrolling');
const inlineSvg = require('postcss-inline-svg');
const autoprefixer = require('autoprefixer');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const sourcemaps = require('gulp-sourcemaps');
const gif = require('gulp-if');
const LOG = require('fancy-log');
const plumber = require('gulp-plumber');
const groupMQ = require('gulp-group-css-media-queries');
const changed = require('gulp-changed');
const concat = require('gulp-concat');
const include = require('gulp-include');
const decache = require('decache');
const pipeErrorStop = require('pipe-error-stop');
const del = require('del');
const GLOB = require('glob');
const PERF = require('execution-time')();

const pkg = require('../package.json');
const iconizer = require('../modules/gulp-iconizer');
const nunjucks = require('../modules/nunjucks');
const TCI = require('../modules/tci');
const DB = new (require('../modules/database'))();

// const getAuthParams = params => (typeof params !== 'string' ? [pkg.name, false] : params.split('@'));

const getIconsNamesList = (iconPath) => {
  let iconsList = [];

  if (fs.existsSync(iconPath)) {
    iconsList = fs.readdirSync(iconPath).map(iconName => iconName.replace(/.svg/g, ''));
  }

  return iconsList;
};
const getNunJucksBlocks = blocksPath => fs.readdirSync(blocksPath).map(el => `${blocksPath}/${el}`);

/**
 * Проверка правильности установки логина и пароля для авторизации
 */
// bsSP.use(require('bs-auth'), {
//     user : getAuthParams(CLI.auth)[0],
//     pass : getAuthParams(CLI.auth)[1],
//     use  : CLI.auth
// });

const settings = require(`${process.cwd()}/marmelad/settings.marmelad`);
let isNunJucksUpdate = false;

module.exports = (/* opts */) => {
  TCI.run();

  /**
     * NUNJUCKS
     */
  gulp.task('nunjucks', (done) => {
    let templateName = '';
    let error = false;

    PERF.start('nunjucks');

    const stream = gulp.src(`${settings.paths._pages}/**/*.html`)
      .pipe(plumber())
      .pipe(gif(!isNunJucksUpdate, changed(settings.paths.dist)))
      .pipe(tap((file) => {
        templateName = path.basename(file.path);
      }))
      .pipe(frontMatter())
      .pipe(nunjucks({
        searchPaths: getNunJucksBlocks(settings.paths._blocks),
        locals: DB.store,
        ext: '.html',
        setUp(env) {
          env.addFilter('translit', require('../modules/nunjucks/filters/translit'));
          env.addFilter('limitto', require('../modules/nunjucks/filters/lomitto'));
          env.addFilter('bodyClass', require('../modules/nunjucks/filters/bodyclass'));
          return env;
        },
      }))
      .pipe(pipeErrorStop({
        errorCallback: (err) => {
          error = true;
          console.log(`\n${err.name}: ${err.message.replace(/(unknown path)/, templateName)}\n`);
        },
        successCallback: () => {
          error = false;
          isNunJucksUpdate = false;
        },
      }))
      .pipe(iconizer({
        path: `${settings.paths.iconizer.src}/sprite.svg`,
        _beml: settings.app.beml,
      }))
      .pipe(postHTML([
        require('posthtml-bem')(settings.app.beml),
      ]))
      .pipe(gulp.dest(settings.paths.dist));

    stream.on('end', () => {
      LOG(`[nunjucks] ${error ? chalk.bold.red('ERROR\n') : chalk.bold.green('done')} in ${PERF.stop('nunjucks').time.toFixed(0)}ms`);

      bsSP.reload();
      done();
    });

    stream.on('error', (err) => {
      done(err);
    });
  });

  gulp.task('database', (done) => {
    DB.onError = (blockPath, error) => {
      LOG.error(chalk.bold.red(blockPath));
      LOG.error(error.message);
    };

    [`${settings.paths._blocks}/**/*.json`].forEach((paths) => {
      DB.create(GLOB.sync(paths));
    });

    DB.combine(require(`${process.cwd()}/${settings.folders.marmelad}/data.marmelad.js`));

    DB.combine({
      package: pkg,
      storage: settings.folders.storage,
      icons: getIconsNamesList(settings.paths.iconizer.icons),
      settings,
    }, 'app');

    done();
  });

  /**
     * Iconizer
     */
  gulp.task('iconizer', (done) => {
    const stream = gulp.src(`${settings.paths.iconizer.icons}/*.svg`)
      .pipe(svgSprite(settings.app.svgSprite))
      .pipe(gulp.dest('.'));

    stream.on('end', () => {
      DB.combine({
        icons: getIconsNamesList(settings.paths.iconizer.icons),
      }, 'app');

      LOG(`Iconizer ............................ ${chalk.bold.green('Done')}`);

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

    gulp.series('iconizer', 'nunjucks')(done);
  });


  /**
     * scripts from blocks
     */
  gulp.task('scripts:others', (done) => {
    const stream = gulp.src(`${settings.paths.js.src}/*.js`)
      .pipe(plumber())
      .pipe(include({
        extensions: 'js',
        hardFail: false,
      })).on('error', LOG)
      .pipe(babel({
        presets: ['@babel/preset-env'].map(require.resolve),
        plugins: ['@babel/plugin-transform-object-assign'].map(require.resolve),
      }))
      .pipe(gulp.dest(`${settings.paths.storage}/${settings.folders.js.src}`));

    stream.on('end', () => {
      LOG(`Scripts others ...................... ${chalk.bold.green('Done')}`);
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
    const vendorsDist = `${settings.paths.storage}/${settings.folders.js.src}/${settings.folders.js.vendors}`;

    const stream = gulp.src(`${settings.paths.js.vendors}/**/*.js`)
      .pipe(plumber())
      .pipe(changed(vendorsDist))
      .pipe(gulp.dest(vendorsDist));

    stream.on('end', () => {
      LOG(`Scripts vendors ..................... ${chalk.bold.green('Done')}`);
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
    const stream = gulp.src(`${settings.paths.js.plugins}/**/*.js`)
      .pipe(plumber())
      .pipe(concat('plugins.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest(`${settings.paths.storage}/${settings.folders.js.src}`));

    stream.on('end', () => {
      LOG(`Scripts plugins ..................... ${chalk.bold.green('Done')}`);
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
    gulp.src(`${settings.paths.js.plugins}/**/*.css`)
      .pipe(plumber())
      .pipe(concat('plugins.min.css'))
      .pipe(groupMQ())
      .pipe(postcss([
        momentumScrolling(),
        flexBugsFixes(),
      ], { from: undefined }))
      .pipe(gulp.dest(`${settings.paths.storage}/css`))
      .on('end', () => {
        LOG(`Plugins CSS ......................... ${chalk.bold.green('Done')}`);
      })
      .pipe(bsSP.stream());

    done();
  });

  /**
     * сборка стилей блоков, для каждого отдельный css
     */

  gulp.task('styles', (done) => {
    const $data = {
      beml: settings.app.beml,
    };

    Object.assign($data, DB.store.app.stylus);

    gulp.src(`${settings.paths.styles}/*.{styl,scss,sass}`)
      .pipe(plumber())
      .pipe(gif('*.styl', stylus({
        'include css': true,
        rawDefine: { $data },
      })))
      .pipe(gif('*.scss', sassGlob()))
      .pipe(gif('*.scss', sass()))
      .pipe(gif('*.sass', sass({
        indentedSyntax: true,
      })))
      .pipe(groupMQ())
      .pipe(postcss([
        momentumScrolling(),
        flexBugsFixes(),
        inlineSvg(settings.app.postcss.inlineSvg),
        require('postcss-easing-gradients')(settings.app.postcss.easingGradients),
        autoprefixer(settings.app.autoprefixer),
      ], { from: undefined }))
      .pipe(gulp.dest(`${settings.paths.storage}/css`))
      .on('end', () => {
        LOG(`Styles CSS .......................... ${chalk.bold.green('Done')}`);
      })
      .pipe(bsSP.stream());

    done();
  });

  /**
     * СТАТИКА
     */
  gulp.task('static', (done) => {
    const stream = gulp.src([
      `${settings.paths.static}/**/*.*`,
      `!${settings.paths.static}/**/Thumbs.db`,
      `!${settings.paths.static}/**/*tmp*`,
    ])
      .pipe(plumber())
      .pipe(changed(settings.paths.storage))
      .pipe(gulp.dest(settings.paths.storage));

    stream.on('end', () => {
      LOG(`Static files copy ................... ${chalk.bold.green('Done')}`);
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
      // let urls = bsSP.getOption('urls');
      // let bsAuth = bsSP.getOption('bsAuth');
      // let authString = '';

      // if (bsAuth && bsAuth.use) {
      //   authString = `\n  user: ${bsAuth.user}\npass: ${bsAuth.pass}`;
      // }

      // console.log(authString);

      done();
    });
  });

  /** ^^^
     * Bootstrap 4 tasks
     ==================================================================== */
  gulp.task('bootstrap', (done) => {
    if (settings.app.bts.use || settings.app.bts.donor) {
      if (settings.app.bts.donor) {
        settings.app.bts['4'].dest.js = `${settings.paths.storage}/${settings.folders.js.src}/${settings.folders.js.vendors}`;
        gulp.series('bts4:js')();
      } else {
        gulp.series('bts4:sass', 'bts4:js')();
      }
    }

    done();
  });

  gulp.task('bts4:sass', (done) => {
    gulp.src(`${settings.app.bts['4'].src.css}/scss/[^_]*.scss`)
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(sass(settings.app.bts['4'].sass))
      .pipe(postcss([
        momentumScrolling(),
        autoprefixer(settings.app.bts['4'].autoprefixer),
      ]))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(settings.app.bts['4'].dest.css))
      .on('end', () => {
        LOG(`Bootstrap ${settings.app.bts['4'].code} SASS ........... ${chalk.bold.green('Done')}`);
      })
      .pipe(bsSP.stream());

    done();
  });

  gulp.task('bts4:js', (done) => {
    const stream = gulp.src(`${settings.app.bts['4'].src.js}/**/*.js`)
      .pipe(plumber())
      .pipe(changed(settings.app.bts['4'].dest.js))
      .pipe(gif(settings.app.bts.donor, rename({ dirname: '' }))) // rename({ dirname: '' })
      .pipe(gulp.dest(settings.app.bts['4'].dest.js));

    stream.on('end', () => {
      LOG(`Bootstrap ${settings.app.bts['4'].code} JS ............. ${chalk.bold.green('Done')}`);
      bsSP.reload();
      done();
    });

    stream.on('error', (err) => {
      done(err);
    });
  });

  gulp.task('watch', (done) => {
    const watchOpts = Object.assign({
      ignoreInitial: true,
      ignored: [
        `${settings.folders.marmelad}/**/*.db`,
        `${settings.folders.marmelad}/**/*tmp*`,
      ],
      usePolling: false,
      cwd: process.cwd(),
    }, settings.app.watchOpts);

    if (settings.app.bts.use || settings.app.bts.donor) {
      let bsTask = '';

      if (settings.app.bts.use) {
        bsTask = 'bts4:sass';
      }

      if (settings.app.bts.donor) {
        bsTask = 'styles';
      }

      /* SCSS */
      gulp.watch(
        `${settings.app.bts['4'].src.css}/**/*.scss`,
        watchOpts,
        gulp.parallel(bsTask),
      );

      /* JS */
      gulp.watch(
        `${settings.app.bts['4'].src.js}/**/*.js`,
        watchOpts,
        gulp.parallel('bts4:js'),
      );
    }

    /* СТАТИКА */
    gulp.watch(
      `${settings.paths.static}/**/*.*`,
      watchOpts,
      gulp.parallel('static'),
    );

    /* STYLES */
    gulp.watch([
      `${settings.paths._blocks}/**/*.{styl,scss,sass}`,
      `${settings.paths.styles}/**/*.{styl,scss,sass}`,
    ], watchOpts, gulp.parallel('styles'));

    /* СКРИПТЫ */
    gulp.watch(
      `${settings.paths.js.vendors}/**/*.js`,
      watchOpts,
      gulp.parallel('scripts:vendors'),
    );

    gulp.watch(
      `${settings.paths.js.plugins}/**/*.js`,
      watchOpts,
      gulp.parallel('scripts:plugins'),
    );

    gulp.watch([
      `${settings.paths.js.src}/*.js`,
      `${settings.paths._blocks}/**/*.js`,
    ], watchOpts, gulp.parallel('scripts:others'));

    gulp.watch(
      `${settings.paths.js.plugins}/**/*.css`,
      watchOpts,
      gulp.parallel('styles:plugins'),
    );

    /* NunJucks Pages */
    gulp.watch(
      `${settings.paths._pages}/**/*.html`,
      watchOpts,
      gulp.parallel('nunjucks'),
    );

    /* NunJucks Blocks */
    gulp.watch([
      `${settings.paths._blocks}/**/*.html`,
    ], watchOpts, (complete) => {
      isNunJucksUpdate = true;
      gulp.series('nunjucks')(complete);
    });

    /* NunJucks Datas */
    gulp.watch(
      `${settings.paths._blocks}/**/*.json`,
      watchOpts,
    )
      .on('change', (block) => {
        DB.update(block);
        isNunJucksUpdate = true;
        gulp.series('nunjucks')();
      })
      .on('unlink', (block) => {
        DB.delete(block);
        isNunJucksUpdate = true;
        gulp.series('nunjucks')();
      });

    try {
      /* Database */
      const dataPath = `${process.cwd()}/${settings.folders.marmelad}/data.marmelad.js`;

      gulp.watch(
        [
          dataPath,
        ],
        watchOpts, (decached) => {
          decache(dataPath);

          DB.combine(require(dataPath));
          DB.combine({
            package: pkg,
            storage: settings.folders.storage,
            icons: getIconsNamesList(settings.paths.iconizer.icons),
            settings,
          }, 'app');

          isNunJucksUpdate = true;
          gulp.series('nunjucks')(decached);
        },
      );
    } catch (error) {
      console.log(error);
    }

    /* Iconizer */
    gulp.watch(
      `${settings.paths.iconizer.icons}/*.svg`,
      watchOpts, (complete) => {
        gulp.series('iconizer:update')(complete);
      },
    );

    done();
  });

  /**
     * очищаем папку сборки перед сборкой Ж)
     */
  gulp.task('clean', (done) => {
    del.sync(settings.paths.dist);
    done();
  });

  gulp.task(
    'develop',
    gulp.series(
      'clean',
      'server:static',
      'static',
      'iconizer',
      'database',
      gulp.parallel(
        'nunjucks',
        'scripts:vendors',
        'scripts:plugins',
        'scripts:others',
        'styles:plugins',
        'styles',
        'bootstrap',
      ),
      'watch',
    ),
  );

  gulp.series('develop')();
};
