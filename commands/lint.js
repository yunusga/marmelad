const nodeW3CValidator = require('node-w3c-validator');
const del = require('del');

module.exports = () => {
  const settings = require(`${process.cwd()}/marmelad/settings.marmelad`);

  const nw3cOpts = {
    format: 'html',
    skipNonHtml: true,
    exec: {
      maxBuffer: 1024 * 1024,
    },
    reportName: 'w3c-validator.html',
    ...settings.w3cValidator,
  };

  del.sync(`${settings.paths.dist}/${nw3cOpts.reportName}`);

  nodeW3CValidator(`${settings.paths.dist}/**/*.html`, nw3cOpts, (err, output) => {
    if (err === null) {
      return;
    }
    nodeW3CValidator.writeFile(`${settings.paths.dist}/${nw3cOpts.reportName}`, output);
  });
};
