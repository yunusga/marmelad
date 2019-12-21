const through2 = require('through2');

function pipeErrorStop(config) {
  let errorInPipe;
  const files = [];

  config = {
    errorCallback() {},
    successCallback() {},
    ...config,
  };

  function encounteredFile(file, enc, done) {
    files.push(file);
    done();
  }

  function allFilesDone(done) {
    if (!errorInPipe) {
      files.forEach(this.push.bind(this));
      config.successCallback();
    }

    done();
  }

  const stream = through2.obj(encounteredFile, allFilesDone);

  function encounteredError(err) {
    errorInPipe = true;
    stream.end();
    config.errorCallback(err);
  }

  stream.once('pipe', (source) => {
    source.on('error', encounteredError);
  });

  return stream;
}

module.exports = pipeErrorStop;
