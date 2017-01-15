const promptly = require('promptly');
const chalk = require('chalk');
const prettyDate = require('pretty-date');
const _ = require('lodash');
const leftPad = require('../../lib/left-pad');

const postsToJson = require('../../lib/posts-to-json');

function printOption (key, str) {
  console.log(chalk.yellow(key + '.') + ' ' + str);
}

postsToJson().then(posts => {
  console.log(`${posts.length} items available.\n`);
  printOption('1', 'score >= 9');
  printOption('2', 'last 5 items');
  printOption('3', 'tags sorted by popularity');
  printOption('4', 'tags sorted alphabetically');
  printOption('q', 'quit');
  console.log();

  promptly.prompt('selection: ', (err, value) => {
    if (err) {
      return console.error(err);
    }
    console.log();
    // let param = value.split(' ')[1] || '';

    if (value === '1') {
      _.sortBy(posts.filter(post => post.score >= 9), [ 'score', 'id' ])
        .forEach(post => {
          console.log(chalk.red(leftPad(post.score, 4, ' ')) + ' ' + post.fileName);
        });
    }

    if (value === '2') {
      _.sortBy(posts, [ 'watchDate' ]).slice(1).slice(-5)
        .forEach(post => {
          console.log(post.fileName + ' ' + chalk.red(prettyDate.format(post.watchDate)));
        });
    }

    if (value === '3') {
      let tags = posts.reduce((acc, item) => {
        (item.tags || []).forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
      }, {});
      tags = _.sortBy(_.map(tags, (key, val) => ({ name: val, count: key })), [ 'count' ]);
      let out = tags.reduce((s, tag) => {
        s.push(chalk.gray(tag.name + ':') + chalk.red(tag.count));
        return s;
      }, []);
      console.log(out.join(', '));
    }

    if (value === '4') {
      let tags = posts.reduce((acc, item) => {
        (item.tags || []).forEach(tag => {
          acc.push(tag);
        });
        return acc;
      }, []);
      tags = [ ...new Set(tags) ].sort().map(tag => chalk.gray(tag));
      console.log(tags.join(', '));
    }
  });
});
