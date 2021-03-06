const FSE = require('fs-extra');
const CMD = require('cmd-exec').init();

const SUCCESS_STR = '[marmelad] copy:boilerplate\n[marmelad] copy:rootfiles\n[marmelad] git:init\n[marmelad] initialized, type marmelad -h for CLI help\n';

FSE.removeSync('test/init-test');
FSE.ensureDirSync('test/init-test');

test('init in new directory', (done) => {
  CMD.exec('node bin/marmelad.js init test/init-test --test', (err, res) => {
    expect(err).toBe(null);
    expect(res.message).toBe(SUCCESS_STR);
    expect(FSE.existsSync('test/init-test/marmelad/styles/app.scss')).toBe(false);
    expect(FSE.existsSync('test/init-test/marmelad/styles/app.styl')).toBe(true);
    done();
  });
});

test('init with create new directory', (done) => {
  CMD.exec('node bin/marmelad.js init test/init-test/create --test', (err, res) => {
    expect(err).toBe(null);
    expect(res.message).toBe(SUCCESS_STR);
    done();
  });
});

test('init in initialized directory', (done) => {
  CMD.exec('node bin/marmelad.js init test/init-test --test', (err, res) => {
    expect(err).toBe(null);
    expect(res.message).toBe(' ERROR  project is already initialized\n');
    done();
  });
});

test('init in non empty directory', (done) => {
  FSE.ensureDirSync('test/init-test/nonempty');
  FSE.ensureFileSync('test/init-test/nonempty/nonempty.txt');

  CMD.exec('node bin/marmelad.js init test/init-test/nonempty --test', (err, res) => {
    expect(err).toBe(null);
    expect(res.message).toBe(' WARN  Directory is not empty. Some files may be overwritten. Continue?\n');
    done();
  });
});

test('init with SCSS in new directory', (done) => {
  CMD.exec('node bin/marmelad.js init test/init-test/create-scss -c scss --test', (err, res) => {
    const settings = require('../test/init-test/create-scss/marmelad/settings.marmelad');

    expect(err).toBe(null);
    expect(res.message).toBe(SUCCESS_STR);
    expect(FSE.existsSync('test/init-test/create-scss/marmelad/styles/app.scss')).toBe(true);
    expect(FSE.existsSync('test/init-test/create-scss/marmelad/styles/app.styl')).toBe(false);
    expect(settings.app.css).toBe('scss');
    done();
  });
});
