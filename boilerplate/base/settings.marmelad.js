const path = require('path');
const fs = require('fs');

const folders = {
  dist: 'static',
  storage: '',
  marmelad: 'marmelad',
  _blocks: '_blocks',
  _pages: '_pages',
  iconizer: {
    src: 'iconizer',
    icons: 'icons',
  },
  js: {
    src: 'js',
    vendors: 'vendors',
    plugins: 'plugins',
  },
  styles: 'styles',
  static: 'static',
};

const paths = {
  dist: path.join(folders.dist),
  storage: path.join(folders.dist, folders.storage),
  marmelad: path.join(folders.marmelad),
  _blocks: path.join(folders.marmelad, folders._blocks),
  _pages: path.join(folders.marmelad, folders._pages),
  js: {
    src: path.join(folders.marmelad, folders.js.src),
    vendors: path.join(folders.marmelad, folders.js.src, folders.js.vendors),
    plugins: path.join(folders.marmelad, folders.js.src, folders.js.plugins),
  },
  styles: path.join(folders.marmelad, folders.styles),
  static: path.join(folders.marmelad, folders.static),
};

const iconizer = {
  cssClass: 'main-svg-sprite',
  mode: 'inline', // external отдельный подключаемый файл спрайта (default:inline)
  dest: path.join(paths.dist, 'img'), // путь для собираемых спрайтов
  url: 'img', // путь до подключаемого спрайта iconizer.dest без paths.dist
  srcIcons: path.join(folders.marmelad, folders.iconizer.src, 'icons'),
  srcColored: path.join(folders.marmelad, folders.iconizer.src, 'colored'),
  icon(name, opts) {
    opts = {
      tag: 'span',
      type: 'icons',
      class: '',
      mode: this.ctx.app.settings.iconizer.mode,
      url: this.ctx.app.settings.iconizer.url,
      ...opts,
    };

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
      <${opts.tag} class="svg-icon svg-icon--${name}${typeClass}${opts.class}" aria-hidden="true">
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

const autoprefixer = {
  overrideBrowserslist: [
    '>= 1%',
    'last 2 major version',
    'not dead',
    'Chrome >= 45',
    'Firefox >= 38',
    'Edge >= 12',
    'Explorer >= 10',
    'iOS >= 9',
    'Safari >= 9',
    'Android >= 4.4',
    'Opera >= 30',
  ],
};

const app = {
  css: '<%- css %>',
  watchOpts: {
    ignoreInitial: true,
    ignored: [
      `${folders.marmelad}/**/*.db`,
      `${folders.marmelad}/**/*tmp*`,
    ],
    usePolling: false,
    cwd: process.cwd(),
  },
  cssnano: {
    zIndex: false,
  },
  beml: {
    elemPrefix: '__',
    modPrefix: '--',
    modDlmtr: '-',
  },
  autoprefixer,
  postcss: {
    // sortMQ: {},
    // momentumScrolling: [],
    // easingGradients: {},
    // inlineSvg: {},
  },
  bsSP: {
    server: {
      baseDir: paths.dist,
    },
    port: 8967,
    online: false,
    open: false,
    directory: true,
    ghostMode: false,
    notify: true,
    logLevel: 'info',
    logPrefix: 'MARMELAD STATIC',
    logFileChanges: false,
    ui: false,
    latencyRoutes: [
      {
        route: '/api',
        latency: 3000,
        active: true,
      },
    ],
  },
  bts: {
    use: '<%- btsUse %>',
    donor: '<%- btsDonor %>',
    4: {
      code: '4.4.1',
      src: {
        css: path.join(paths.marmelad, 'bootstrap', '4.4.1'),
        js: path.join(paths.marmelad, 'bootstrap', '4.4.1'),
      },
      dest: {
        css: path.join(paths.storage, 'bootstrap', 'css'),
        js: path.join(paths.storage, 'bootstrap'),
      },
      sass: {
        precision: 6,
        outputStyle: 'expanded',
      },
      autoprefixer,
    },
  },
};

const proxy = {
  sources: {
    copy: [
      // path.join(folders.static, 'css'),
      // path.join(folders.static, 'fonts'),
      // path.join(folders.static, 'js'),
    ], // ресурсы для копирования
    ignored: [
      `${folders.static}/**/*.db`,
      `${folders.static}/**/*tmp*`,
    ],
    to: 'marmelad-no-proxy-folder-targer', // путь до директории копирования (wp-content/themes/marmelad)
  },
  server: {
    proxy: 'http://marmelad.loc',
    logFileChanges: false,
    ui: false,
    open: false,
    latencyRoutes: [
      {
        route: '/wp-admin/admin-ajax.php',
        latency: 3000,
        active: true,
      },
    ],
  },
};

const w3cValidator = {
  format: 'html',
  skipNonHtml: true,
  exec: {
    maxBuffer: 1024 * 1024,
  },
  reportName: 'w3c-validator.html',
};

const pretty = {
  html: {
    indent_size: 4,
    indent_char: '',
    indent_with_tabs: true,
    wrap_line_length: 0,
    preserve_newlines: false,
    unformatted: ['code', 'pre', 'em', 'strong', 'span', 'i', 'b', 'br', 'symbol'],
  },
};

const _fns = {
  inline: (filePath) => fs.readFileSync(`marmelad/${filePath}`),
};

const dist = {
  attrSorter: {
    order: [
      'id', 'class', 'name',
      'data-.+', 'ng-.+', 'src',
      'for', 'type', 'href',
      'values', 'title', 'alt',
      'role', 'aria-.+',
      '$unknown$',
    ],
  },
  hasher: {
    attributes: [],
    path: paths.dist,
  },
};

module.exports = {
  folders,
  app,
  _fns,
  paths,
  iconizer,
  proxy,
  w3cValidator,
  pretty,
  dist,
};
