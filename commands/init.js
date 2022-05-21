const { exec } = require('child_process');
const { existsSync, readdirSync } = require('fs');

const path = require('path');
const gulp = require('gulp');
const gif = require('gulp-if');
const replace = require('gulp-replace');

const {
  bold, bgRed, bgYellow, black, green,
} = require('picocolors');

const { log } = console;

module.exports = (dir, opts) => {
  // отключаем цветную консоль во время теста
  if (opts.test) {
    process.env.NO_COLOR = 'yes';
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

  gulp.task('copy:boilerplate', (done) => {
    log(`${bold(green('[marmelad]'))} copy:boilerplate`);

    const stream = gulp.src(
      [...boilerplateFiles],
      { dot: true },
    )
      .pipe(gif('settings.marmelad.js', replace('<%- css %>', opts.css)))
      .pipe(gulp.dest(path.join(process.cwd(), dir, 'marmelad')));

    stream.on('end', () => {
      done();
    });
  });

  gulp.task('copy:rootfiles', (done) => {
    log(`${bold(green('[marmelad]'))} copy:rootfiles`);

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
    log(`${bold(green('[marmelad]'))} git:init`);

    const quietFlag = opts.test ? ' -q' : '';

    const gitInitCommands = [
      `git init${quietFlag}`,
      'git add .',
      `git commit${quietFlag} -m "[marmelad] initial commit"`,
    ];

    if (dir) {
      gitInitCommands.unshift(`cd ${dir}`);
    }

    exec(gitInitCommands.join(' && '), (error) => {
      if (error) {
        log(`exec error: ${error}`);
        return;
      }

      log(`${bold(green('[marmelad]'))} initialized, type marmelad -h for CLI help`);
      done();
    });
    // CMD
    //   .exec()
    //   .then((res) => {
    //     if (!opts.test) {
    //       log(res.exitCode);
    //     }
    //   })
    //   .fail((err) => {
    //     log(err);
    //   })
    //   .done(() => {
    //     log(`${bold(green('[marmelad]'))} initialized, type marmelad -h for CLI help`);
    //     done();
    //   });
  });

  dir = dir || '';

  const isDirExists = dir.length && existsSync(dir);
  const isNotEmpty = isDirExists || !dir.length ? readdirSync(path.join(process.cwd(), dir)).length : false;
  const hasMarmelad = existsSync(path.join(dir, 'marmelad'));

  if (hasMarmelad) {
    log(`${bgRed(' ERROR ')} project is already initialized`);
    process.exit(0);
  }

  if (isNotEmpty) {
    log(`${bgRed(' ERROR ')} Directory is not empty`);
    process.exit(0);
  }

  gulp.series('copy:boilerplate', 'copy:rootfiles', 'git:init')();
};
