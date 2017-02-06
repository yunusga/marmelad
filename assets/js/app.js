// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license

;(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
            || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
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
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        var callNow = immediate && !timeout;

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);

        if (callNow) func.apply(context, args);
    };
};

/**
 * определение версии IE 10 или 11
 *
 * @returns {Number} 10, 11, или 0 если это не IE
 */
function GetIEVersion() {

    var sAgent = window.navigator.userAgent;
    var Idx = sAgent.indexOf("MSIE");

    // If IE, return version number.
    if (Idx > 0) {
        return parseInt(sAgent.substring(Idx+ 5, sAgent.indexOf(".", Idx)));
    }

    // If IE 11 then look for Updated user agent string.
    else if (!!navigator.userAgent.match(/Trident\/7\./)) {
        return 11;
    }

    else {
        return 0; //It is not IE
    }
}


// Test via a getter in the options object to see if the passive property is accessed
var supportsPassive = false;
try {
    var opts = Object.defineProperty({}, 'passive', {
        get: function() {
            supportsPassive = true;
        }
    });
    window.addEventListener("test", null, opts);
} catch (e) {}

// Use our detect's results. passive applied if supported, capture will be false either way.
//elem.addEventListener('touchstart', fn, supportsPassive ? { passive: true } : false);


/**
 * генерация HTML кода для svg-иконки
 */
function getMarmeladIconHTML(name, tag, attrs) {

    if (typeof name === 'undefined') {
        console.error('name is required');
        return false;
    }

    if (typeof tag === 'undefined') {
        tag = 'div';
    }

    var classes = 'svg-icon svg-icon--<%= name %>';

    var iconHTML = [
        '<<%= tag %> <%= classes %>>',
        '<svg class="svg-icon__link">',
        '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#<%= name %>"></use>',
        '</svg>',
        '</<%= tag %>>'
    ]
        .join('')
        .replace(/<%= classes %>/g, 'class="' + classes + '"')
        .replace(/<%= tag %>/g, tag)
        .replace(/<%= name %>/g, name);

    return iconHTML;

}