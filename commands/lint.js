const { join } = require('path');
const { readFileSync } = require('fs');

const nodeW3CValidator = require('node-w3c-validator');
const del = require('del');

const getSettings = require('../modules/get-settings');

const glob = require('glob');
const postcss = require('postcss');
const stylelint = require('stylelint');

module.exports = () => {
  process.env.BROWSERSLIST_CONFIG = join(process.cwd(), '.browserslistrc');

  const settings = getSettings();

  glob(`${settings.paths.dist}/**/*.css`, {}, (err, files) => {
    files.forEach((file) => {
      const code = readFileSync(file, 'utf8');

      postcss([
        stylelint(),
        require('postcss-reporter')({ clearReportedMessages: true }),
      ])
        .process(code, {
          from: file,
        })
        .then(() => { })
        .catch((error) => console.error(error.stack));
    });
  });

  // const nw3cOpts = {
  //   format: 'html',
  //   skipNonHtml: true,
  //   exec: {
  //     maxBuffer: 1024 * 1024,
  //   },
  //   reportName: 'w3c-validator.html',
  //   ...settings.w3cValidator,
  // };

  // del.sync(`${settings.paths.dist}/${nw3cOpts.reportName}`);

  // nodeW3CValidator(`${settings.paths.dist}/**/*.html`, nw3cOpts, (err, output) => {
  //   if (err === null) {
  //     return;
  //   }
  //   nodeW3CValidator.writeFile(`${settings.paths.dist}/${nw3cOpts.reportName}`, output);
  // });
};
