const FSE = require('fs-extra');
const CMD = require('cmd-exec').init();

FSE.removeSync('test/init-test');
FSE.ensureDirSync('test/init-test');

test('init in new directory', (done) => {
  CMD.exec('node bin/marmelad.js init test/init-test', (err, res) => {
    expect(err).toBe(null);
    expect(res.message).toBe('[marmelad] initialized, type marmelad -h for CLI help\n');
    expect(FSE.existsSync('test/init-test/marmelad/styles/app.scss')).toBe(false);
    expect(FSE.existsSync('test/init-test/marmelad/styles/app.styl')).toBe(true);
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

test('init with bootstrap in new directory', (done) => {
  CMD.exec('node bin/marmelad.js init test/init-test/create-bootstrap --bootstrap', (err, res) => {
    const settings = require('../test/init-test/create-bootstrap/marmelad/settings.marmelad.js');

    expect(err).toBe(null);
    expect(res.message).toBe('[marmelad] initialized, type marmelad -h for CLI help\n');
    expect(FSE.existsSync('test/init-test/create-bootstrap/marmelad/bootstrap')).toBe(true);
    expect(settings.app.bts.use).toBe(true);
    expect(settings.app.bts.donor).toBe(false);
    done();
  });
});

test('init with bootstrap like DONOR in new directory', (done) => {
  CMD.exec('node bin/marmelad.js init test/init-test/create-bootstrap-donor --bootstrap donor', (err, res) => {
    const settings = require('../test/init-test/create-bootstrap-donor/marmelad/settings.marmelad.js');

    expect(err).toBe(null);
    expect(res.message).toBe('[marmelad] initialized, type marmelad -h for CLI help\n');
    expect(FSE.existsSync('test/init-test/create-bootstrap-donor/marmelad/bootstrap')).toBe(true);
    expect(settings.app.bts.use).toBe(false);
    expect(settings.app.bts.donor).toBe(true);
    done();
  });
});

test('init with SCSS in new directory', (done) => {
  CMD.exec('node bin/marmelad.js init test/init-test/create-scss -c scss', (err, res) => {
    const settings = require('../test/init-test/create-scss/marmelad/settings.marmelad.js');

    expect(err).toBe(null);
    expect(res.message).toBe('[marmelad] initialized, type marmelad -h for CLI help\n');
    expect(FSE.existsSync('test/init-test/create-scss/marmelad/styles/app.scss')).toBe(true);
    expect(FSE.existsSync('test/init-test/create-scss/marmelad/styles/app.styl')).toBe(false);
    expect(settings.app.css).toBe('scss');
    done();
  });
});
