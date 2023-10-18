const { existsSync, readdirSync, cpSync } = require('fs');
const { join } = require('path');

const {
  bold, green, yellow, bgRed,
} = require('picocolors');

const { log } = console;

module.exports = (directory) => {
  directory = directory || '';

  const isDirExists = directory.length && existsSync(directory);
  const isNotEmpty = isDirExists || !directory.length ? readdirSync(join(process.cwd(), directory)).length : false;
  const hasRohat = existsSync(join(directory, 'rohat.config.js'));

  if (hasRohat) {
    log(`${bgRed(' ERROR ')} ${bold(yellow('rohat'))} project is already initialized`);
    process.exit(0);
  }

  if (isNotEmpty) {
    log(`${bgRed(' ERROR ')} directory is not empty`);
    process.exit(0);
  }

  cpSync(
    join(__dirname.replace('commands', ''), 'boilerplate', 'default'),
    join(process.cwd(), directory),
    {
      recursive: true,
    }
  );

  log(`${bold(green('[rohat]'))} initialized, type ${bold(yellow('rohat'))} -h for help`);
}
