const fs = require('fs');
const chokidar = require('chokidar');
const CMD = require('cmd-exec').init();

const LOG = console.log;

function run(options) {
  const opts = Object.assign({
    usePolling: true,
  }, options);

  const tciFilePath = 'marmelad/tci';
  const TCIWatcher = chokidar.watch(tciFilePath, opts);

  TCIWatcher.on('change', (file) => {
    const text = fs.readFileSync(file, { encoding: 'utf8' }).replace(/\n+$/m, '');
    const commands = text.split('\n').map(item => `mmd ${item}`);

    CMD
      .exec(commands.join(' && '))
      .then((res) => {
        LOG(res.message);
      })
      .fail((err) => {
        LOG(err.message);
      })
      .done(() => {
        //console.log();
      });
  });
}

module.exports = {
  run,
};
