/**
 * @module limitTo
 *
 * Creates a new array or string containing only a specified number of elements.
 * The elements are taken from either the beginning or the end of the source array
 * or string, as specified by the value and sign (positive or negative) of limit.
 *
 * Same behavior as AngularJS limitTo filter: http://docs.angularjs.org/api/ng/filter/limitTo
 *
 * To use this filter in a template, first register it in the Nunjucks environment:
 *   env.addFilter('limitTo', limitTo);
 *
 * @example <caption>Limit to first 5 characters of string</caption>
 *   {{ "hello world" | limitTo(5) }}
 *   // outputs: hello
 *
 * @example <caption>Limit to last 5 characters of string</caption>
 *   {{ "hello world" | limitTo(-5) }}
 *   // outputs: world
 *
 * @example <caption>Limit to first 3 items in array</caption>
 *   {% set items = ["alpha","beta","charlie","delta","echo"] %}
 *   {% for item in items | limitTo(3) %} {{ loop.index }}.{{ item }} {% endfor %}
 *   // outputs: 1.alpha 2.beta  3.charlie
 *
 * @example <caption>Limit to last 3 items in array</caption>
 *   {% set items = ["alpha","beta","charlie","delta","echo"] %}
 *   {% for item in items | limitTo(-3) %} {{ loop.index }}.{{ item }} {% endfor %}
 *   // outputs: 1.charlie 2.delta 3.echo
 *
 * @param {String|Array} input  text or list of items to shorten
 * @param {Number} limit        either positive offset from start or negative offset from end
 */
function limitTo(input, limit) {
    
    'use strict';

    if (typeof limit !== 'number') {
        return input;
    }

    if (typeof input === 'string') {

        if(limit >= 0){
            return input.substring(0, limit);
        } else {
            return input.substr(limit);
        }
    }

    if (Array.isArray(input)) {

        limit = Math.min(limit, input.length);

        if (limit >= 0) {
            return input.splice(0, limit);
        } else {
            return input.splice(input.length + limit, input.length);
        }
    }
    
    return input;
}

module.exports = limitTo;