const nodeW3CValidator = require('node-w3c-validator');
const chalk = require('chalk');
const path = require('path');
const glob = require('glob');

function logResults(msg) {
  const types = {
    error: 'red',
    info: 'blue',
  };

  const template = path.basename(msg.url);

  console.log(chalk[types[msg.type]](`${msg.type}`), chalk.yellow(template), `[${msg.lastLine}:${msg.firstColumn}:${msg.lastColumn}]`);
  console.log(msg.message);
  console.log(chalk.yellow(msg.extract.substring(msg.hiliteStart, msg.hiliteLength).trim()));
  console.log('---');
}

module.exports = () => {

  const pages = glob.sync('static/**/*.html');
  let index = 0;
  let current = 0;
  let zero = pages.length > 9 ? true : false;

  function validate(templatePath) {
    nodeW3CValidator(templatePath, {
      format: 'json',
      skipNonHtml: true,
      verbose: true,
      errorsOnly: false,
    }, (err, output) => {
      if (err === null) {
        return;
      }

      const result = JSON.parse(output);
      const template = path.basename(templatePath);

      console.log(result.messages);

      console.log(`${chalk.gray(`${current}/${pages.length} -`)} ${chalk.bold.yellow(template)} - ${result.messages.length} errors`);

      roundRobin();
    });
  }

  function roundRobin() {
    if (index < pages.length) {
      validate(pages[index]);
      index++;

      if (zero) {
        current = index < 10 ? `0${index}` : index;
      } else {
        current = index;
      }
    }
  }

  roundRobin();
};
