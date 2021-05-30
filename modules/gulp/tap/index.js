const baseStream = require('stream');
const through = require('through2');

const utils = (tapStream, file) => ({
  /*
    * Routes through another stream. The filter must not be
    * created. This will create the filter as needed.
    *
    * @param filter {stream}
    * @param args {Array} Array containg arguments to apply to filter.
    */
  through(filter, args) {
    const stream = filter(...args);

    stream.on('error', (err) => tapStream.emit('error', err));
    stream.write(file);

    return stream;
  },
});

/*
 * Taps into the pipeline and allows user to easily route data through
 * another stream or change content.
 */
module.exports = function(lambda) {
  const modifyFile = function(file, enc, cb) {
    const inst = {
      file,
    };

    const obj = lambda(inst.file, utils(this, inst.file), inst);
    const next = (function(_this) {
      return function () {
        _this.push(file);
        return cb();
      };
    })(this);

    if (obj instanceof baseStream && !obj._readableState.ended) {
      obj.on('end', next);
      return obj.on('data', data = function () {
        obj.removeListener('end', next);
        obj.removeListener('data', data);
        return next();
      });
    } else {
      return next();
    }
  };

  return through.obj(modifyFile, (cb) => cb());
};
