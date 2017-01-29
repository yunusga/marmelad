'use strict';

const path = require('path');

const folders = {
    dist    : 'dist',
    storage : 'public',
    assets  : 'assets',
    blocks  : 'blocks',
    pages   : 'pages',
    helpers : 'helpers',
    static  : 'static',
    stylus  : 'stylus',
    iconizer: {
        src  : 'iconizer',
        icons: 'icons'
    },
};

const paths = {
    dist    : path.join(folders.dist),
    storage : path.join(folders.dist, folders.storage),
    assets  : path.join(folders.assets),
    blocks  : path.join(folders.assets, folders.blocks),
    pages   : path.join(folders.assets, folders.pages),
    helpers : path.join(folders.assets, folders.helpers),
    static  : path.join(folders.assets, folders.static),
    stylus  : path.join(folders.assets, folders.stylus),
    iconizer: {
        src  : path.join(folders.assets, folders.iconizer.src),
        icons: path.join(folders.assets, folders.iconizer.src, folders.iconizer.icons),
    }
};

const app = {
    beml        : {
        elemPrefix: '__',
        modPrefix : '--',
        modDlmtr  : '-'
    },
    autoprefixer: {
        browsers: [
            "last 2 version",
            "ie >= 9",
            "Android 2.3",
            "Android >= 4",
            "Explorer >= 10",
            "iOS >= 6",
            "Opera >= 12",
            "Safari >= 6"
        ]
    },
    browserSync : {
        server        : {
            baseDir: paths.dist
        },
        port          : 7654,
        open          : false,
        directory     : true,
        ghostMode     : false,
        notify        : true,
        logLevel      : 'info',
        logPrefix     : 'MARMELAD',
        logFileChanges: false
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
    }
};

module.exports = {
    app  : app,
    paths: paths
};