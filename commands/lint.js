const nodeW3CValidator = require('node-w3c-validator');
const chalk = require('chalk');
const path = require('path');

function logResults(message) {
  const types = {
    error: 'red',
    info: 'blue',
  };

  const template = path.basename(message.url);

  console.log(chalk[types[message.type]](`${message.type}`), chalk.yellow(template));
  console.log(message.message);
  console.log(chalk.yellow(message.extract));
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
