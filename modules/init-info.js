const { execSync } = require('child_process');

module.exports = () => {
  const marmelad = __dirname.replace('bin', '');

  function getCurrentBranch() {
    return execSync('git branch --show-current', { cwd: marmelad }).toString().replace('\n', '');
  }

  function getShortHead() {
    return execSync('git rev-parse --short HEAD', { cwd: marmelad }).toString().replace('\n', '');
  }

  return {
    git: `${getCurrentBranch()}:${getShortHead()}`,
    inited: new Date().toISOString(),
  };
};
