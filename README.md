[ci-img]:  https://travis-ci.org/solversgroup/marmelad.svg
[ci]:      https://travis-ci.org/solversgroup/marmelad

# marmelad

[![npm](https://img.shields.io/npm/v/marmelad.svg)](https://www.npmjs.com/package/marmelad) [![npm](https://img.shields.io/npm/dt/marmelad.svg)](https://www.npmjs.com/package/marmelad) [![License](https://img.shields.io/github/license/solversgroup/marmelad)](https://github.com/solversgroup/marmelad/blob/main/LICENSE) ![since Wed Feb 24 08:39:42 2016 +0500](https://img.shields.io/badge/since-Wed%20Feb%2024%2008%3A39%3A42%202016%20%2B0500-blue)

<img src="marmelad.svg?sanitize=true" align="right" title="Marmelad logo made by Jelly beans from www.flaticon.com is licensed by CC 3.0 BY" width="100" height="100">

Заготовка фронтенд проекта для продвинутых и начинающих 🤘. Хорошо подходит для поддержания единой структуры проектов в команде и легкого переиспользования готовых блоков между проектами, благодаря БЭМ подходу к организации файловой структуры и данных проекта.

Зависимости marmelad устанавливаются один раз и в будущем только обновляются, т.е. нет необходимости устанавливать кучу npm зависимостей для каждого проекта. Как следствие, экономия дискового пространства и возможность создания и работы в проектах без интернета.

## Содержание

- [Установка](#установка)
  - [Проблемы установки глобальных модулей для macOS и Linux](#проблемы-установки-глобальных-модулей-для-macos-и-linux)
  - [Из npm](#установка-из-npm)
  - [Для разработчиков](#установка-для-разработчиков)
  - [Для определённого проекта](#установка-для-определённого-проекта)
- [Marmelad CLI](#marmelad-cli)
  - [`init [options]` инициализация](#init-options-инициализация)
  - [`dev [options]` старт сборки](#dev-options-старт-сборки)
  - [`cp <name>` создание страницы](#cp-name-создание-страницы)
  - [`cb <name> [options]` создание блока](#cb-name-options-создание-блока)
  - [`mv <oldName> <newName> [options]` переименование блока](#mv-oldName-newName-options-переименование-блока)
  - [`lint`](#lint-w3c-валидатор)
  - [`dist` релизные задачи](#dist-релизные-задачи)
  - [`pack [name] [options]` архивирование проекта](#pack-name-options-архивирование-проекта)
- [Marmelad TCI](#marmelad-tci)
- [Структура проекта](#структура-проекта)
- [Шаблоны/Блоки](#шаблоныблоки)
  - [Lagman](#lagman)
- [Данные для шаблонов/блоков](#данные-для-шаблоновблоков)
  - [`incw` расширение](#incw-расширение)
- [Сборка стилей](#сборка-стилей)
  - [Post CSS плагины](#post-css-плагины)

## Внимание

> Вам нужно установить [java](https://java.com) для работы с [node-w3c-validator](https://www.npmjs.com/package/node-w3c-validator).

## Установка

> Не пытайтесь установить marmelad путём копирования файлов сборщика с Windows на Linux. Для разных ОС устанавливаются разные зависимости. Пользуйтесь доступными способами для установки.

### Проблемы установки глобальных модулей для macOS и Linux

По умолчанию **npm** устанавливает пакеты локально в ваших проектах. Вы также можете установить установочные пакеты глобально (например, `npm install -g <package>`) (полезно для приложений командной строки). Однако недостатком этого является то, что вам нужно получить **root-права** (или использовать `sudo`) для возможности глобальной установки.

Ознакомьтесь с руководством **NPM** для установки глобальных модулей [Resolving EACCES permissions errors when installing packages globally](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)

### Установка из npm

```bash
npm i marmelad -g
```

### Установка для разработчиков

```bash
git clone https://github.com/solversgroup/marmelad.git
cd marmelad
npm i
npm link # sudo npm link для linux
```

### Установка для определённого проекта

Такой тип установки подходит, когда заказчик требует определённую структуру размещения файлов проекта, либо работа сборщика нуждается в переделке под проектные требования. Там может быть всё что угодно 😱.

Установка для определённого проекта производится также, как и [Установка для разработчиков](#установка-для-разработчиков), отличается только в запуск.

Для инициализируя/запуская **marmelad** необходимо указать путь до исполняемого файла **marmelad**.

```bash
# node C:\marmelad\bin\marmelad.js
node <путь до директории клона>\bin\marmelad.js
```

## Marmelad CLI

После [установки из npm](#установка-из-npm) или [для разработчиков](#установка-для-разработчиков), **marmelad** станет доступен в командной строке/терминале вашей системы как `marmelad` и `mmd`.

Для справки по командам **marmelad** необходимо ввести в консоль/терминал:

```bash
# без параметров
marmelad # или mmd
# или
marmelad --help # или mmd --help

Usage: marmelad [options] [command]

Заготовка фронтенд проекта для продвинутых и начинающих 🤘

Options:
  -v, --version                     output the version number
  -h, --help                        display help for command

Commands:
  init [options] [dir]              initialize new project
  dev [options]                     run development server
  cp <name>                         create new page
  cb [options] <name>               create new block
  mv [options] <oldName> <newName>  rename block
  lint                              lint project
  dist                              Release tasks for project
  pack [options] [name]             Archive project source code (default:tar.gz)
  help [command]                    display help for command

Commands help:
  marmelad [command] --help
  mmd [command] --help

Source files:
  <marmelad installed directory>\marmelad\bin\marmelad.js
Version:
  <marmelad version>
```

### `init [options]` инициализация

Инициализация проходит в 3 этапа:

1. Копирование базовой заготовки с учётом переданных аргументов
2. Копирование в корень нового проекта вспомогательных файлов
3. Инициализация git репозитория в новом проекте

Для инициализации нового проекта, предназначена команда `mmd init [options] [dir]`.

В случае, когда не передан параметр для папки инициализации, проект инициализируется в текущей директории открытой в терминале.

`-c, --css` - заменяет значение ключа `app.css` в `settings.marmelad.js` при копировании заготовки нового проекта. Далее этот ключ используется для команды создания блока `mmd cb`, для создания файлов css препроцессоров, с расширением установленным в `app.css` в `settings.marmelad.js`. Для добавления поддержки в проект на старом проекте после обновления до актуальной версии **marmelad**, необходимо добавить в `settings.marmelad.js` в объект `app` свойство `css` со значением/расширением требуемого css препроцессора.

`-t, --test` - необходим только для тестирования, в разработке проектов никакого смысла он не имеет.

`[dir]` - позволяет инициализировать проект в указанной папке. Например, `mmd init new-and-awesome -t scss`.

### `dev [options]` старт сборки

> **Внимание** если при запуске сборки вы видите ошибку `code: 'MODULE_NOT_FOUND'`, то, скорее всего **marmelad** запускается в директории без предварительно [созданного (`mmd init`)](#init-options-инициализация) пустого **marmelad** проекта.

- `dev` стандартный запуск
- `dev -a` запуск сервера с парольной защитой, логин и пароль генерируются автоматически
- `dev -a <login>@<password>` запуск сервера с парольной защитой, логин и пароль устанавливаются вручную
- `dev --build` одноразовая сборка проекта без запуска слежения за изменениями и пересборки
- `dev --proxy-mod` режим сборки статики + проксирование уже живого сайта с копированием необходимых ресурсов (css,js) в определённую директорию рабочего сайта

> `dev --proxy-mod` ошибка **Error: Missing positive glob** означает что вы не прописали в конфиге директории для копирования, по умолчанию они закомментированы.

### `cp <name>` создание страницы

Файл страницы создаётся в директории `marmelad/_pages`, в имени файла расширение не указывается.

### `cb <name> [options]` создание блока

Файлы блока создаются в директории `marmelad/_blocks`.

```bash
#.tci
cb new-block --t html,js
```

Создаст одноимённый блок, содержащий в себе все необходимые технологии.

```bash
# marmelad/_blocks
new-block
  ├─ new-block.html  # шаблон
  └─ new-block.js    # скрипты
```

Параметр `--t` позволяет указывать конкретно какие технологии необходимо создать. По сути в этот параметр можно перечислить через зяпятую сколько угодно форматов.

Формат для стилей указывать необязательно, если он не будет указан, то команда создаст файл с форматом стилей, который указан в `settings.marmelad.js -> app.css`.

### `mv <oldName> <newName> [options]` переименование блока

Переименовать блок и все вхождения имени блока внутри файлов блока, в случае необходимости. Команда доступна в файле `.tci`.

```bash
# переименование файлов блока
mv old-block-name new-block-name

# переименование файлов блока и все вхождения внутри файлов блока
mv old-block-name new-block-name --hard

# холостой запуск с просмотром планируемых изменений в файлах
mv old-block-name new-block-name --dry --hard
```

### `lint` W3C валидатор

Запуск W3C валидатора на уже собранном проекте.

> Запуск W3C валидатора необходимо выполнять только после сборки проекта, иначе результаты валидации будут некорректны.

```bash
mmd dev --build && mmd lint
```

### `dist` релизные задачи

> Экспериментальная команда, пока никаких опций передать нельзя. Работает только с итоговыми файлами проекта, исходники никак не будут затронуты.

- Форматирование HTML-кода страниц проекта в папке сборки (`static`)
- Обжатие JS/CSS файлов и замена на обжатые в HTML шаблонах (обжимаются файлы без `.min` в названии)
- Прописывание хешей для подключаемых файлов, для сброса кэша
- Сортировка атрибутов HTML элементов

```bash
mmd dev --build && mmd dist
```

### `pack [name] [options]` архивирование проекта

Упаковывает файлы проекта в **tgz** или **zip** архив.

- `pack` **tgz** архив
- `pack -z, --zip` **zip** архив
- `pack -f, --folders [marmelad,static]` упаковать только определённые директории в архив
- `pack --nodt` не подставлять дату и время создания в имя архива (отлючено по умолчанию)
- `pack custom-name` кастомное имя для архива, иначе имя архива позаимсвуется у корневой папки проекта

```bash
pack           # project_11072019-153012.tgz
pack my-name   # my-name_11072019-153012.tgz
pack -z        # project_11072019-153012.zip
pack -f static # project_11072019-153012.tgz только директория static
pack --nodt    # project.tgz без даты и времени в названии (отключено по умолчанию)
```

## Marmelad TCI

TCI (text command interface) - добавлен в шаблон вёрстки и дублирует CLI команды **marmelad** (`cp`, `cb`), т.е. нет необходимости переходить в другую консоль/терминал, и в там уже выполнять доп. действия.

Теперь для этого есть файл **.tci**, все команды вводятся без префиксов `mmd` или `marmelad`.

## Структура проекта

```bash
├─ marmelad
│  ├─ _blocks                   # блоки
│  │   └─ some-block            # блок для примера
│  │       ├─ some-block.html   # шаблон блока
│  │       ├─ some-block.js     # скрипты блока
│  │       ├─ some-block.styl   # стили блока
│  │       └─ some-block.json   # данные блока
│  ├─ _pages                    # страницы
│  ├─ iconizer                  # SVG-иконки для SVG-спрайта
│  │   ├─ colored               # цветные SVG-иконки
│  │   └─ icons                 # монохромные SVG-иконки
│  ├─ snippets                  # сниппеты BEML для редакторов
│  ├─ static                    # статика для вёрстки
│  ├─ styles                    # стили, styl или scss
│  ├─ .editorconfig             # конфиг для редактора
│  ├─ .tci                      # TCI команды marmelad
│  ├─ data.marmelad.js          # глобальные данные
│  └─ settings.marmelad.js      # настройки сборки
└─ static                       # итоговая сборка
```

## Шаблоны/Блоки

- Шаблонизатор [nunjucks](https://mozilla.github.io/nunjucks/)
- БЭМ именование в HTML обеспечивает [posthtml-bem](https://www.npmjs.com/package/posthtml-bem)

### Lagman

Предназначен для оптимизации сборки шаблонов HTML на больших проектах, с большим кол-вом страниц.

**Lagman** строит связи/зависимости страниц от блоков или блоков от страниц. Что позволяет шаблонизатору понимать для какой из страниц изменился блок, и пересобирать HTML только тех страниц, в которых он используется.

Для правильной работы модуля, требуется строгое следовние правилам сборки блоков и страниц.

**Блок должен** содержать разметку БЭМ, с обязательным атрибутом `block`:

```html
<div block="block-name" mods="red">
  ...
</div>
```

Этот атрибут позволяет установить связь между страницей и блоком. В случае если этого атрибута нет в разметке блока, то, этот блок автоматичестки исключается из списка слежения за изменениями, и перестаёт запускать пересборку страниц в которых он используется.

## Данные для шаблонов/блоков

Данные для блока доступны в шаблонах по ключу с названием блока (если файл данных для блока создан и хоть чем-то заполнен), либо из `data.marmelad.js` (глобальные данные). Названия/ключи собственных данных блока преобразуются в **camelCase**.

### `incw` расширение

`incw` - это расширение позволяющее подключать шаблоны блоков с передачей в шаблон отдельных данных, без указания расширения файла блока.

```nunjucks
{# ручная передача данных в шаблон #}
{% incw 'имя шаблона без расширения', {title: 'Example', subtitle: 'An example component'} %}

{# передача данных в шаблон из переменной #}
{% incw 'имя шаблона без расширения', app.lang %}
```

Данные переданные в `incw` доступны внутри шаблона по ключу `_ctx`.

```nunjucks
{# подключение шаблона #}
{% incw 'avatar', { image: 'IMAGE URL', name: 'USERNAME'} %}

{# в шаблоне #}
<div block="incw-template">
  <img src="{{ _ctx.image }}" alt="">
  <span>{{ _ctx.name }}</span>
</div><!-- incw-template -->
```

> Вложенные `incw` не получают `_ctx` родительского блока, только глобальные данные. Для передачи конкретных данных в вложенный `incw` необходимо передать данные явно для вкладываемого `incw`.

## Сборка стилей

Сборка поддерживает `stylus`, `scss`, `sass`.

### Post CSS плагины

- [autoprefixer](https://www.npmjs.com/package/autoprefixer)
- [postcss-easing-gradients](https://www.npmjs.com/package/postcss-easing-gradients)
- [postcss-flexbugs-fixes](https://www.npmjs.com/package/postcss-flexbugs-fixes)
- [postcss-inline-svg](https://www.npmjs.com/package/postcss-inline-svg)
- [postcss-momentum-scrolling](https://www.npmjs.com/package/postcss-momentum-scrolling)
- [postcss-sort-media-queries](https://github.com/solversgroup/postcss-sort-media-queries)

## Iconizer

Iconizer претерпел изменения в плане способах его подключения и использования в шаблонах.

### Использование Iconizer

**В шаблоне**

```HTML+Django
{{ _icon('marmelad', { tag: 'span' }) }}
```

**На выходе**

```HTML
<span class="svg-icon svg-icon--marmelad colored" aria-hidden="true" focusable="false">
  <svg class="svg-icon__link">
    <use xlink:href="#marmelad"></use>
  </svg>
</span>
```

### Опции Iconizer

```HTML+Django
{{ _icon('<name>', {
  tag: 'div',
  type: 'icons',
  class: '',
  mode: 'inline',
  url: '',
}) }}
```

Функция `icon` из `settings.marmelad.js -> iconizer` передаётся в шаблонизатор **nunjucks** под именем `_icon`.

### Типы SVG-спрайта

- `icons` - монохромные иконки, вырезаются все лишние атрибуты оформления
- `colored` - цветные иконки, вырезается только тег `title`

### Пример использования цветной SVG-иконки

Для подключения цветной иконки необходимо добавить атрибут `type="colored"`

```HTML+Django
{{ _icon('marmelad', { type: 'colored' }) }}
```

### Режимы подключения SVG-спрайта

- `inline` - спрайт внедряется в HTML-код страницы
- `external` - используется как отдельный файл, через обращение по URL его размещения

### Миграция для Iconizer 5+

В `settings.marmelad.js`, необходимо удалить:

- `paths.iconizer`
- `app.svgSprite`

```js
const paths = {
  // удалить
  iconizer: {
    ...
  },
};

const app = {
  // удалить
  svgSprite: {
    ...
  },
};
```

Добавить новый объект в `settings.marmelad.js`

```js
const iconizer = {
  cssClass: 'main-svg-sprite',
  mode: 'inline', // external отдельный подключаемый файл спрайта (default:inline)
  dest: path.join(paths.dist, 'img'), // путь для собираемых спрайтов
  url: 'img', // путь до подключаемого спрайта iconizer.dest без paths.dist
  srcIcons: path.join(folders.marmelad, folders.iconizer.src, 'icons'),
  srcColored: path.join(folders.marmelad, folders.iconizer.src, 'colored'),
  icon: (name, opts) => {
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
  },
  plugin: {
    mode: {
      symbol: { // symbol mode to build the SVG
        example: false, // Build sample page
      },
    },
    svg: {
      xmlDeclaration: false, // strip out the XML attribute
      doctypeDeclaration: false, // don't include the !DOCTYPE declaration
    },
  },
};
```

и не забыть добавить его в экспорт настроек

```js
module.exports = {
  // добавить
  iconizer,
};
```

## Задержка отдачи контента сервером `latencyRoutes`

В `settings.marmelad.js app.bsSp` необходимо добавить настройки для задержки отдачи сервером контента

```js
// пример, для новых проектов по умолчанию задержка для /api
latencyRoutes: [
  {
    route: '/css',
    latency: 3000,
    active: true,
  },
],
```

## Лицензия

[MIT](LICENSE)

## Кодекс Поведения участника

Прочтите [Кодекс Поведения участника](CODE_OF_CONDUCT)

*Логотип был взят и изменён, из набора иконок автора <a href="https://www.flaticon.com/authors/freepik" title="Jelly beans">Jelly beans</a> распространяемого под лицензией <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a> с <a href="https://www.flaticon.com/"     title="Flaticon">www.flaticon.com</a>*

[В начало 🔝](#marmelad)
