'use strict';

const gutil = require('gulp-util');
const through = require('through2');
const pretty = require('pretty');

module.exports = function (opts) {

    opts = opts || {};

    return through.obj(function (file, enc, cb) {

        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            cb(new gutil.PluginError('gulp-pretty', 'Streaming not supported'));
            return;
        }

        try {
            file.contents = new Buffer(pretty(file.contents.toString(), opts));
            this.push(file);
        } catch (err) {
            this.emit('error', new gutil.PluginError('gulp-<%= pluginName %>', err));
        }

        cb();
    });
};