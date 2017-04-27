'use strict';

const path = require('path');
const fs = require('fs-extra');
const gutil = require('gulp-util');
const settings = require(path.join(process.cwd(), 'marmelad', 'settings.marmelad'));

module.exports = function(blockName) {

    let pathToBlockDir = path.join(settings.paths._blocks, blockName);
    let pathToBlockFile = path.join(pathToBlockDir, blockName);
    let tpl_hbs = `<div block="m-${blockName}">${blockName} content</div><!-- b:m-${blockName} -->`;
    let tpl_styl = `.m-${blockName} {}`;

    if (!fs.existsSync(pathToBlockDir)) {

        fs.ensureDirSync(pathToBlockDir);
        fs.writeFileSync(`${pathToBlockFile}.hbs`, tpl_hbs, 'utf-8');
        fs.writeFileSync(`${pathToBlockFile}.styl`, tpl_styl, 'utf-8');
        fs.writeFileSync(`${pathToBlockFile}.js`, '', 'utf-8');

        console.log(`\n[${gutil.colors.green('CREATE BLOCK')}] ${blockName} ${gutil.colors.green('successfully')}\n`);
    }
};