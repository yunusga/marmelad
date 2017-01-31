'use strict';

module.exports = function() {

    let args = Array.prototype.slice.call(arguments, 0);
    args.pop();

    return args.join('').toString();
}
