const path = require('path');
/**
 * {% component 'name', {title: 'Example', subtitle: 'An example component'} %}
 */
class Incw {
  constructor(env, store, opts) {
    this._env = env;
    this._opts = opts;
    this._store = store;
    this.tags = ['incw'];
  }

  parse(parser, nodes) {
    const token = parser.nextToken();
    const args = parser.parseSignature(null, true);
    parser.advanceAfterBlockEnd(token.value);

    return new nodes.CallExtension(this, 'run', args);
  }

  run(context, name, data) {
    Object.assign(this._store, {
      _ctx: data,
    });

    return this._env.render(path.join(process.cwd(), this._opts.paths._blocks, name, `${name}.html`), this._store);
  }
}

module.exports = Incw;
