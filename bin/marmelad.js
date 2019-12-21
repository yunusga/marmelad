#!/usr/bin/env node

const CLI = require('commander');
const PKG = require('../package.json');

const LOG = console.log;

/**
 * Установка флагов/параметров для командной строки
 */
CLI
  .version(PKG.version, '-v, --version')
  .description(PKG.description)
  .on('--help', () => {
    LOG(`\nCommands help:\n  ${PKG.name} [command] --help\n  mmd [command] --help`);
    LOG(`\nSource files:\n  ${__filename}`);
  });


/**
 * инициализация нового проекта
 */
CLI
  .command('init [dir]')
  .description('initialize new project')
  .option('-t, --test', 'required for testing')
  .option('--bootstrap [donor]', 'initialize new project with bootstrap included', false)
  .option('-c, --css [styl,scss,sass]', 'set stylesheet <engine> support', 'styl')
  .action((dir, opts) => {
    require('../commands/init')(dir, opts);
  });

/**
 * старт сервера разработки
 */
//
CLI
  .command('dev')
  .description('run development server')
  .option('-a, --auth [user@password]', 'set user@password for authorization')
  .option('--proxy-mod', 'proxy mode with copy files from build')
  .option('--build', 'build project once')
  .action((dev) => {
    require('../commands/dev')(dev);
  })
  .on('--help', () => {
    // console.log();
  });


/**
 * создание страницы
 */
CLI
  .command('cp <name>')
  .description('create new page')
  .action((pageName) => {
    require('../commands/cp')(pageName);
  });


/**
 * создание блока
 */
CLI
  .command('cb <name>')
  .description('create new block')
  .option('-t, --techs [html,js,css,json]', 'Files extensions for new block')
  .action((pageName, opts) => {
    require('../commands/cb')(pageName, opts.techs);
  });

/**
 * линтера сборки
 */
CLI
  .command('lint')
  .description('lint project')
  .action((opts) => {
    require('../commands/lint')(opts.techs);
  });


/**
 * Prettier
 */
CLI
  .command('format')
  .description('Format project code (HTML only temporarily)')
  .action((opts) => {
    require('../commands/format')(opts);
  });


/**
 * Archive
 */
CLI
  .command('pack [name]')
  .description('Archive project source code (default:tar.gz)')
  .option('-z, --zip', 'ZIP archive')
  .option('--nodt', 'No Date and Time in name postfix')
  .option('-f, --folders [marmelad,static]', 'Folders to archive', 'marmelad,static')
  .action((name, opts) => {
    require('../commands/pack')(name, opts);
  });

/**
 * парсим аргументы командной строки
 */
CLI.parse(process.argv);

/**
 * В случае если не передан ни один аргумент,
 * показываем справку
 */
if (!process.argv.slice(2).length) {
  CLI.help();
  process.exit(1);
}
