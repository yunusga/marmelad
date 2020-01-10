const url = require('url');
const hasha = require('hasha');

function setFileHash(src, path) {

  const parsed = url.parse(src);

  if (parsed.protocol) {
    return src;
  }

  const uri = parsed.pathname;
  const searchParams = new URLSearchParams(parsed.search);

  let hash = '';

  if (global._mmdHashes.has(uri)) {
    hash = global._mmdHashes.get(uri);
  } else {
    hash = hasha.fromFileSync(`${path}/${uri}`, { algorithm: 'sha1', encoding: 'hex' });
    global._mmdHashes.set(uri, hash);
  }

  searchParams.set('v', hash);

  return `${uri}?${searchParams.toString()}`;
}

module.exports = (options = {}) => (tree) => new Promise((resolve, reject) => {
  if (!global._mmdHashes) {
    global._mmdHashes = new Map();
  }

  let tags = ['link', 'script'];
  let attributes = ['href', 'src'];

  if (options.tags && Array.isArray(options.tags)) {
    tags = [...new Set([...tags, ...options.tags])];
  }

  if (options.exclude) {
    tags = tags.filter((tag) => !options.exclude.includes(tag));
  }

  if (options.attributes && Array.isArray(options.attributes)) {
    attributes = [...new Set([...attributes, ...options.attributes])];
  }

  if (!Array.isArray(tree)) {
    reject(new Error('tree is not Array'));
  }

  if (tree.length === 0) {
    resolve(tree);
  }

  tree.walk((node) => {
    if (node.tag && node.attrs) {
      node.attrs = Object.keys(node.attrs).reduce((attributeList, attr) => {
        if (tags.includes(node.tag) && attributes.includes(attr)) {
          return Object.assign(attributeList, { [attr]: setFileHash(node.attrs[attr], options.path) });
        }

        return attributeList;
      }, node.attrs);
    }

    return node;
  });

  resolve(tree);
});
