/**
 * Возвращает функцию, которая не будет срабатывать, пока продолжает вызываться.
 * Она сработает только один раз через N миллисекунд после последнего вызова.
 * Если ей передан аргумент `immediate`, то она будет вызвана один раз сразу после
 * первого запуска.
 */
function debounce(func, wait, immediate) {

    let timeout = null,
        context = null,
        args = null,
        later = null,
        callNow = null;

    return function() {

        context = this;
        args = arguments;

        later = function() {

            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        };
        callNow = immediate && !timeout;

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);

        if (callNow) {
            func.apply(context, args);
        }
    };
}
