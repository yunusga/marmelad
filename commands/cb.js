const fs = require('fs');

module.exports = (name, techs) => {
  const blockPath = `marmelad/_blocks/${name}`;
  const extensions = techs.split(',');

  if (fs.existsSync(blockPath)) {
    process.stdout.write(`⚠  block ${name} is already exists`);
  } else {
    fs.mkdirSync(blockPath);

    extensions.forEach((ext) => {
      fs.writeFileSync(`${blockPath}/${name}.${ext}`, '', { encoding: 'utf8' });
    });

    process.stdout.write(`✔  block ${name} is created`);
  }

  process.exit();
};
