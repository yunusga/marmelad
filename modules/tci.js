const { ensureFileSync, readFileSync } = require('fs-extra');
const chokidar = require('chokidar');
const { exec } = require('child_process');

const { log } = console;

function run(options) {
  const opts = {
    usePolling: true,
    ...options,
  };

  const tciFilePath = 'marmelad/.tci';

  ensureFileSync(tciFilePath);

  const TCIWatcher = chokidar.watch(tciFilePath, opts);

  TCIWatcher.on('change', (file) => {
    const text = readFileSync(file, { encoding: 'utf8' }).replace(/\n+$/m, '');
    const commands = text.split('\n').map((item) => `mmd ${item}`);

    exec(commands.join(' && '), (error, stdout) => {
      log(stdout);
    });
  });
}

module.exports = {
  run,
};
