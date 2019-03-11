const PAGE = $('html, body');
const pageScroller   = $('.page-scroller');
const inMemoryClass = 'page-scroller--memorized';
const isVisibleClass = 'page-scroller--visible';
const enabledOffset = 60;

let pageYOffset = 0;
let inMemory = false;

function resetPageScroller() {
  setTimeout(() => {
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

      PAGE.stop().animate({ scrollTop : 0 }, 500, 'swing', () => {
        window.addEventListener('scroll', resetPageScroller, window.supportsPassive ? { passive: true } : false);
      });

    } else {
      pageScroller.removeClass(inMemoryClass);

      PAGE.stop().animate({ scrollTop : pageYOffset }, 500, 'swing', () => {
        pageYOffset = 0;
        window.addEventListener('scroll', resetPageScroller, window.supportsPassive ? { passive: true } : false);
      });
    }
  });
}
