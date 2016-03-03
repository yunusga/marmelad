/*
 * gulp-svg-mix
 * Licensed under the MIT license.
 */

"use strict";

var fs          = require('fs');
var through     = require('through2');
var gutil       = require('gulp-util');
var PluginError = gutil.PluginError;

function icon(name, options) {

    var options = options || {};
    var size    = options.size ? ' svg-icon--' + options.size : '';
    var classes = 'svg-icon svg-icon--' + name + size + ' ' + (options.class || '');
    classes     = classes.trim();

    var icon = '<svg class="svg-icon__link"><use xlink:href="#' + name + '" /></svg>';
    var html =  '<' + options.tag + ' class="' + classes + '">' + wrapSpinner(icon, classes) + '</' + options.tag + '>';

    return html;
}

function wrapSpinner(html, klass) {
    if (klass.indexOf('spinner') > -1) {
        return '<div class="svg-icon__spinner">' + html + '</div>';
    } else {
        return html;
    }
}

function buildParamsFromString(string) {
    var match, attr, value;
    var params = {};
    var attrsRegexp = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/gi;

    while (match = attrsRegexp.exec(string)) {
        attr  = match[1];
        value = match[2].replace(/'|"/, '');
        params[attr] = value;
    }

    return params;
}

function replaceIconTags(src) {
    var match, tag, params, name;
    var html = src.toString();
    var iconRegexp = /<icon\s+([-=\w\d'"\s]+)\s*\/?>(<\/icon>)?/gi;

    while (match = iconRegexp.exec(html)) {
        tag     = match[0];
        params  = buildParamsFromString(match[1]);
        name    = params.name;

        delete params.name;

        html = html.replace(tag, icon(name, params));
    }

    return html;
}

function iconizeHtml(src, options) {

    var sprite = fs.readFileSync(options.path).toString();

    var html = src.toString();

    if (html.indexOf(sprite) == -1) {
        sprite = sprite.replace(/\n/g,'');
        sprite = sprite.replace(/<defs[\s\S]*?\/defs><path[\s\S]*?\s+?d=/g, '<path d=');
        sprite = sprite.replace(/<style[\s\S]*?\/style><path[\s\S]*?\s+?d=/g, '<path d=');
        sprite = sprite.replace(/\sfill[\s\S]*?(['"])[\s\S]*?\1/g, '');
        sprite = sprite.replace(/(['"])[\s\S]*?\1/, function(match) { return match + ' class="main-svg-sprite"' });
        html = html.replace(/<body.*?>/, function(match) { return match + '\n' + sprite });
    }

    return replaceIconTags(html);
}

module.exports = function(options) {

    return through.obj(function(file, enc, cb) {
        if (file.isNull()) {
            cb(null, file);
        }

        var html = iconizeHtml(file.contents, options);

        if (file.isBuffer()) {
            file.contents = new Buffer(html);
        }

        if (file.isStream()) {
            this.emit("error", new PluginError("gulp-svg-mix", "Streaming not supported"));
            return cb();
        }

        this.push(file);
        cb(null, file);
    });
}
