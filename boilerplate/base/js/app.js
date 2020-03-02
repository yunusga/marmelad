/* ^^^
 * Глобальные-вспомогательные функции
 * ========================================================================== */

/* ^^^
 * Viewport Height Correction
 *
 * @link https://www.npmjs.com/package/postcss-viewport-height-correction
 * ========================================================================== */
function setViewportProperty(){
  var vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', vh + 'px');
}
window.addEventListener('resize', setViewportProperty);
setViewportProperty(); // Call the fuction for initialisation

/* ^^^
 * Возвращает HTML-код иконки из SVG-спрайта
 *
 * @param {String} name Название иконки из спрайта
 * @param {Object} opts Объект настроек для SVG-иконки
 *
 * @example SVG-иконка
 * getSVGSpriteIcon('some-icon', {
 *   tag: 'div',
 *   type: 'icons', // colored для подключения иконки из цветного спрайта
 *   class: '', // дополнительные классы для иконки
 *   mode: 'inline', // external для подключаемых спрайтов
 *   url: '', // путь до файла спрайта, необходим только для подключаемых спрайтов
 * });
 */
function getSVGSpriteIcon(name, opts) {
  opts = Object.assign({
    tag: 'div',
    type: 'icons',
    class: '',
    mode: 'inline',
    url: '',
  }, opts);

  let external = '';
  let typeClass = '';

  if (opts.mode === 'external') {
    external = `${opts.url}/sprite.${opts.type}.svg`;
  }

  if (opts.type !== 'icons') {
    typeClass = ` svg-icon--${opts.type}`;
  }

  opts.class = opts.class ? ` ${opts.class}` : '';

  return `
    <${opts.tag} class="svg-icon svg-icon--${name}${typeClass}${opts.class}" aria-hidden="true" focusable="false">
      <svg class="svg-icon__link">
        <use xlink:href="${external}#${name}"></use>
      </svg>
    </${opts.tag}>
  `;
}

/* ^^^
 * JQUERY Actions
 * ========================================================================== */
$(function() {

  'use strict';

  /**
   * определение существования элемента на странице
   */
  $.exists = (selector) => $(selector).length > 0;

  //=require ../_blocks/**/*.js
});
