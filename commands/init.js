const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const readlineSync = require('readline-sync');
const CHALK = require('chalk');

const CERROR = CHALK.bold.red;
const CWARN = CHALK.bold.yellow;
const CSUCCESS = CHALK.bold.green;
const LOG = console.log;

module.exports = (dir, opts) => {
  gulp.task('init:marmelad', (done) => {
    const stream = gulp.src(
      [path.join(__dirname.replace('commands', ''), 'boilerplate', '**', '*')],
      { dot: true },
    )
      .pipe(gulp.dest(path.join(process.cwd(), dir, 'marmelad')));

    stream.on('end', () => {
      LOG(`${CSUCCESS('[marmelad]')} initialized, type ${CWARN('marmelad -h')} for CLI help`);
      done();
    });
  });

  dir = dir || '';

  const isDirExists = dir.length && fs.existsSync(dir);
  const isNotEmpty = isDirExists || !dir.length ? fs.readdirSync(path.join(process.cwd(), dir)).length : false;
  const hasMarmelad = fs.existsSync(path.join(dir, 'marmelad'));

  if (hasMarmelad) {
    LOG(`${CERROR('[error]')} project is already initialized`);
    process.exit(0);
  }

  if (isNotEmpty) {
    LOG(`${CWARN('[warn]')} Directory is not empty. Some files may be overwritten. Continue?`);

    if (!opts.test) {
      const agree = readlineSync.question('(yes|no):');

      if (agree !== 'yes') {
        LOG(`${CERROR('[error]')} initialization aborted`);
        process.exit(0);
      }
    }

    if (opts.test) {
      process.exit(0);
    }
  }

  gulp.series('init:marmelad')();
};
