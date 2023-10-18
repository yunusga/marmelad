const {
  existsSync, mkdirSync, rmSync
} = require('fs');

const  {
  join
} = require('path');

const {
  exec
} = require('child_process');

const testsTargetPath = join('test', 'init-test');

if (existsSync(testsTargetPath)) {
  rmSync(
      testsTargetPath,
      {
          force: true,
          recursive: true,
      }
  );
}

mkdirSync(testsTargetPath);

const SUCCESS_STR = '[rohat] initialized, type rohat -h for help\n';

describe('rohat initialization tests', () => {
  test('init in new directory', (done) => {
      exec(
          'node bin/rohat.js init test/init-test',
          (error, stdout) => {
              expect(error).toBe(null);
              expect(stdout).toBe(SUCCESS_STR);
              expect(existsSync(join('test', 'init-test', 'rohat.config.js'))).toBe(true);
              done();
          },
      );
  });

  test('init with create new directory', (done) => {
      exec(
          'node bin/rohat.js init test/init-test/create',
          (error, stdout) => {
              expect(error).toBe(null);
              expect(stdout).toBe(SUCCESS_STR);
              done();
          },
      );
  });

  test('init in initialized directory', (done) => {
      exec(
          'node bin/rohat.js init test/init-test',
          (error, stdout) => {
              expect(error).toBe(null);
              expect(stdout).toBe(' ERROR  rohat project is already initialized\n');
              done();
          },
      );
  });

  test('init in non empty directory', (done) => {
      exec(
          'node bin/rohat.js init test/init-test/rohat',
          (error, stdout) => {
              expect(error).toBe(null);
              expect(stdout).toBe(' ERROR  directory is not empty\n');
              done();
          },
      );
  });
});
