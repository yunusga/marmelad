const through = require('through2');
const stylus = require('accord').load('stylus');
const rext = require('replace-ext');
const { extname } = require('path');

const PluginError = require('plugin-error');
const applySourceMap = require('vinyl-sourcemaps-apply');

function guErr(err) {
  return new PluginError('gulp-stylus', err);
}

module.exports = function (options) {
  var opts = Object.assign({}, options);

  return through.obj(function (file, enc, cb) {

    if (file.isStream()) {
      return cb(guErr('Streaming not supported'));
    }
    if (file.isNull()) {
      return cb(null, file);
    }
    if (extname(file.path) === '.css') {
      return cb(null, file);
    }
    if (file.sourceMap || opts.sourcemap) {
      opts.sourcemap = Object.assign({ basePath: file.base }, opts.sourcemap);
    }
    if (file.data) {
      opts.define = file.data;
    }
    opts.filename = file.path;

    stylus.render(file.contents.toString(enc || 'utf-8'), opts)
      .catch(function (err) {
        delete err.input;
        return cb(guErr(err));
      })
      .done(function (res) {
        if (res == null) {
          return;
        }
        if (res.result !== undefined) {
          file.path = rext(file.path, '.css');
          if (res.sourcemap) {
            res.result = res.result.replace(/\/\*[@#][\s\t]+sourceMappingURL=.*?\*\/$/mg, '');
            res.sourcemap.file = file.relative;
            applySourceMap(file, res.sourcemap);
          }
          file.contents = new Buffer.from(res.result);
          return cb(null, file);
        }
      });
  });

};

module.exports.stylus = require('stylus');
