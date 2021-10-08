#!/usr/bin/env node

const { program } = require('commander');
const { name, version, description } = require('../package.json');

const { log } = console;

// Setup additional HELP information
program
  .version(version, '-v, --version')
  .description(description)
  .on('--help', () => {
    log(`\nCommands help:\n  ${name} [command] --help\n  mmd [command] --help`);
    log(`\nSource files:\n  ${__filename}`);
    log(`Version:\n  ${version}`);
  });

// Init new project
program
  .command('init [dirName]')
  .description('Initialize new project')
  .option('-t, --test', 'required for testing')
  .option('-c, --css [styl,scss,sass]', 'set stylesheet <engine> support', 'styl')
  .action((dirName, opts) => {
    require('../commands/init')(dirName, opts);
  });

// Start dev server
program
  .command('dev')
  .description('Start dev server')
  .option('-a, --auth [user@password]', 'set user@password for authorization')
  .option('--proxy-mod', 'proxy mode with copy files from build')
  .option('--build', 'build project once')
  .action((dev) => {
    require('../commands/dev')(dev);
  })
  .on('--help', () => {
    // console.log();
  });

// Create marmelad PAGE
program
  .command('cp <pageName>')
  .description('Create new page')
  .action((pageName) => {
    require('../commands/cp')(pageName);
  });

// Create marmelad BLOCK
program
  .command('cb <blockName>')
  .description('Create new block')
  .option('-t, --techs [html,js,css,json]', 'Files extensions for new block')
  .action((blockName, opts) => {
    require('../commands/cb')(blockName, opts.techs);
  });

// Rename marmelad BLOCK
program
  .command('mv <oldName> <newName>')
  .description('Rename block')
  .option('-d, --dry', 'Dry run without actually making replacements, for testing purposes')
  .option('--hard', 'Enable replacements in files')
  .action((oldName, newName, opts) => {
    require('../commands/mv')(oldName, newName, opts);
  });

// Lint build
program
  .command('lint')
  .description('Lint project')
  .action((opts) => {
    require('../commands/lint')(opts.techs);
  });

// Prettify build
program
  .command('dist')
  .description('Release tasks for project')
  .action((opts) => {
    require('../commands/dist')(opts);
  });

// Archive build
program
  .command('pack [archiveName]')
  .description('Archive project source code (default:tar.gz)')
  .option('-z, --zip', 'ZIP archive')
  .option('--nodt', 'No Date and Time in name postfix')
  .option('-f, --folders [marmelad,static]', 'Folders to archive', 'marmelad,static')
  .action((archiveName, opts) => {
    require('../commands/pack')(name, opts);
  });

// Parse CLI arguments
program.parse(process.argv);

// If no args SHUTDOWN and show HELP information
if (!process.argv.slice(2).length) {
  program.help();
  process.exit(1);
}
