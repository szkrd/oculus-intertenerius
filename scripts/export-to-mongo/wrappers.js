const PrettyError = require('pretty-error');
const pe = new PrettyError();

function onError (err) {
  console.error(pe.render(err));
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
