require('shelljs/global');
const fs = require('fs');
const path = require('path');
const mdToJson = require('./md-to-json');

const postsDir = path.resolve(__dirname, '../posts/');

function postsToJson () {
  return new Promise((resolve, reject) => {
    let fileNames = Array.from(ls(`${postsDir}/*.md`));
    let posts = [];

    function processFile (fn, err, data) {
      if (err) {
        reject(err);
      }
      posts.push(mdToJson(fn, data + ''));
      if (posts.length === fileNames.length) {
        resolve(posts);
      }
    }

    fileNames.forEach(fn => {
      fs.readFile(fn, (err, data) => processFile(fn, err, data));
    });
  });
}

module.exports = postsToJson;
