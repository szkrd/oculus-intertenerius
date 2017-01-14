require('shelljs/global');
require('dotenv').config();
const _ = require('lodash');
const promptly = require('promptly');
const chalk = require('chalk');
const moment = require('moment');
const dedent = require('dedent');
const sanitize = require('sanitize-filename');
const removeDiacritics = require('diacritics').remove;
const leftPad = require('../../lib/left-pad');

const postsDir = './posts';
const terminalCommand = process.env.TERMINAL || 'xterm';

// promise wrapper for prompt
function prompt (question) {
  return new Promise((resolve, reject) => {
    promptly.prompt(question, (err, value) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(value);
    });
  });
}

let gray = chalk.gray;
let yellow = chalk.yellow;

async function main () {
  let title = await prompt(yellow('1. ') + 'Name of the movie ' + gray('(splite multiple names with " - ")' + ':'));
  let year = await prompt(yellow('2. ') + 'Year ' + gray('(4 digits only)' + ':'));
  let score = await prompt(yellow('3. ') + 'Score ' + gray('(0 - 10)' + ':'));
  let tags = await prompt(yellow('4. ') + 'Tags ' + gray('(comma separated values)' + ':'));

  let niceName = title.replace(/\//g, '-').trim();
  year = parseInt(year, 10) || 0;
  if (year) {
    niceName += ` - ${year}`;
  }
  let id = Array.from(ls(`${postsDir}/*.md`)).length;
  let fileName = leftPad(id + 1, 4) + ' ' + niceName;
  fileName = removeDiacritics(sanitize(fileName));
  fileName = fileName.replace(/\s+/g, ' ');
  fileName = fileName.replace(/\((\d{4})\)/, '- $1');

  tags = tags.split(',').map(tag => tag.trim());
  tags = [score].concat(tags);
  tags = _.map(tags.sort(), tag => `[${tag}]`).join(', ');

  let currentDate = moment().format('YYYY-MM-DD');

  let body = 'Lorem ipsum dolor sit amet.';
  let md = dedent(`
    # ${niceName}

    ${body}
    
    ${currentDate}

    ----

    ${tags}
  ` + '\n\n');
  let target = `${postsDir}/${fileName}.md`;
  md.to(target);
  console.log('Wrote skeleton to "' + chalk.green(fileName) + '".\n');

  let openInEditor = await prompt(yellow('5. ') + 'Open in EDITOR ' + gray('(y/n)' + '?'));
  let editor = process.env.GUI_EDITOR || process.env.EDITOR || 'nano';
  if (/ne|nano|vim/.test(editor)) { // quick fix for raw console
    editor = `${terminalCommand} -e ${editor}`;
  }
  if (openInEditor.trim().toLowerCase() === 'y') {
    exec(`${editor} "${target}"`);
  }
  console.log('\nDon\'t forget to `npm run check-integrity`, then git add, commit, push. Bye!');
}

main();
