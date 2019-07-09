const nodeW3CValidator = require('node-w3c-validator');
const chalk = require('chalk');
const path = require('path');

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
  // validate
  nodeW3CValidator('static/*.html', {
    format: 'json',
    skipNonHtml: true,
    verbose: true,
    errorsOnly: false,
  }, (err, output) => {
    if (err === null) {
      return;
    }

    const result = JSON.parse(output);

    result.messages.forEach((message) => {
      logResults(message);
    });

    nodeW3CValidator.writeFile('static/validator.json', output);
  });
};
