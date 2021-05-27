const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const gif = require('gulp-if');
const replace = require('gulp-replace');
const readlineSync = require('readline-sync');
const CMD = require('cmd-exec').init();

const {
  bold, bgRed, bgYellow, black, green, options,
} = require('colorette');

const LOG = console.log;

module.exports = (dir, opts) => {
  // отключаем цветную консоль во время теста
  if (opts.test) {
    options.enabled = false;
  }
  // набор поддерживаемых css-препроцессоров marmelad
  const supportedCSS = new Set(['scss', 'sass', 'styl']);

  // удаление необходимого препроцессора из набора исключений
  supportedCSS.delete(opts.css);

  const boilerplatePath = path.join(__dirname.replace('commands', ''), 'boilerplate');

  // набор файлов для копирования заготовки нового проекта
  const boilerplateFiles = new Set([
    path.join(boilerplatePath, 'base', '**', `*.!(${[...supportedCSS].join('|')})`),
  ]);

  // файлы для копирования в корень проекта
  const rootFiles = new Set([
    path.join(boilerplatePath, 'rootfiles', '**', '*'),
  ]);

  let btsUse = 'false';
  let btsDonor = 'false';

  if (opts.bootstrap) {
    boilerplateFiles.add(path.join(boilerplatePath, 'extensions', 'bootstrap', '**', '*'));

    btsUse = 'true';

    if (opts.bootstrap === 'donor') {
      btsUse = 'false';
      btsDonor = 'true';
    }
  }

  gulp.task('copy:boilerplate', (done) => {
    LOG(`${bold(green('[marmelad]'))} copy:boilerplate`);

    const stream = gulp.src(
      [...boilerplateFiles],
      { dot: true },
    )
      .pipe(gif('settings.marmelad.js', replace('<%- css %>', opts.css)))
      .pipe(gif('settings.marmelad.js', replace("'<%- btsUse %>'", btsUse)))
      .pipe(gif('settings.marmelad.js', replace("'<%- btsDonor %>'", btsDonor)))
      .pipe(gulp.dest(path.join(process.cwd(), dir, 'marmelad')));

    stream.on('end', () => {
      done();
    });
  });

  gulp.task('copy:rootfiles', (done) => {
    LOG(`${bold(green('[marmelad]'))} copy:rootfiles`);

    const initInfo = require('../modules/init-info')();

    const stream = gulp.src(
      [...rootFiles],
      { dot: true },
    )
      .pipe(gif('.mmd', replace('#', JSON.stringify(initInfo, null, '  '))))
      .pipe(gulp.dest(path.join(process.cwd(), dir)));

    stream.on('end', () => {
      done();
    });
  });

  gulp.task('git:init', (done) => {
    LOG(`${bold(green('[marmelad]'))} git:init`);

    const quietFlag = opts.test ? ' -q' : '';

    const gitInitCommands = [
      `git init${quietFlag}`,
      'git add .',
      `git commit${quietFlag} -m "[marmelad] initial commit"`,
    ];

    if (dir) {
      gitInitCommands.unshift(`cd ${dir}`);
    }

    CMD
      .exec(gitInitCommands.join(' && '))
      .then((res) => {
        if (!opts.test) {
          LOG(res.exitCode);
        }
      })
      .fail((err) => {
        LOG(err);
      })
      .done(() => {
        LOG(`${bold(green('[marmelad]'))} initialized, type marmelad -h for CLI help`);
        done();
      });
  });

  dir = dir || '';

  const isDirExists = dir.length && fs.existsSync(dir);
  const isNotEmpty = isDirExists || !dir.length ? fs.readdirSync(path.join(process.cwd(), dir)).length : false;
  const hasMarmelad = fs.existsSync(path.join(dir, 'marmelad'));

  if (hasMarmelad) {
    LOG(`${bgRed(' ERROR ')} project is already initialized`);
    process.exit(0);
  }

  if (isNotEmpty) {
    LOG(`${bgYellow(black(' WARN '))} Directory is not empty. Some files may be overwritten. Continue?`);

    if (!opts.test) {
      const agree = readlineSync.question('(yes|no):');

      if (agree !== 'yes') {
        LOG(`${bgRed(' ERROR ')} initialization aborted`);
        process.exit(0);
      }
    }

    if (opts.test) {
      process.exit(0);
    }
  }

  gulp.series('copy:boilerplate', 'copy:rootfiles', 'git:init')();
};
