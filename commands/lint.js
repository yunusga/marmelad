const nodeW3CValidator = require('node-w3c-validator');
const del = require('del');

module.exports = () => {
  const settings = require(`${process.cwd()}/marmelad/settings.marmelad`);
  const options = Object.assign({
    format: 'html',
    skipNonHtml: true,
    exec: {
      maxBuffer: 1024 * 1024,
    },
    reportName: 'w3c-validator.html',
  }, settings.w3cValidator);

  del.sync(`${settings.paths.dist}/${options.reportName}`);

  nodeW3CValidator(`${settings.paths.dist}/**/*.html`, options, (err, output) => {
    if (err === null) {
      return;
    }
    nodeW3CValidator.writeFile(`${settings.paths.dist}/${options.reportName}`, output);
  });
};
