'use strict';

module.exports = function(amount, options) {

    let accum = '';

    for (let i = 0; i < amount; ++i) {
        accum += options.fn({index : i});
    }

    return accum;
};
