#!/usr/bin/env node

const PKG = require('../package.json');
const CLI = require('commander');
const LOG = console.log;

/**
 * Установка флагов/параметров для командной строки
 */
CLI
  .version(PKG.version, '-v, --version')
  .description(PKG.description)
  .on('--help', () => {
    LOG('\nCommands help:\n\n  ' + PKG.name + ' [command] --help\n');
  });


/**
 * инициализация нового проекта
 */
CLI
.command('init [dir]')
.description('initialize new project')
.action((dir) => {
  require('../commands/init')(dir);
});

/**
 * старт сервера разработки
 */
//
CLI
  .command('dev')
  .description('run development server')
  // .option('-a, --auth [user@password]', 'set user@password for authorization')
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
  .option('-t, --techs [html,js,styl,json]', 'Files extensions for new block', 'html,js,styl,json')
  .action((pageName, opts) => {
    require('../commands/cb')(pageName, opts.techs);
  });


/**
 * парсим аргументы командной строки
 */
CLI.parse(process.argv);


/**
 * В случае если не передан ни один аргумент,
 * показываем справку
 */
if (!CLI.args.length) {
  CLI.help();
}