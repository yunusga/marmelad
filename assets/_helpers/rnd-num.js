'use strict';

module.exports = function(min, max) {

    if (arguments.length < 2) {
        throw new Error('handlebars Expression {{{rnd-num}}} expects 2 arguments');
    }

    return Math.floor(min + Math.random() * (max + 1 - min));

};
