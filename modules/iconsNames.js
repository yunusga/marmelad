const fs = require('fs');
/**
 * Return array of icon names for svg-sprite
 * @param {string} iconPath path to icons directory
 * @returns {array} array of icon names for svg-sprite
 */
module.exports = (iconPath) => {
  let iconsList = [];

  if (fs.existsSync(iconPath)) {
    iconsList = fs.readdirSync(iconPath).map((iconName) => iconName.replace(/.svg/g, ''));
  }

  return iconsList;
};
