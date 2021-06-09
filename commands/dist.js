const path = require('path');
const gulp = require('gulp');
const attrsSorter = require('posthtml-attrs-sorter');
const pretty = require('gulp-pretty-html');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const uglify = require('gulp-uglify');
const ora = require('ora');

const postHTML = require('../modules/posthtml/gulp');
const tap = require('../modules/gulp/tap');

const hasher = require('../modules/posthtml/hasher');
const getSettings = require('../modules/get-settings');

function getNormalPath(filePath, basePath) {
  return filePath.replace(basePath, '').replace(/\\/g, '/').replace(/^\/+/, '');
}

function setMmdMinified(file) {
  const before = getNormalPath(file.history[0], file.base);
  const after = getNormalPath(file.history[1], file.base);

  if (!global._mmdMinified) {
    global._mmdMinified = new Map();
  }

  global._mmdMinified.set(before, after);
}

module.exports = () => {
  const settings = getSettings();

  const htmlFmtOpts = {
    html: {
      indent_size: 4,
      indent_char: '',
      indent_with_tabs: true,
      wrap_line_length: 0,
      preserve_newlines: false,
      unformatted: ['code', 'pre', 'em', 'strong', 'span', 'i', 'b', 'br', 'symbol'],
    },
    ...settings.pretty,
  };

  gulp.task('format:html', (done) => {
    const formatHTML = ora('Format HTML started').start();

    const stream = gulp.src(`${settings.paths.dist}/*.html`)
      .pipe(pretty(htmlFmtOpts))
      .pipe(gulp.dest(settings.paths.dist));

    stream.on('end', () => {
      formatHTML.succeed('Format HTML done');
      done();
    });
  });

  gulp.task('posthtml:tools', (done) => {
    const dist = settings.dist || {
      attrsSorter: {},
      hasher: {},
    };

    const attrsSorterOpts = {
      order: [
        'id', 'class', 'name',
        'data-.+', 'ng-.+', 'src',
        'for', 'type', 'href',
        'values', 'title', 'alt',
        'role', 'aria-.+',
        '$unknown$',
      ],
      ...dist.attrsSorter,
    };

    const hasherOpts = {
      attributes: [],
      path: settings.paths.dist,
      ...dist.hasher,
    };

    const posthtmlTools = ora('PostHTML tools started').start();

    const stream = gulp.src(`${settings.paths.dist}/*.html`)
      .pipe(postHTML([
        attrsSorter(attrsSorterOpts),
        hasher(hasherOpts),
      ]))
      .pipe(gulp.dest(settings.paths.dist));

    stream.on('end', () => {
      posthtmlTools.succeed('PostHTML tools done');
      done();
    });
  });

  gulp.task('minify:css', (done) => {
    const stream = gulp.src(`${settings.paths.dist}/**/!(*.min).css`)
      .pipe(tap((file) => {
        console.log(`minimize: ${path.basename(file.path)}`);
      }))
      .pipe(rename({
        suffix: '.min',
      }))
      .pipe(postcss([
        cssnano(settings.app.cssnano),
      ], { from: undefined }))
      .pipe(gulp.dest((file) => {
        setMmdMinified(file);
        return file.base;
      }));

    stream.on('end', () => {
      done();
    });
  });

  gulp.task('minify:js', (done) => {
    const stream = gulp.src(`${settings.paths.dist}/**/!(*.min).js`)
      .pipe(tap((file) => {
        console.log(`minimize: ${path.basename(file.path)}`);
      }))
      .pipe(rename({
        suffix: '.min',
      }))
      .pipe(uglify())
      .pipe(gulp.dest((file) => {
        setMmdMinified(file);
        return file.base;
      }));

    stream.on('end', () => {
      done();
    });
  });

  gulp.series('minify:css', 'minify:js', 'posthtml:tools', 'format:html')();
};
