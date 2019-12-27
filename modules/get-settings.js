const fs = require('fs');

module.exports = () => {
  const mmdSettingsPath = `${process.cwd()}/marmelad/settings.marmelad`;

  if (!fs.existsSync(`${mmdSettingsPath}.js`)) {
    console.log('[startup error] settings.marmelad.js не найден. Возможно marmelad запускается в директории без проекта.');
    process.exit(1);
  }

  return require(mmdSettingsPath);
};
