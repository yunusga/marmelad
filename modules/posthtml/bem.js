const { log } = console;

function _createElemClass(blockClass, elemName, config) {
  return blockClass + config.elemPrefix + elemName;
}

function _createModClass(baseClass, mods, config) {
  let className = '';
  let modClass = '';

  mods
    .replace(/\s{2,}/g, ' ') // remove more than one whitespace
    .replace(/:\s?/g, config.modDlmtr) // remove whitespace after the semicolon
    .split(' ')
    .forEach((mod) => {
      modClass = baseClass + config.modPrefix + mod;
      className += ` ${modClass}`;
    });

  return className;
}

function _createMixClass(baseClass, mix, config) {
  let mixClass = '';
  let block = '';
  let elem = '';
  let mods = '';
  let mixes = '';
  let classList = '';

  const blockRegExp = /block:([\S]*)\b/;
  const elemRegExp = /elem:([\S]*)\b/;
  const modRegExp = /mods:\[(.*)\]/;

  mixes = mix
    .replace(/\s{2,}/g, ' ') // remove more than one whitespace
    .replace(/:\s/g, ':') // remove whitespace after the semicolon
    .replace(/,\s/g, ',') // remove whitespace after the comma
    .split(',');

  mixes.forEach((mixItem) => {
    block = blockRegExp.exec(mixItem) || [];
    elem = elemRegExp.exec(mixItem) || [];
    mods = modRegExp.exec(mixItem) || [];

    if (!block) {
      log('Please add block attribute to a mix definition: ', mixes);
    }

    classList = _createClassList({
      block: block[1],
      elem: elem[1],
      mods: mods[1],
      mix: '',
    }, config);

    mixClass += ` ${classList}`;
  });

  return mixClass;
}

function _createClassList(selector, config) {
  let result = '';
  let block = '';
  let elem = '';

  if (selector.block && !selector.elem) {
    block = selector.block;
    result = block;
  }

  if (selector.block && selector.elem) {
    elem = _createElemClass(selector.block, selector.elem, config);
    result = elem;
  }

  if (selector.mods) {
    result += _createModClass(result, selector.mods, config);
  }

  if (selector.mix) {
    result += _createMixClass(result, selector.mix, config);
  }

  return result;
}

function _assignClassList(attributes, node, config) {
  const classSet = {
    block: '',
    elem: '',
    mod: '',
    mix: '',
  };

  let classes = '';

  ['block', 'elem', 'mods', 'mix'].forEach((attr) => {
    if (attr in attributes) {
      classSet[attr] = attributes[attr];
      delete node.attrs[attr];
    }
  });

  classes = _createClassList(classSet, config);

  if (classes) {
    node.attrs.class = node.attrs.class ? [classes, node.attrs.class].join(' ') : classes;
    return classSet;
  }
}

module.exports = (config) => {
  config = {
    elemPrefix: '__',
    modPrefix: '--',
    modDlmtr: '-',
    ...config,
  };

  return function posthtmlBem(tree) {
    tree.match({ attrs: { block: true } }, (node) => {
      const nodeAttrs = _assignClassList(node.attrs, node, config);

      if (node.content && Array.isArray(node.content)) {
        node.content.forEach((children) => {
          if (children.attrs && children.attrs.elem && !children.attrs.block) {
            children.attrs.block = nodeAttrs.block;
          }
        });
      }
      return node;
    });
    return tree;
  };
};
