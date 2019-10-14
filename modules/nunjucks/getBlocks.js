const fs = require('fs');
/**
 * Return array of paths to blocks.
 * @param {string} blocksPath path to _blocks directory
 * @returns {array} array of paths to blocks
 */
module.exports = (blocksPath) => fs.readdirSync(blocksPath).map((el) => `${blocksPath}/${el}`);
