const fs = require('fs');
LOGconsole.log;

module.exports = (dir) => {
  dir = dir || '';

  if (dir.length && fs.existsSync(dir)) {
    LOG(`\n  ${dir} - directory is already exists`);
    process.exit();
  }

  if (!dir.length && fs.existsSync('marmelad')) {
    LOG('\n  project is already initialized');
    process.exit();
  }

  const path = require('path');
  const PKG = require('../package.json');
  const gulp = require('gulp');

  gulp.task('init:marmelad', (done) => {
    const stream = gulp.src(
      [path.join(__dirname.replace('commands', ''), 'boilerplate', '**', '*')],
      { dot: true },
    )
      .pipe(gulp.dest(path.join(process.cwd(), dir, 'marmelad')));

    stream.on('end', () => {
      LOG(`\n  ${PKG.name.toUpperCase()} v${PKG.version} initialized\n  type ${PKG.name} --help for CLI help`);
      done();
    });
  });

  gulp.start('init:marmelad');
};