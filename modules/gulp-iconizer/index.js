/*
 * gulp-iconizer
 * Licensed under the MIT license.
 */

'use strict';

const fs          = require('fs');
const through     = require('through2');
const gutil       = require('gulp-util');
const PluginError = gutil.PluginError;

function icon(name, options) {

    options = options || {};

    let size    = options.size ? `svg-icon_${options.size}` : '';
    let classes = `svg-icon svg-icon_${name} ${size} ${(options.class || '')}`;

    classes     = classes.trim();

    options.tag = (typeof options.tag === 'undefined') ? 'div' : options.tag;

    let icon = `<svg class="svg-icon__link"><use xlink:href="#${name}" /></svg>`;

    return `<${options.tag} class="${classes}">${wrapSpinner(icon, classes)}</${options.tag}>`;

}

function wrapSpinner(html, klass) {

    if (klass.indexOf('spinner') > -1) {
        return `<div class="svg-icon__spinner">${html}</div>`;
    } else {
        return html;
    }
}

function buildParamsFromString(string) {

    let match, attr, value;
    let params = {};
    let attrsRegexp = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/gi;

    while (match = attrsRegexp.exec(string)) {
        attr  = match[1];
        value = match[2].replace(/'|"/, '');
        params[attr] = value;
    }

    return params;
}

function replaceIconTags(src) {

    let match, tag, params, name;
    let html = src.toString();
    let iconRegexp = /<icon\s+([-=\w\d\c{}'"\s]+)\s*\/?>|<\/icon>/gi;

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

    let sprite = fs.readFileSync(options.path).toString();

    let html = src.toString();

    if (html.indexOf(sprite) === -1) {
        sprite = sprite.replace(/\n/g,'');
        sprite = sprite.replace(/<defs[\s\S]*?\/defs><path[\s\S]*?\s+?d=/g, '<path d=');
        sprite = sprite.replace(/<style[\s\S]*?\/style><path[\s\S]*?\s+?d=/g, '<path d=');
        sprite = sprite.replace(/\sfill[\s\S]*?(['"])[\s\S]*?\1/g, '');
        sprite = sprite.replace(/(['"])[\s\S]*?\1/, function(match) { return match + ' class="main-svg-sprite"' });
        html = html.replace(/<body.*?>/, function(match) { return `${match}\n\n    ${sprite}\n` });
    }

    return replaceIconTags(html);
}

module.exports = function(options) {

    return through.obj(function(file, enc, cb) {

        if (file.isNull()) {
            cb(null, file);
        }

        let html = iconizeHtml(file.contents, options);

        if (file.isBuffer()) {
            file.contents = new Buffer(html);
        }

        if (file.isStream()) {
            this.emit('error', new PluginError('gulp-iconizer', 'Streaming not supported'));
            return cb();
        }

        this.push(file);
        cb(null, file);
    });
};
