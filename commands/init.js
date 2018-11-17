const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const LOG = console.log;
const readlineSync = require('readline-sync');

module.exports = (dir) => {

  gulp.task('init:marmelad', (done) => {
    const stream = gulp.src(
      [path.join(__dirname.replace('commands', ''), 'boilerplate', '**', '*')],
      { dot: true },
    )
      .pipe(gulp.dest(path.join(process.cwd(), dir, 'marmelad')));

    stream.on('end', () => {
      LOG(`\n[marmelad] initialized, type marmelad -h for CLI help`);
      done();
    });
  });

  dir = dir || '';
  
  let isDirExists = dir.length && fs.existsSync(dir);
  let isNotEmpty = isDirExists ? fs.readdirSync(path.join(process.cwd(), dir)).length : false;
  let hasMarmelad = fs.existsSync(path.join(dir, 'marmelad'));

  if (hasMarmelad) {
    LOG('\n[error] project is already initialized');
    process.exit(0);
  }

  if (isNotEmpty) {
    LOG('\n[warn] Directory is not empty. Some files may be overwritten. Continue?');

    let agree = readlineSync.question('(yes|no):');

    switch (agree) {
      case 'yes':
        gulp.start('init:marmelad');
        break;
    
      default:
        LOG('[error] initialization aborted');
        process.exit(0);
        break;
    }
  } else {
    gulp.start('init:marmelad');
  }
};