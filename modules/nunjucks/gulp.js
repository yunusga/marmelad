const PluginError = require('plugin-error');
const transform = require('through2').obj;

const PLUGIN_NAME = 'gulp-nunjucks';

function gulpNunjucks(templater, templateData) {
  return transform((file, enc, cb) => {
    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new PluginError(PLUGIN_NAME, 'Streams are not supported'));
    }

    const string = file.contents.toString('utf8');
    const data = file.data ? file.data : {};
    const fm = file.frontMatter ? file.frontMatter : {};
    const context = { ...templateData, ...data, ...fm };

    templater.env.renderString(string, context, (err, res) => {
      if (err) {
        return cb(new PluginError(PLUGIN_NAME, err));
      }

      file.contents = Buffer.from(res);

      cb(null, file);
    });
  });
}

module.exports = gulpNunjucks;
