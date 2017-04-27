# marmelad <sup>[2.2.3](https://github.com/yunusga/marmelad/blob/develop/CHANGELOG.md)</sup>

Сборщик статичных сайтов на базе Gulp

### Содержание
- [Установка](#Установка)
- [Начало работы](#Начало-работы)
- [Параметры запуска](#Параметры-запуска)
- [Сборка CSS](#Сборка-css)
- [Сборка JS](#Сборка-js)
- [static](#static)

## Установка
```git clone https://github.com/yunusga/marmelad.git && cd marmelad && git checkout develop && git pull origin develop && npm i . -g && npm link```

## Начало работы

- создаем папку проекта, открываем её (папку) в терминале, инициализируем первую сборку командой ```marmelad```
- настраиваем сборку в конфигах или запускаем с параметрами по умолчанию командой ```marmelad```

## Параметры запуска
- ```marmelad``` стандартный запуск (первый для инициализации, все последующие для сборки)
- ```marmelad -a -u user -p pass``` запускает сервер сборки с авторизацией (`user` имя пользователя, `pass` пароль пользователя)

## Сборка CSS

структура иходников файлов стилей

- `marmelad/_blocks/**/*.styl` для блоков (подключаются в файлы)
- `marmelad/stylus/components` переменные, утилиты и базовые стили
- `marmelad/stylus/*.js` каждый файл собирается отдельно отдельно
- `marmelad/js/plugins/**/*.css` стили плагинов, собираются в plugins.min.css

пример сборки базовых стилей вместе с блоками
```styl
// style.styl

@require 'components/_variables';
@require 'components/_utils';
@require 'components/normalize';
@require 'components/content';
@require 'components/controls';
@require 'components/grid';
@require 'components/iconizer';
@require 'components/keyframes';
@require 'components/wordpress';

/* ==========================================================================
   Browser Upgrade Prompt
   ========================================================================== */
.browserupgrade
    margin : base-gutter 0
    background : #ccc
    color : #000
    padding : base-gutter 0


.demo-box
    background-color : #009688
    color #fff
    text-align : center
    padding : base-gutter

.w-container
    width 100%
    max-width : base-content-width
    padding : 0 base-gutter
    margin : 0 auto

@require '../_blocks/**/*';
```

### Примечание
[Stylus](http://stylus-lang.com/) поддерживает [File globbing](http://stylus-lang.com/docs/import.html#file-globbing), поэтому извращенность сборки итогового файла, зависит только от вас :)


## Сборка JS

структура иходников файлов скриптов

- `marmelad/_blocks/**/*.js` для блоков (подключаются в файлы)
- `marmelad/js/vendors` для `jquery`, `modernizr` и т.п. (просто перекладываются)
- `marmelad/js/plugins/**/*.js` для плагинов (обжимаются в `plugins.min.js`)
- `marmelad/js/*.js` каждый файл обрабатывается отдельно

все файлы обрабатываюся, перекладываются в папку выше `marmelad`, по умолчанию в `static`
```
.
└── static
    ├── js
    │   └── vendors
    │       ├── jquery.min.js
    │       └── modernizr.min.js
    ├── plugins.min.js
    ├── ga.js
    └── app.js
```
### подключение скриптов в скрипты :)

подключение файлов обеспечено плагином [gulp-include#include-directives](https://www.npmjs.com/package/gulp-include#include-directives)

#### подключаем все блоки в один файл
```js
// например: в marmelad/js/blocks.js
//=require ../_blocks/**/*.js
```

#### подключаем конкретный блок в файл
```js
// например: в marmelad/js/blocks.native.js
//=require ../_blocks/**/scroll-top.js
```

### Примечание
т.к. под капотом [gulp-include#features](https://www.npmjs.com/package/gulp-include#features) работает [glob](https://www.npmjs.com/package/glob), и если предположить, что часть скриптов блоков, не нуждается в `jquery`, и должны сработать до события `domready` или им просто нет смысла ждать загрузки `jquery`, можно разделить их простыми и понтяными расширениями

 * `.jquery.js` - для зависимых от `jquery`
 * `.vanilla.js` - для независимых скриптов

```
.
└── marmelad
    ├── _blocks
    │   ├── header
    │   │   ├── header.hbs
    │   │   └── header.jquery.js
    │   ├── main
    │   │   ├── main.hbs
    │   │   └── main.vanilla.js
    │   └── footer
    │       ├── footer.hbs
    │       └── footer.jquery.js
    └── js
        ├── blocks.jquery.js
        └── blocks.vanilla.js

// в blocks.jquery.js
//=require ../_blocks/**/*.jquery.js

// в blocks.vanilla.js
//=require ../_blocks/**/*.vanilla.js
```
### eslint
все скрипты, кроме вендорных и плагинов, обрабатываются `eslint`, настроить его можно в файле `marmelad/.eslintrc`, установлены конфиги для `wordpress` и `jquery`, подключен `wordpress` конфиг

### babel
все скрипты, кроме вендорных и плагинов, обрабатываются `babel`, настроить его можно в файле `marmelad/settings.marmelad.js`, ключ `babel`

## static
формирование файловой структуры проекта в целях имитации серверной файловой структуры (если понадобится), файлы копируются напрямую, в корень `dist` с полным повторением вложенности
