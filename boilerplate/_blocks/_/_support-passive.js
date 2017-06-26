;(function() {

    // Test via a getter in the options object to see if the passive property is accessed
    
    let supportsPassiveOpts = null;

    try {
        supportsPassiveOpts = Object.defineProperty({}, 'passive', {
            get: function() {
                window.supportsPassive = true;
            }
        });
        window.addEventListener('est', null, supportsPassiveOpts);
    } catch (e) {}

    // Use our detect's results. passive applied if supported, capture will be false either way.
    //elem.addEventListener('touchstart', fn, supportsPassive ? { passive: true } : false);

}());