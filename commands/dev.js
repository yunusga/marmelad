console.log('\nMarmelad Warming up...');

const { performance } = require('perf_hooks');

const fs = require('fs');
const path = require('path');

const {
  bold, green, red, yellow, bgRed,
} = require('picocolors');

const gulp = require('gulp');
const bsSP = require('browser-sync').create('Dev Server');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const postcss = require('gulp-postcss');
const flexBugsFixes = require('postcss-flexbugs-fixes');
const momentumScrolling = require('postcss-momentum-scrolling');
const inlineSvg = require('postcss-inline-svg');
const easingGradients = require('postcss-easing-gradients');
const viewportHeightCorrection = require('postcss-viewport-height-correction');
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const gif = require('gulp-if');
const plumber = require('gulp-plumber');
const combineAndSortMQ = require('postcss-sort-media-queries');
const concat = require('gulp-concat');
const GLOB = require('glob');
const pkg = require('../package.json');
const pipeErrorStop = require('../modules/pipe-error-stop');
const TCI = require('../modules/tci');
const DB = new (require('../modules/database'))();
const authArgs = require('../modules/authArgs');
const getIconsNamesList = require('../modules/iconsNames');
const getSettings = require('../modules/get-settings');

const Lagman = require('../modules/lagman');

const LAGMAN = new Lagman();

console.log(`Marmelad Warmed at ${Math.round(performance.now())}ms`);

