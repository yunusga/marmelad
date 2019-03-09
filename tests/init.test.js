const FSE = require('fs-extra');
const CMD = require('cmd-exec').init();

FSE.removeSync('test/init-test');
FSE.ensureDirSync('test/init-test');

test('init in new directory', (done) => {
  CMD.exec('node bin/marmelad.js init test/init-test', (err, res) => {
    expect(err).toBe(null);
    expect(res.message).toBe('[marmelad] initialized, type marmelad -h for CLI help\n');
    done();
  });
});

test('init with create new directory', (done) => {
  CMD.exec('node bin/marmelad.js init test/init-test/create', (err, res) => {
    expect(err).toBe(null);
    expect(res.message).toBe('[marmelad] initialized, type marmelad -h for CLI help\n');
    done();
  });
});

test('init in initialized directory', (done) => {
  CMD.exec('node bin/marmelad.js init test/init-test', (err, res) => {
    expect(err).toBe(null);
    expect(res.message).toBe('[error] project is already initialized\n');
    done();
  });
});

test('init in non empty directory', (done) => {
  FSE.ensureDirSync('test/init-test/nonempty');
  FSE.ensureFileSync('test/init-test/nonempty/nonempty.txt');

  CMD.exec('node bin/marmelad.js init test/init-test/nonempty --test', (err, res) => {
    expect(err).toBe(null);
    expect(res.message).toBe('[warn] Directory is not empty. Some files may be overwritten. Continue?\n');
    done();
  });
});
