/**
 * Подключение JS файлов которые начинаются с подчеркивания
 */
//=require ../_blocks/**/_*.js

$(function() {

    'use strict';

    /**
     * определение существования элемента на странице
     */
    $.exists = function(selector) {
        return ($(selector).length > 0);
    };

    /**
     * [^_]*.js - выборка всех файлов, которые не начинаются с подчеркивания
     */
    //=require ../_blocks/**/[^_]*.jquery.js
});
