const parser = require('js-yaml');

const optionalByteOrderMark = '\\ufeff?';
const platform = typeof process !== 'undefined' ? process.platform : '';
const pattern = `^(${optionalByteOrderMark}(= yaml =|---)$([\\s\\S]*?)^(?:\\2|\\.\\.\\.)\\s*$${(platform === 'win32' ? '\\r?' : '')}(?:\\n)?)`;

// NOTE: If this pattern uses the 'g' flag the `regex` variable definition will
// need to be moved down into the functions that use it.
const regex = new RegExp(pattern, 'm');

function computeLocation(match, body) {
  const offset = match.index + match[0].length;

  let pos = body.indexOf('\n');
  let line = 1;

  while (pos !== -1) {
    if (pos >= offset) {
      return line;
    }

    line += 1;

    pos = body.indexOf('\n', pos + 1);
  }

  return line;
}

function parse(string) {
  const match = regex.exec(string);

  if (!match) {
    return {
      attributes: {},
      body: string,
      bodyBegin: 1,
    };
  }

  const yaml = match[match.length - 1].replace(/^\s+|\s+$/g, '').replace(/\t/g, '  ');
  const attributes = parser.load(yaml) || {};
  const body = string.replace(match[0], '');
  const bodyBegin = computeLocation(match, string);

  return {
    attributes,
    body,
    bodyBegin,
    yaml,
  };
}

function extractor(string = '') {
  const lines = string.split(/(\r?\n)/);

  if (lines[0] && /= yaml =|---/.test(lines[0])) {
    return parse(string);
  }

  return {
    attributes: {},
    body: string,
    bodyBegin: 1,
  };
}

function test(string = '') {
  return regex.test(string);
}

module.exports = extractor;
module.exports.test = test;
