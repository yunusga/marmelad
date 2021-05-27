const { platform } = require('os');
const { execSync } = require('child_process');

module.exports = () => {
  const cwd = process.cwd();

  let cmd = '';

  function getCurrentBranch() {
    if (platform() === 'win32') {
      cmd = `pushd ${cwd} & git branch --show-current`;
    } else {
      cmd = `(cd ${cwd} ; git branch --show-current)`;
    }

    return execSync(cmd).toString().replace('\n', '');
  }

  function getShortHead() {
    if (platform() === 'win32') {
      cmd = `pushd ${cwd} & git rev-parse --short HEAD`;
    } else {
      cmd = `(cd ${cwd} ; git rev-parse --short HEAD)`;
    }

    return execSync(cmd).toString().replace('\n', '');
  }

  return {
    git: `${getCurrentBranch()}:${getShortHead()}`,
    inited: new Date().toISOString(),
  };
};
