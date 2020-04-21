const fs = require('fs');
const path = require('path');

module.exports = {
  plugin() {},
  hooks: {
    'client:js': fs.readFileSync( path.join(__dirname, 'client.js'), 'utf-8'),
  },
};
