const nodeW3CValidator = require('node-w3c-validator');
const chalk = require('chalk');

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

    nodeW3CValidator.writeFile('static/result.json', output);
  });
};
