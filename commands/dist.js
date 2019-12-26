const gulp = require('gulp');
const postHTML = require('gulp-posthtml');
const attrsSorter = require('posthtml-attrs-sorter');
const pretty = require('gulp-pretty-html');
const ora = require('ora');

const hasher = require('../modules/posthtml/hasher');

module.exports = () => {
  const settings = require(`${process.cwd()}/marmelad/settings.marmelad`);

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
    const htmlSpinner = ora('Format HTML started').start();

    gulp.src(`${settings.paths.dist}/**/*.html`)
      .pipe(pretty(htmlFmtOpts.html))
      .pipe(gulp.dest(settings.paths.dist));

    htmlSpinner.succeed('Format HTML done');

    done();
  });

  gulp.task('posthtml', (done) => {
    const dist = settings.dist || {
      attrsSorter: {
        order: [
          'id', 'class', 'name',
          'data-.+', 'ng-.+', 'src',
          'for', 'type', 'href',
          'values', 'title', 'alt',
          'role', 'aria-.+',
          '$unknown$',
        ],
      },
      hasher: {
        attributes: [],
        path: settings.paths.dist,
      },
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

    gulp.src(`${settings.paths.dist}/**/*.html`)
      .pipe(postHTML([
        attrsSorter(attrsSorterOpts),
        hasher(hasherOpts),
      ]))
      .pipe(gulp.dest(settings.paths.dist));

    done();
  });

  gulp.series('format:html', 'posthtml')();
};
