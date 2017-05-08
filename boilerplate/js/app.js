// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license

;(function() {
    var lastTime = 0,
        vendors = ['ms', 'moz', 'webkit', 'o'],
        x;
    for(x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
            || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {

        window.requestAnimationFrame = function (callback) {
            var currTime   = new Date().getTime(),
                timeToCall = Math.max(0, 16 - (currTime - lastTime))
                , id       = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {

        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
}());

/**
 * Возвращает функцию, которая не будет срабатывать, пока продолжает вызываться.
 * Она сработает только один раз через N миллисекунд после последнего вызова.
 * Если ей передан аргумент `immediate`, то она будет вызвана один раз сразу после
 * первого запуска.
 */
function debounce(func, wait, immediate) {

    var timeout;

    return function() {
        var context = this,
            args = arguments,
            later = function() {

                timeout = null;
                if (!immediate) {
                    func.apply(context, args);
                }
            },
            callNow = immediate && !timeout;

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);

        if (callNow) { func.apply(context, args); }
    };
}

// Test via a getter in the options object to see if the passive property is accessed
var supportsPassive = false,
    supportsPassiveOpts;

try {
    supportsPassiveOpts = Object.defineProperty({}, 'passive', {
        get: function() {
            supportsPassive = true;
        }
    });
    window.addEventListener('est', null, supportsPassiveOpts);
} catch (e) {}

// Use our detect's results. passive applied if supported, capture will be false either way.
//elem.addEventListener('touchstart', fn, supportsPassive ? { passive: true } : false);

$(function() {

    'use strict';

    /**
     * определение существования элемента на странице
     */
    $.exists = function(selector) {
        return ($(selector).length > 0);
    };

    //=require ../_blocks/**/*
});
