'use strict';

/**
 * Render a raw text of template
 * @param {Object} `options` Handlebars provided options object
 * @return {String} raw text of template.
 *
 * Usage: {{{{raw}}}} template {{{{/raw}}}}
 */
const fs   = require('fs');
const path = require('path');

module.exports = function(options) {

    let args    = options.hash;

    let src     = args.src     ? `src="${args.src}"`       : '';
    let classes = args.classes ? `class="${args.classes}"` : '';
    let alt     = args.alt     ? `alt="${args.alt}"`       : '';
    let block   = args.block   ? `block="${args.block}"`   : '';
    let elem    = args.elem    ? `elem="${args.elem}"`     : '';
    let mod     = args.mod     ? `mod="${args.mod}"`       : '';
    let image   = '';

    if (args.inline) {

        image = fs.readFileSync(path.join(process.cwd(), 'dist', args.src), 'utf8');

        console.log(typeof image);

        if (path.extname(args.src) == '.svg' && typeof image == 'string') {
            image = image.replace(/\n/g,'');
            image = image.replace(/<defs[\s\S]*?\/defs><path[\s\S]*?\s+?d=/g, '<path d=');
            image = image.replace(/<style[\s\S]*?\/style><path[\s\S]*?\s+?d=/g, '<path d=');
            image = image.replace(/\sfill[\s\S]*?(['"])[\s\S]*?\1/g, '');
        } else {
            image = `<img ${src} ${classes} ${block} ${elem} ${mod} ${alt}>`;
        }

    } else {
        image = `<img ${src} ${classes} ${block} ${elem} ${mod} ${alt}>`;
    }

    return image;
}
