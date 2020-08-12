const fse = require('fs-extra');
const chokidar = require('chokidar');
const CMD = require('cmd-exec').init();

const LOG = console.log;

function run(options) {
  const opts = {
    usePolling: true,
    ...options,
  };

  const tciFilePath = 'marmelad/.tci';

  fse.ensureFileSync(tciFilePath);

  const TCIWatcher = chokidar.watch(tciFilePath, opts);

  TCIWatcher.on('change', (file) => {
    const text = fse.readFileSync(file, { encoding: 'utf8' }).replace(/\n+$/m, '');
    const commands = text.split('\n').map((item) => `mmd ${item}`);

    CMD
      .exec(commands.join(' && '))
      .then((res) => {
        LOG(res.message);
      })
      .fail((err) => {
        LOG(err.message);
      })
      .done(() => {
        // console.log();
      });
  });
}

module.exports = {
  run,
};
