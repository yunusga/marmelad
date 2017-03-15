'use strict';

/**
 * Render a raw text of template
 * @param {Object} `options` Handlebars provided options object
 * @return {String} raw text of template.
 *
 * Usage: {{{{raw}}}} template {{{{/raw}}}}
 */
module.exports = function(options) {

    return options.fn(this);
};