module.exports = (opts) => {
  const settings = getSettings();

  let bsPS = null;

  const browserslistrcPath = path.join(process.cwd(), '.browserslistrc');

  if (!fs.existsSync(browserslistrcPath)) {
    console.log(`${yellow('.browserslistrc')} not found`);

    try {
      fs.writeFileSync(browserslistrcPath, settings.app.autoprefixer.overrideBrowserslist.join('\n'));
      console.log(`${green('.browserslistrc')} successful created`);
    } catch (err) {
      console.error(err);
    }
  }

  process.env.BROWSERSLIST_CONFIG = browserslistrcPath;

  if (!opts.build) {
    TCI.run();
  }

  if (opts.proxyMod) {
    bsPS = require('browser-sync').create('Proxy Server');

    /**
     * Proxy Server Auth
     */
    bsPS.use(require('bs-auth'), {
      user: authArgs(opts.auth, pkg.name)[0],
      pass: authArgs(opts.auth, pkg.name)[1],
      use: opts.auth,
    });
  }

  LAGMAN.init({
    _pages: settings.paths._pages,
    _blocks: settings.paths._blocks,
  });

  /**
   * Server Auth
   */
  bsSP.use(require('bs-auth'), {
    user: authArgs(opts.auth, pkg.name)[0],
    pass: authArgs(opts.auth, pkg.name)[1],
    use: opts.auth,
  });

  const Templater = require('../modules/nunjucks/templater');
  const templater = new Templater();

  templater.init(settings, DB.getStore());

  const gulpNunjucks = require('../modules/nunjucks/gulp');
  const gulpPostHTML = require('../modules/posthtml/gulp');
  const posthtmlBem = require('../modules/posthtml/bem');
  const getBlocksSet = require('../modules/lagman/getBlocksSet');
  const tap = require('../modules/gulp/tap');

  /**
   * Nunjucks
   */
  gulp.task('nunjucks', (done) => {
    const njkStartPerf = performance.now();

    let templateName = '';
    let hasError = false;

    const stream = gulp.src(LAGMAN.store.src)
      .pipe(plumber({
        errorHandler: (error) => {
          bsSP.sockets.emit('error:message', error);
          hasError = true;
          console.error(`[nunjucks] ошибка: проверьте шаблоны ${error.plugin}`);
          console.error(error);
        },
      }))
      .pipe(tap((file) => {
        templateName = path.basename(file.path);

        DB.set('currentPage', templateName);
      }))
      .pipe(gulpNunjucks(templater, DB.getStore()))
      .pipe(pipeErrorStop({
        errorCallback: (error) => {
          hasError = true;
          error.message = error.message.replace(/(unknown path)/, templateName);

          console.error(`\n${error.name}: ${error.message}\n`);

          bsSP.sockets.emit('error:message', error);
        },
        successCallback: () => {
          hasError = false;
        },
      }))
      .pipe(tap((file) => {
        getBlocksSet(file, (err, blocksSet) => {
          if (blocksSet) {
            const pageName = LAGMAN.getName(file.path);

            LAGMAN.refresh(pageName, 'pages', blocksSet);
          }
        });
      }))
      .pipe(gulpPostHTML([
        posthtmlBem(),
      ]))
      .pipe(rename({
        dirname: '',
      }))
      .pipe(gulp.dest(settings.paths.dist));

    stream.on('end', () => {
      console.log(`[nunjucks] ${hasError ? bold(red('ERROR')) : bold(green('done'))} in ${(performance.now() - njkStartPerf).toFixed(0)}ms`);

      if (!hasError) {
        bsSP.reload();
      }

      done();
    });

    stream.on('error', (error) => {
      bsSP.sockets.emit('error:message', error);
      console.log(error);
      done(error);
    });
  });

  gulp.task('database', (done) => {
    DB.onError = (blockPath, error) => {
      bsSP.sockets.emit('error:message', error);
      console.error(bold(red(blockPath)));
      console.error(error.message);
    };

    [`${settings.paths._blocks}/**/*.json`].forEach((paths) => {
      DB.create(GLOB.sync(paths));
    });

    DB.combine(require(`${process.cwd()}/${settings.folders.marmelad}/data.marmelad.js`));

    DB.combine({
      pathData: path.parse(process.cwd()),
      package: pkg,
      storage: settings.folders.storage,
      sprite: {
        icons: getIconsNamesList(settings.iconizer.srcIcons),
        colored: getIconsNamesList(settings.iconizer.srcColored),
      },
      settings,
    }, 'app');

    done();
  });

  /**
   * Iconizer
   */
  gulp.task('iconizer:icons', (done) => {
    const svgSprite = require('gulp-svg-sprite');
    const replace = require('gulp-replace');

    if (settings.iconizer.mode === 'external') {
      settings.iconizer.plugin.svg.doctypeDeclaration = true;
    }

    settings.iconizer.plugin.mode.symbol.sprite = 'sprite.icons.svg';

    const stream = gulp.src(`${settings.iconizer.srcIcons}/*.svg`)
      .pipe(svgSprite(settings.iconizer.plugin))
      .pipe(replace(/\n/g, ''))
      .pipe(replace(/<defs[\s\S]*?\/defs><path[\s\S]*?\s+?d=/g, '<path d='))
      .pipe(replace(/<style[\s\S]*?\/style><path[\s\S]*?\s+?d=/g, '<path d='))
      .pipe(replace(/\sfill[\s\S]*?(['"])[\s\S]*?\1/g, ''))
      .pipe(replace(/<title>[\s\S]*?<\/title>/g, ''))
      .pipe(replace(/<svg /, (match) => `${match} class="${settings.iconizer.cssClass} ${settings.iconizer.cssClass}--icons" `))
      .pipe(rename({
        dirname: '',
      }))
      .pipe(gulp.dest(settings.iconizer.dest));

    stream.on('end', () => {
      DB.combine({
        sprite: {
          icons: getIconsNamesList(settings.iconizer.srcIcons),
          colored: getIconsNamesList(settings.iconizer.srcColored),
        },
      }, 'app');

      console.log(`[iconizer] icons ${bold(green('Done'))}`);

      done();
    });

    stream.on('error', (error) => {
      bsSP.sockets.emit('error:message', error);
      console.error(error);
      done(error);
    });
  });

  gulp.task('iconizer:colored', (done) => {
    const svgSprite = require('gulp-svg-sprite');
    const replace = require('gulp-replace');

    if (settings.iconizer.mode === 'external') {
      settings.iconizer.plugin.svg.doctypeDeclaration = true;
    }

    settings.iconizer.plugin.mode.symbol.sprite = 'sprite.colored.svg';

    const stream = gulp.src(`${settings.iconizer.srcColored}/*.svg`)
      .pipe(svgSprite(settings.iconizer.plugin))
      .pipe(replace(/<title>[\s\S]*?<\/title>/g, ''))
      .pipe(replace(/<svg /, (match) => `${match} class="${settings.iconizer.cssClass} ${settings.iconizer.cssClass}--colored" `))
      .pipe(rename({
        dirname: '',
      }))
      .pipe(gulp.dest(settings.iconizer.dest));

    stream.on('end', () => {
      DB.combine({
        sprite: {
          icons: getIconsNamesList(settings.iconizer.srcIcons),
          colored: getIconsNamesList(settings.iconizer.srcColored),
        },
      }, 'app');

      console.log(`[iconizer] colored ${bold(green('Done'))}`);

      done();
    });

    stream.on('error', (error) => {
      bsSP.sockets.emit('error:message', error);
      console.log(error);
      done(error);
    });
  });

  /**
   * Iconizer update
   */
  gulp.task('iconizer:update', (done) => {
    gulp.series('iconizer:icons', 'iconizer:colored', 'nunjucks')(done);
  });

  /**
   * Scripts blocks
   */
  gulp.task('scripts:others', (done) => {
    const include = require('gulp-include');

    let hasError = false;

    const stream = gulp.src(`${settings.paths.js.src}/*.js`)
      .pipe(plumber({
        errorHandler: (error) => {
          bsSP.sockets.emit('error:message', error);
          hasError = true;

          console.error(`[scripts:others] ошибка: проверьте скрипты ${error.plugin}`);
          console.error(error.message);
        },
      }))
      .pipe(include({
        extensions: 'js',
        hardFail: false,
      })).on('error', console.log)
      .pipe(gulp.dest(`${settings.paths.storage}/${settings.folders.js.src}`));

    stream.on('end', () => {
      if (!hasError) {
        console.log(`[js] others ${bold(green('Done'))}`);
        bsSP.reload();
      }

      done();
    });

    stream.on('error', (error) => {
      done(error);
    });
  });

  /**
   * Scripts vendors
   */
  gulp.task('scripts:vendors', (done) => {
    const vendorsDist = `${settings.paths.storage}/${settings.folders.js.src}/${settings.folders.js.vendors}`;

    let hasError = false;

    const stream = gulp.src(`${settings.paths.js.vendors}/**/*.js`)
      .pipe(plumber({
        errorHandler: (error) => {
          bsSP.sockets.emit('error:message', error);
          hasError = true;

          console.error(`[scripts:vendors] ошибка: проверьте  ${error.plugin}`);
          console.error(error.message);
        },
      }))
      .pipe(gulp.dest(vendorsDist));

    stream.on('end', () => {
      if (!hasError) {
        console.log(`[js] vendors ${bold(green('Done'))}`);
        bsSP.reload();
      }

      done();
    });

    stream.on('error', (error) => {
      bsSP.sockets.emit('error:message', error);
      console.log(error);
      done(error);
    });
  });

  /**
   * Scripts plugins
   */
  gulp.task('scripts:plugins', (done) => {
    let hasError = false;

    const stream = gulp.src(`${settings.paths.js.plugins}/**/*.js`)
      .pipe(plumber({
        errorHandler: (error) => {
          bsSP.sockets.emit('error:message', error);
          hasError = true;

          console.error(`[scripts:plugins] ошибка: проверьте ${error.plugin}`);
          console.error(error.message);
        },
      }))
      .pipe(concat('plugins.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest(`${settings.paths.storage}/${settings.folders.js.src}`));

    stream.on('end', () => {
      if (!hasError) {
        console.log(`[js] plugins ${bold(green('Done'))}`);
        bsSP.reload();
      }

      done();
    });

    stream.on('error', (error) => {
      bsSP.sockets.emit('error:message', error);
      console.log(error);
      done(error);
    });
  });

  /**
   * Styles plugins
   */
  gulp.task('styles:plugins', (done) => {
    gulp.src(`${settings.paths.js.plugins}/**/*.css`)
      .pipe(plumber({
        errorHandler: (error) => {
          console.error(`Ошибка: проверьте стили в плагинах ${error.plugin}`);
          console.error(error.toString());
        },
      }))
      .pipe(concat('plugins.min.css'))
      .pipe(postcss([
        viewportHeightCorrection(),
        momentumScrolling(),
        flexBugsFixes(),
        combineAndSortMQ(),
      ], { from: undefined }))
      .pipe(gulp.dest(`${settings.paths.storage}/css`))
      .on('end', () => {
        console.log(`[css] plugins ${bold(green('Done'))}`);
      })
      .pipe(bsSP.stream());
    done();
  });

  /**
   * Copy plugins
   */
  gulp.task('copy:plugins', (done) => {
    const stream = gulp.src([
      `${settings.paths.js.plugins}/**/*.*`,
      `!${settings.paths.static}/**/Thumbs.db`,
      `!${settings.paths.static}/**/*tmp*`,
    ], { dot: true })
      .pipe(plumber())
      .pipe(gulp.dest(`${settings.paths.storage}/${settings.folders.js.src}/plugins`));

    stream.on('end', () => {
      console.log(`Plugins files copy ${bold(green('Done'))}`);
      bsSP.reload();
      done();
    });

    stream.on('error', (err) => {
      done(err);
    });
  });

  /**
   * Styles blocks
   */
  gulp.task('styles', (done) => {
    const autoprefixer = require('autoprefixer');
    const stylus = require('../modules/gulp/stylus');

    // обратная совместимость с старыми проектами
    const postcssOpts = settings.app.postcss || {};

    gulp.src(`${settings.paths.styles}/*.{styl,scss,sass}`)
      .pipe(plumber({
        errorHandler: (error) => {
          console.error(`Ошибка: проверьте стили ${error.plugin}`);
          console.error(error.toString());

          bsSP.sockets.emit('error:message', error);
        },
      }))
      .pipe(gif('*.styl', stylus({
        'include css': true,
      })))
      .pipe(gif('*.scss', sassGlob()))
      .pipe(gif('*.scss', sass()))
      .pipe(gif('*.sass', sass({
        indentedSyntax: true,
      })))
      .pipe(postcss([
        viewportHeightCorrection(),
        combineAndSortMQ(postcssOpts.sortMQ),
        momentumScrolling(postcssOpts.momentumScrolling),
        flexBugsFixes(),
        inlineSvg(postcssOpts.inlineSvg),
        easingGradients(postcssOpts.easingGradients),
        autoprefixer(),
      ], { from: undefined }))
      .pipe(gulp.dest(`${settings.paths.storage}/css`))
      .pipe(bsSP.stream())
      .on('end', () => {
        console.log(`[css] styles ${bold(green('Done'))}`);
      })
      .pipe(bsSP.stream());

    done();
  });

  /**
   * Static files
   */
  gulp.task('static', (done) => {
    const stream = gulp.src([
      `${settings.paths.static}/**/*.*`,
      `!${settings.paths.static}/**/Thumbs.db`,
      `!${settings.paths.static}/**/*tmp*`,
    ], { dot: true })
      .pipe(plumber())
      .pipe(gulp.dest(settings.paths.storage));

    stream.on('end', () => {
      console.log(`Static files copy ${bold(green('Done'))}`);
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
    settings.app.bsSP.middleware = [
      (req, res, next) => {
        const latencyRoutes = settings.app.bsSP.latencyRoutes ? settings.app.bsSP.latencyRoutes : [];
        const match = latencyRoutes.filter((item) => req.url.match(new RegExp(`^${item.route}`)) && item.active);

        if (match.length && match[0].active) {
          setTimeout(next, match[0].latency);
        } else {
          next();
        }
      },
      {
        route: '/lagman',
        handle: (req, res) => {
          res.setHeader('Content-Type', 'application/json;charset=UTF-8');
          res.end(JSON.stringify(LAGMAN.store, (key, value) => {
            if (typeof value === 'object' && value instanceof Set) {
              return [...value];
            }

            if (typeof value === 'object' && value instanceof Array) {
              return Object.keys(value).reduce((result, item) => {
                if (typeof value[item] === 'object' && value[item] instanceof Set) {
                  result[item] = value[item];
                }

                return result;
              }, {});
            }

            return value;
          }));
        },
      },
    ];

    bsSP.use(require('../modules/browser-sync/screen-message'));

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

  gulp.task('watch', (done) => {
    const chokidar = require('chokidar');
    const decache = require('decache');

    const watchOpts = {
      ignoreInitial: true,
      ignored: [
        `${settings.folders.marmelad}/**/*.db`,
        `${settings.folders.marmelad}/**/*tmp*`,
      ],
      usePolling: false,
      cwd: process.cwd(),
      ...settings.app.watchOpts,
    };

    /* СТАТИКА */
    gulp.watch([
      `${settings.paths.static}/**/*`,
      `${settings.paths.static}/**/.*`,
    ], watchOpts, gulp.parallel('static'));

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

    gulp.watch(
      `${settings.paths.js.plugins}/**/*.css`,
      watchOpts,
      gulp.parallel('styles:plugins'),
    );

    gulp.watch(
      `${settings.paths.js.plugins}/**/*`,
      watchOpts,
      gulp.parallel('copy:plugins'),
    );

    gulp.watch([
      `${settings.paths.js.src}/*.js`,
      `${settings.paths._blocks}/**/*.js`,
    ], watchOpts, gulp.parallel('scripts:others'));

    /* NunJucks Pages */
    const watchPages = chokidar.watch(`${settings.paths._pages}/**/*.html`, watchOpts);

    watchPages
      .on('add', (pagePath) => {
        watchPages.add(pagePath);
        LAGMAN.create(pagePath, 'pages');
      })
      .on('change', (pagePath) => {
        LAGMAN.store.src = path.join(process.cwd(), pagePath);
        gulp.series('nunjucks')();
      })
      .on('unlink', (pagePath) => {
        LAGMAN.delete(LAGMAN.getName(pagePath), 'pages');
        watchPages.unwatch(pagePath);
      });

    const watchBlocks = chokidar.watch(`${settings.paths._blocks}/**/*.html`, watchOpts);

    /* NunJucks Blocks */
    watchBlocks
      .on('add', (blockPath) => {
        LAGMAN.create(blockPath, 'blocks');

        templater.init(settings, DB.getStore());
      })
      .on('change', (blockPath) => {
        const blockName = LAGMAN.getName(blockPath);

        LAGMAN.store.onDemand = new Set([...LAGMAN.store.onDemand, ...LAGMAN.store.blocks[blockName]]);

        LAGMAN.store.src = [];

        LAGMAN.store.blocks[blockName].forEach((page) => {
          LAGMAN.store.src.push(`${settings.paths._pages}/**/${page}.html`);
        });

        if (LAGMAN.store.blocks[blockName].size) {
          gulp.series('nunjucks')();
        } else {
          console.log(`[nunjucks] block ${bold(yellow(blockName))} has no dependencies`);
        }
      })
      .on('unlink', (blockPath) => {
        const blockName = LAGMAN.getName(blockPath);

        LAGMAN.delete(blockName, 'blocks');
        watchBlocks.unwatch(blockPath);

        templater.init(settings, DB.getStore());
      });

    /* NunJucks Datas */
    gulp.watch(
      `${settings.paths._blocks}/**/*.json`,
      watchOpts,
    )
      .on('change', (blockPath) => {
        const blockName = LAGMAN.getName(blockPath, 'json');

        DB.update(blockPath);

        LAGMAN.store.onDemand = new Set([...LAGMAN.store.onDemand, ...LAGMAN.store.blocks[blockName]]);

        console.log(LAGMAN.store.onDemand);

        LAGMAN.store.src = [];

        LAGMAN.store.onDemand.forEach((page) => {
          LAGMAN.store.src.push(`${settings.paths._pages}/**/${page}.html`);
        });

        gulp.series('nunjucks')();
      })
      .on('unlink', (blockPath) => {
        DB.delete(blockPath);
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
            sprite: {
              icons: getIconsNamesList(settings.iconizer.srcIcons),
              colored: getIconsNamesList(settings.iconizer.srcColored),
            },
            settings,
          }, 'app');

          gulp.series('nunjucks')(decached);
        },
      );
    } catch (error) {
      console.log(error);
    }

    /* Iconizer */

    gulp.watch([
      `${settings.iconizer.srcIcons}/*.svg`,
      `${settings.iconizer.srcColored}/*.svg`,
    ],
    watchOpts,
    (complete) => {
      const { srcIcons } = settings.iconizer;
      let sizeLimitError = false;

      try {
        if (fs.existsSync(srcIcons)) {
          fs.readdirSync(srcIcons).forEach((iconName) => {
            const iconStats = fs.statSync(`${srcIcons}/${iconName}`);

            if (iconStats.size > 3072) {
              sizeLimitError = true;
              console.log(`${bgRed(' ERROR ')} icon ${yellow(iconName)} more than 3kb`);
            }
          });
        }
      } catch (err) {
        console.log(err);
      }

      if (!sizeLimitError) {
        gulp.series('iconizer:update')(complete);
      }
    });

    done();
  });

  /**
   * Clean build directory
   */
  gulp.task('clean', (done) => {
    const del = require('del');

    del.sync(settings.paths.dist);
    done();
  });

  /**
   * Proxy mod
   */
  gulp.task('proxy-mod', (done) => {
    if (opts.proxyMod) {
      if (opts.build) {
        gulp.series('proxy:copy-sources')();
      } else {
        gulp.series('proxy:copy-sources', 'proxy:watch-sources', 'proxy:server')();
      }

      console.log(`Proxy Mod ${bold(green('Started'))}`);
    }

    done();
  });

  /**
   * Proxy server
   */
  gulp.task('proxy:server', (done) => {
    settings.proxy.server.middleware = [
      (req, res, next) => {
        const latencyRoutes = settings.proxy.server.latencyRoutes ? settings.proxy.server.latencyRoutes : [];
        const match = latencyRoutes.filter((item) => req.url.match(new RegExp(`^${item.route}`)) && item.active);

        if (match.length && match[0].active) {
          setTimeout(next, match[0].latency);
        } else {
          next();
        }
      },
    ];

    bsPS.init(settings.proxy.server, () => {
      done();
    });
  });

  /**
   * Proxy mod Static files
   */
  gulp.task('proxy:copy-sources', (done) => {
    const sources = settings.proxy.sources.copy.map((directory) => `${directory}/**/*`);
    const ignored = settings.proxy.sources.ignored.map((ignore) => `!${ignore}`);

    const stream = gulp.src([...sources, ...ignored], {
      allowEmpty: true,
      base: settings.folders.static,
    })
      .pipe(plumber())
      .pipe(gulp.dest(settings.proxy.sources.to));

    stream.on('end', () => {
      console.log(`Proxy Copy Sources ${bold(green('Done'))}`);
      // bsSP.reload();
      done();
    });

    stream.on('error', (err) => {
      done(err);
    });
  });

  /**
   * Proxy watcher
   */
  gulp.task('proxy:watch-sources', (done) => {
    const watchOpts = {
      ignoreInitial: true,
      usePolling: false,
      cwd: process.cwd(),
      ...settings.app.watchOpts,
    };

    watchOpts.ignored = [...watchOpts.ignored, ...settings.proxy.sources.ignored];

    const sources = settings.proxy.sources.copy.map((directory) => `${directory}/**/*`);

    gulp.watch(
      sources,
      watchOpts,
      gulp.parallel('proxy:copy-sources'),
    );

    console.log(`Proxy Watch Sources ${bold(green('Started'))}`);

    done();
  });

  gulp.task('finisher', (done) => {
    if (opts.build) {
      console.log(`Build task ${bold(green('finished'))}`);
      process.exit(0);
    }

    done();
  });

  gulp.task(
    'develop',
    gulp.series(
      'clean',
      'static',
      'copy:plugins',
      'iconizer:icons',
      'iconizer:colored',
      'database',
      gulp.parallel(
        'nunjucks',
        'scripts:vendors',
        'scripts:plugins',
        'scripts:others',
        'styles:plugins',
        'styles',
      ),
      'finisher',
    ),
  );

  if (opts.build) {
    gulp.series('develop')();
  } else {
    gulp.series('develop', 'proxy-mod', 'server:static', 'watch')();
  }
};
