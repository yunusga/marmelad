const nodeW3CValidator = require('node-w3c-validator');

module.exports = () => {
  const settings = require(`${process.cwd()}/marmelad/settings.marmelad`);
  const options = Object.assign({
    format: 'html',
    skipNonHtml: true,
    exec: {
      maxBuffer: 1024 * 1024,
    },
  }, settings.w3cValidator);

  nodeW3CValidator(`${settings.paths.dist}/**/*.html`, options, (err, output) => {
    if (err === null) {
      return;
    }
    nodeW3CValidator.writeFile(`${settings.paths.dist}/w3c.html`, output);
  });
};
