const PluginError = require('plugin-error');
const transform = require('through2').obj;
const fm = require('../front-matter');

const PLUGIN_NAME = 'gulp-nunjucks';

function gulpNunjucks(templater, templateData) {
  return transform((file, enc, cb) => {
    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new PluginError(PLUGIN_NAME, 'Streams are not supported'));
    }

    const data = file.data ? file.data : {};
    let content = file.contents.toString('utf8');

    let frontmatter = {
      attributes: {},
    };

    try {
      frontmatter = fm(content);
      content = frontmatter.body;
    } catch (err) {
      err.message = err.stack.replace(/\n +at[\s\S]*/u, '');

      return cb(new PluginError('Front matter (YAML) parse error', err));
    }

    const context = { ...templateData, ...data, ...frontmatter.attributes };

    templater.env.renderString(content, context, (err, res) => {
      if (err) {
        return cb(new PluginError(PLUGIN_NAME, err));
      }

      file.contents = Buffer.from(res);

      cb(null, file);
    });
  });
}

module.exports = gulpNunjucks;
