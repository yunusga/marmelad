const fs = require('fs');

module.exports = (name) => {
  const pagePath = `marmelad/_pages/${name}.html`;

  if (fs.existsSync(pagePath)) {
    process.stdout.write(`⚠  page ${pagePath} is already exists`);
  } else {
    fs.writeFileSync(pagePath, '', { encoding: 'utf8' });
    process.stdout.write(`✔  page ${pagePath} is created`);
  }

  process.exit();
};
