'use strict';

let path = require('path');

let folders = {
    dist    : 'static',
    storage : '',
    marmelad: 'marmelad',
    _blocks : '_blocks',
    _pages  : '_pages',
    iconizer: {
        src  : 'iconizer',
        icons: 'icons'
    },
    js: {
        src    : 'js',
        vendors: 'vendors',
        plugins: 'plugins'
    },
    styles: 'styles',
    static: 'static'
};

let paths = {
    dist    : path.join(folders.dist),
    storage : path.join(folders.dist, folders.storage),
    marmelad : path.join(folders.marmelad),
    _blocks : path.join(folders.marmelad, folders._blocks),
    _pages  : path.join(folders.marmelad, folders._pages),
    iconizer: {
        src  : path.join(folders.marmelad, folders.iconizer.src),
        icons: path.join(folders.marmelad, folders.iconizer.src, folders.iconizer.icons),
    },
    js      : {
        src    : path.join(folders.marmelad, folders.js.src),
        vendors: path.join(folders.marmelad, folders.js.src, folders.js.vendors),
        plugins: path.join(folders.marmelad, folders.js.src, folders.js.plugins),
    },
    styles  : path.join(folders.marmelad, folders.styles),
    static  : path.join(folders.marmelad, folders.static),
};

let autoprefixer = {
    browsers: [
        "last 1 major version",
        ">= 1%",
        "Chrome >= 45",
        "Firefox >= 38",
        "Edge >= 12",
        "Explorer >= 10",
        "iOS >= 9",
        "Safari >= 9",
        "Android >= 4.4",
        "Opera >= 30"
    ]
};

let app = {
    cssnano : {
        zIndex: false
    },
    beml        : {
        elemPrefix: '__',
        modPrefix : '--',
        modDlmtr  : '-'
    },
    formatHtml : {
        unformatted: ['code', 'pre', 'em', 'strong', 'span', 'svg'],
        indent_inner_html: true,
        indent_char: ' ',
        indent_size: 2,
        sep: '\n',
        ocd: true
    },
    autoprefixer,
    bsSP        : {
        server        : {
            baseDir: paths.dist
        },
        port          : 8967,
        open          : false,
        directory     : true,
        ghostMode     : false,
        notify        : true,
        logLevel      : 'info',
        logPrefix     : 'MARMELAD STATIC',
        logFileChanges: false,
        ui            : false
    },
    svgSprite   : {
        mode: {
            symbol: { // symbol mode to build the SVG
                dest   : paths.iconizer.src, // destination folder
                sprite : 'sprite.svg', //sprite name
                example: false // Build sample page
            }
        },
        svg : {
            xmlDeclaration    : false, // strip out the XML attribute
            doctypeDeclaration: false // don't include the !DOCTYPE declaration
        }
    },
    bts : {
        use: 4,
        4: {
            code: '4.1.0',
            src : {
                css: path.join(paths.marmelad, 'bootstrap', '4.1.0'),
                js: path.join(paths.marmelad, 'bootstrap', '4.1.0'),
            },
            dest: {
                css: path.join(paths.storage, 'bootstrap', 'css'),
                js: path.join(paths.storage, 'bootstrap')
            },
            sass: {
                precision  : 6,
                outputStyle: 'expanded'
            },
            autoprefixer,
        }
    }
};

module.exports = {
    folders: folders,
    app    : app,
    paths  : paths
};
