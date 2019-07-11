const gulp = require('gulp');
const pretty = require('gulp-pretty-html');

module.exports = (opts) => {
  const settings = require(`${process.cwd()}/marmelad/settings.marmelad`);

  gulp.task('format', (done) => {
    gulp.src(`${settings.paths.dist}/**/*.html`)
      .pipe(pretty({
        indent_size: 4,
        indent_char: '',
        indent_with_tabs: true,
        wrap_line_length: 0,
        preserve_newlines: false,
        unformatted: ['code', 'pre', 'em', 'strong', 'span', 'i', 'b', 'br', 'svg'],
      }))
      .pipe(gulp.dest(settings.paths.dist));

    done();
  });

  gulp.series('format')();
};
