'use strict';

let app = {
    browserSync : {
        server: {
            baseDir: ''
        },
        plugins: ['bs-latency'],
        port: 5200,
        open: false,
        directory: true,
        ghostMode: false,
        notify: true
    },
    beml: {
        elemPrefix: '__',
        modPrefix: '--',
        modDlmtr: '-'
    },
    jsPrettify: {
        indent_size: 4,
        indent_char: " ",
        eol: "\n",
        collapseWhitespace: true
    },
    "autoprefixer": {
        "browsers": [
            "last 2 version",
            "ie >= 9",
            "Android 2.3",
            "Android >= 4",
            "Chrome >= 20",
            "Firefox >= 24",
            "Explorer >= 8",
            "iOS >= 6",
            "Opera >= 12",
            "Safari >= 6"
        ]
    }
};

let base = {
    assets: 'assets',
    dist: 'dist',
    storage: '/images',
    pages: '/pages',
    blocks: '/blocks',
    plugins: '/plugins',
    styles: '/styles',
    scripts: '/scripts',
    svg: '/svg'
};

let paths = {
    assets: base.assets,
    dist: base.dist,
    storage: base.dist + base.storage,
    pages: base.assets + base.pages,
    blocks: base.assets + base.blocks,
    plugins: base.assets + base.plugins,
    styles: base.assets + base.styles,
    images  : {
        src  : base.assets + '/images',
        dest : base.dist + base.storage + '/img'
    },
    files  : {
        src  : base.assets + '/files',
        dest : base.dist + base.storage + '/files'
    },
    scripts: {
        vendor: base.assets + base.scripts + '/vendor',
        main: base.assets + base.scripts
    },
    svg: base.assets + base.svg
};

module.exports = {
    app: app,
    base: base,
    paths: paths
};
