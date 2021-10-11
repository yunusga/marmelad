const {
  removeSync, ensureDirSync, pathExistsSync, ensureFileSync,
} = require('fs-extra');

const { exec } = require('child_process');

const SUCCESS_STR = '[marmelad] copy:boilerplate\n[marmelad] copy:rootfiles\n[marmelad] git:init\n[marmelad] initialized, type marmelad -h for CLI help\n';

removeSync('test/init-test');
ensureDirSync('test/init-test');

test('init in new directory', (done) => {
  exec(
    'node bin/marmelad.js init test/init-test --test',
    {
      env: {
        NO_COLOR: true,
      },
    },
    (error, stdout) => {
      expect(error).toBe(null);
      expect(stdout).toBe(SUCCESS_STR);
      expect(pathExistsSync('test/init-test/marmelad/styles/app.scss')).toBe(false);
      expect(pathExistsSync('test/init-test/marmelad/styles/app.styl')).toBe(true);
      done();
    },
  );
});

test('init with create new directory', (done) => {
  exec(
    'node bin/marmelad.js init test/init-test/create --test',
    {
      env: {
        NO_COLOR: true,
      },
    },
    (error, stdout) => {
      expect(error).toBe(null);
      expect(stdout).toBe(SUCCESS_STR);
      done();
    },
  );
});

test('init in initialized directory', (done) => {
  exec(
    'node bin/marmelad.js init test/init-test --test',
    {
      env: {
        NO_COLOR: true,
      },
    },
    (error, stdout) => {
      expect(error).toBe(null);
      expect(stdout).toBe(' ERROR  project is already initialized\n');
      done();
    },
  );
});

test('init in non empty directory', (done) => {
  ensureDirSync('test/init-test/nonempty');
  ensureFileSync('test/init-test/nonempty/nonempty.txt');

  exec(
    'node bin/marmelad.js init test/init-test/nonempty --test',
    {
      env: {
        NO_COLOR: true,
      },
    },
    (error, stdout) => {
      expect(error).toBe(null);
      expect(stdout).toBe(' WARN  Directory is not empty. Some files may be overwritten. Continue?\n');
      done();
    },
  );
});

test('init with SCSS in new directory', (done) => {
  exec(
    'node bin/marmelad.js init test/init-test/create-scss -c scss --test',
    {
      env: {
        NO_COLOR: true,
      },
    },
    (error, stdout) => {
      const settings = require('../test/init-test/create-scss/marmelad/settings.marmelad');

      expect(error).toBe(null);
      expect(stdout).toBe(SUCCESS_STR);
      expect(pathExistsSync('test/init-test/create-scss/marmelad/styles/app.scss')).toBe(true);
      expect(pathExistsSync('test/init-test/create-scss/marmelad/styles/app.styl')).toBe(false);
      expect(settings.app.css).toBe('scss');
      done();
    },
  );
});
