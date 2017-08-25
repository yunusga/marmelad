'use strict';

const gutil    = require('gulp-util');
const through  = require('through2');
const beautify = require('js-beautify');
const condense = require('condense-newlines');


function ocd(str, opts) {

    // Normalize and condense all newlines
    return condense(str, opts)
        // Remove empty whitespace the top of a file.
        .replace(/^\s+/g, '')
        // Remove extra whitespace from eof
        .replace(/\s+$/g, '\n')

        // Add a space above each comment
        .replace(/(\s*<!--)/g, '\n$1')
        // Bring closing comments up to the same line as closing tag.
        .replace(/>(\s*)(?=<!--\s*\/)/g, '> ');
}

function pretty(str, opts) {

    opts = Object.assign({
        unformatted: ['code', 'pre', 'em', 'strong', 'span'],
        indent_inner_html: true,
        indent_char: ' ',
        indent_size: 2,
        sep: '\n'
    }, opts);
  
    str = beautify.html(str, opts);

    if (opts.ocd === true) {

        if (opts.newlines) {
            opts.sep = opts.newlines;
        }
        
        return ocd(str, opts);
    }

    return str;
};

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