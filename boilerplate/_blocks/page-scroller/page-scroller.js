;(function($) {

    'use strict';

    var page          = $('html, body'),
        pageScroller  = $('.m-page-scroller'),
        pageYOffset   = 0,
        inMemory      = false,
        inMemoryClass = 'is-memorized',
        enabledOffset = 60;

    function resetPageScroller() {

        setTimeout(function() {

            if (window.pageYOffset > enabledOffset) {
                pageScroller.addClass('is-visible');
            } else if (!pageScroller.hasClass(inMemoryClass)) {
                pageScroller.removeClass('is-visible');
            }

        }, 150);

        if (!inMemory) {

            pageYOffset = 0;
            pageScroller.removeClass(inMemoryClass);
        }

        inMemory = false;
    }

    if (pageScroller.length > 0) {

        window.addEventListener('scroll', resetPageScroller, false);

        pageScroller.on('click', function(event) {

            event.preventDefault();

            window.removeEventListener('scroll', resetPageScroller);

            if (window.pageYOffset > 0 && pageYOffset === 0) {

                inMemory = true;
                pageYOffset = window.pageYOffset;

                pageScroller.addClass(inMemoryClass);

                page.stop().animate({ scrollTop : 0 }, 500, 'swing', function() {
                    window.addEventListener('scroll', resetPageScroller, false);
                });

            } else {

                pageScroller.removeClass(inMemoryClass);

                page.stop().animate({ scrollTop : pageYOffset }, 500, 'swing', function() {

                    pageYOffset = 0;
                    window.addEventListener('scroll', resetPageScroller, false);
                });

            }
        });
    }

})(jQuery);
