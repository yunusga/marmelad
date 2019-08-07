const gulp = require('gulp');
const pretty = require('gulp-pretty-html');
const ora = require('ora');

module.exports = (opts) => {
  const settings = require(`${process.cwd()}/marmelad/settings.marmelad`);
  const options = Object.assign({
    html: {
      indent_size: 4,
      indent_char: '',
      indent_with_tabs: true,
      wrap_line_length: 0,
      preserve_newlines: false,
      unformatted: ['code', 'pre', 'em', 'strong', 'span', 'i', 'b', 'br', 'symbol'],
    },
  }, settings.pretty);

  gulp.task('format:html', (done) => {
    const htmlSpinner = ora('Format HTML started').start();

    gulp.src(`${settings.paths.dist}/**/*.html`)
      .pipe(pretty(options.html))
      .pipe(gulp.dest(settings.paths.dist));

    htmlSpinner.succeed('Format HTML done');

    done();
  });
};
