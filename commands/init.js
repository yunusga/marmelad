const { existsSync, readdirSync, cpSync } = require('fs');
const {
  join,
  extname,
} = require('path');

const {
  bold, green, yellow, bgRed,
} = require('picocolors');

const { log } = console;

module.exports = (directory, opts) => {
  directory = directory || '';

  const isDirExists = directory.length && existsSync(directory);
  const isNotEmpty = isDirExists || !directory.length ? readdirSync(join(process.cwd(), directory)).length : false;
  const hasRohat = existsSync(join(directory, 'rohat', 'rohat.config.js'));

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
      filter: (src) => {
        let ext = extname(src);

        if (ext.includes('scss') || ext.includes('styl')) {
          return ext === `.${opts.css}`;
        }

        return true;
      }
    }
  );

  log(`${bold(green('[rohat]'))} initialized, type ${bold(yellow('rohat'))} -h for help`);
}
