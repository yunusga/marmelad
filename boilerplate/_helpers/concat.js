'use strict';
/**
 * Concat args to string
 *
 * usage : param=(concat arg1 "some-text" arg2 etc...)
 *
 * @returns {string}
 */
module.exports = function() {

    let args = Array.prototype.slice.call(arguments, 0);
    args.pop();

    return args.join('').toString();
};
