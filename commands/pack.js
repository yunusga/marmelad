const path = require('path');
const fs = require('fs');
const ora = require('ora');

function getNum(number) {
    return number > 9 ? number : `0${number}`;
}

module.exports = (customName, opts) => {

    const spinner = ora('Archive project started').start();

    const name = customName ? customName : path.parse(process.cwd()).name;

    const today = new Date();
    const day = getNum(today.getDate());
    const month = getNum(today.getMonth() + 1);
    const hors = getNum(today.getHours());
    const mins = getNum(today.getMinutes());
    const secs = getNum(today.getSeconds());

    const dateTime = opts.nodt ? '' : `_${day}${month}${today.getFullYear()}-${hors}${mins}${secs}`;

    const archiveName = `${name}${dateTime}`;

    if (opts.zip) {
        const archiver = require('archiver');
        const output = fs.createWriteStream(`${archiveName}.zip`);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        archive.pipe(output);

        opts.folders.split(',').forEach(folder => {
            archive.directory(folder);
        });
        
        archive.finalize();
    } else {
        const tar = require('tar');

        tar.c(
        {
            gzip: 'gzip',
        },
        opts.folders.split(',')
        ).pipe(fs.createWriteStream(`${archiveName}.tgz`));
    }

    spinner.succeed('Archive project done');
};