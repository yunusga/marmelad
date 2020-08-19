const fs = require('fs-extra');
const path = require('path');
const replaceInFile = require('replace-in-file');

module.exports = (oldBlockName, newBlockName, opts) => {
  const options = {
    hard: false,
    dry: false,
    ...opts,
  };

  const baseBlockPath = 'marmelad/_blocks/';
  const oldBlockPath = `${baseBlockPath}${oldBlockName}`;
  const newBlockPath = `${baseBlockPath}${newBlockName}`;

  if (fs.existsSync(newBlockPath)) {
    process.stdout.write(`⚠ block ${newBlockName} is already exists`);
    process.exit();
  }

  if (fs.existsSync(oldBlockPath)) {
    const files = fs.readdirSync(oldBlockPath);

    if (files) {
      // если включена замена внутри файлов
      if (options.hard || options.dry) {
        try {
          const regex = new RegExp(oldBlockName, 'g');

          const replaceResults = replaceInFile.sync({
            files: `${oldBlockPath}/**/*`,
            from: regex,
            to: newBlockName,
            countMatches: true,
            dry: options.dry,
          });

          if (replaceResults) {
            console.log('Replacement results:', replaceResults);
          } else {
            console.log('No replacements');
          }
        } catch (error) {
          console.error('Replacement error:', error);
        }
      }

      // если опция dry не установлена, переименовываем файлы
      if (!options.dry) {
        files.forEach((file) => {
          const oldPath = `${oldBlockPath}/${file}`;
          const extName = path.extname(oldPath);
          const newPath = `${oldBlockPath}/${newBlockName}${extName}`;

          fs.renameSync(oldPath, newPath);
        });

        fs.renameSync(oldBlockPath, newBlockPath);
        process.stdout.write(`⚠ block ${oldBlockPath} renamed to ${newBlockPath}`);
      }
    }
  }

  process.exit();
};
