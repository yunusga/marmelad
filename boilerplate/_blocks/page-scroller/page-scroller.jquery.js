;(function($) {

    'use strict';

    var page           = $('html, body');
    var pageScroller   = $('.page-scroller'),
        pageYOffset    = 0,
        inMemory       = false,
        inMemoryClass  = 'page-scroller--memorized',
        isVisibleClass = 'page-scroller--visible',
        enabledOffset  = 60;

    function resetPageScroller() {

        setTimeout(function() {

            if (window.pageYOffset > enabledOffset) {
                pageScroller.addClass(isVisibleClass);
            } else if (!pageScroller.hasClass(inMemoryClass)) {
                pageScroller.removeClass(isVisibleClass);
            }

        }, 150);

        if (!inMemory) {

            pageYOffset = 0;
            pageScroller.removeClass(inMemoryClass);
        }

        inMemory = false;
    }

    if (pageScroller.length > 0) {

        window.addEventListener('scroll', resetPageScroller, window.supportsPassive ? { passive: true } : false);

        pageScroller.on('click', function(event) {

            event.preventDefault();

            window.removeEventListener('scroll', resetPageScroller);

            if (window.pageYOffset > 0 && pageYOffset === 0) {

                inMemory = true;
                pageYOffset = window.pageYOffset;

                pageScroller.addClass(inMemoryClass);

                page.stop().animate({ scrollTop : 0 }, 500, 'swing', function() {
                    window.addEventListener('scroll', resetPageScroller, window.supportsPassive ? { passive: true } : false);
                });

            } else {

                pageScroller.removeClass(inMemoryClass);

                page.stop().animate({ scrollTop : pageYOffset }, 500, 'swing', function() {

                    pageYOffset = 0;
                    window.addEventListener('scroll', resetPageScroller, window.supportsPassive ? { passive: true } : false);
                });

            }
        });
    }

})(jQuery);
