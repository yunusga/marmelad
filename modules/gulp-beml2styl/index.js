'use strict';

const gutil   = require('gulp-util');
const through = require('through2');
const extend  = require('extend');
const cheerio = require('cheerio');
const unique  = require('array-unique');

function parseBemlTemplate(template) {

    let $ = cheerio.load(template);

    let blocks    = $('[block]');
    let elements  = $('[elem]');
    let currentId = 0;
    let blockId   = 0;
    let bemlObj   = {};

    if(!blocks.length) {
        console.log('No blocks found');
        return "// noblocks";
    }

    blocks.each( (i, block) => {

        let name = $(block).attr('block');
        let mods = $(block).attr('mod');

        if( !$(block).attr('block_id') ) {

            currentId = blockId;

            $(`[block~=${name}]`).attr('block_id', blockId);

            if( !bemlObj[blockId] ) {
                bemlObj[blockId] = {
                    blockId   : blockId,
                    blockName : name,
                    mods      : [],
                    elems     : {}
                };
            }

            blockId++;

        }

        if (bemlObj[currentId] && mods) {
            bemlObj[currentId]['mods'] = unique(bemlObj[currentId]['mods'].concat(mods.split(',')));
        }

    });

    elements.each( (i, elem) => {

        let elemName = $(elem).attr('elem');
        let mods     = $(elem).attr('mod');
        let id       = null;

        if (!$(elem).attr('block_id')) {
            id = $(elem).closest('[block]').attr('block_id');
            $(elem).attr('block_id', id);
        }

        if (!bemlObj[id].elems[elemName]) {
            bemlObj[id].elems[elemName] = {
                elemName : elemName,
                mods     : []
            }
        }

        if (mods) {
            bemlObj[id].elems[elemName]['mods'] = unique(bemlObj[id].elems[elemName]['mods'].concat(mods.split(',')));
        }

    });

    return bemlObj;
}

function makeBemlStylusTemplateString(bemlObj, opts) {

    let styles = '',
        bemlConfig = opts.beml,
        spaces = opts.tabSize;

    // формирование блоков
    for (let key in bemlObj) {

        let block         = bemlObj[key],
            elems         = block.elems,
            blockElemsLen = Object.keys(elems).length,
            blockModsLen  = block.mods.length;

        let prevBlock         = bemlObj[+key - 1],
            prevBlockElemsLen = prevBlock ? Object.keys(prevBlock.elems).length : null,
            prevBlockModsLen  = prevBlock ? prevBlock.mods.length : null;

        if (key != 0) {
            styles += `\n`;
            if( (blockElemsLen || blockModsLen) ||
                (prevBlockElemsLen || prevBlockModsLen) ) {
                styles += `\n\n`;
            }
        }

        styles += `.${block.blockName}`;

        if (!blockElemsLen && !blockModsLen) {
            styles += ` {}`;
        }

        let prevElem = null;

        for (let elem in elems) {
            if(prevElem && (prevElem.mods && prevElem.mods.length)) {
                styles += `\n`;
            }

            let elemMods    = elems[elem].mods || null,
                elemModsLen = elemMods.length || null;

            styles += `\n${spaces}&${bemlConfig.elemPrefix}${elems[elem].elemName}`;

            if(elemMods && elemModsLen) {
                for (let i = 0; i < elemModsLen; i++) {
                    styles += `\n${spaces}${spaces}&${bemlConfig.modPrefix}${elemMods[i]} {}`;
                }
            } else {
                styles += ` {}`;
            }

            prevElem = elems[elem];

        }

        if (blockModsLen) {
            if (blockElemsLen) {
                styles += '\n';
            }
            for (let j = 0; j < blockModsLen; j++) {
                styles += `\n${spaces}&${bemlConfig.modPrefix}${block.mods[j]} {}`;
            }
        }

    }

    return styles;
}

module.exports = function (opts) {

    opts = extend({
        beml : {
            elemPrefix: '__',
            modPrefix: '_',
            modDlmtr: '_',
            escapeTemplateTags: ['{{', '}}']
        },
        tabSize : '    '
    }, opts);

    return through.obj(function (file, enc, cb) {

        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            cb(new gutil.PluginError('gulp-<%= pluginName %>', 'Streaming not supported'));
            return;
        }

        try {

            let bemlObj = parseBemlTemplate(file.contents.toString(), opts);

            file.contents = new Buffer(makeBemlStylusTemplateString(bemlObj, opts));
            this.push(file);
        } catch (err) {
            this.emit('error', new gutil.PluginError('gulp-<%= pluginName %>', err));
        }

        cb();
    });
};