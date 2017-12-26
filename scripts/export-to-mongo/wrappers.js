const chalk = require('chalk');

function onError (err) {
  if (err.message && err.name) {
    console.error(chalk.red('ERROR'));
  }
  console.error(err);
  process.exit(1);
}

async function run (action) {
  try {
    await action();
  } catch (err) {
    onError(err);
  }
}

module.exports = {
  run
};
