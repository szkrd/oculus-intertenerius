const https = require('https');
const fs = require('fs');
const { promisify } = require('util');
const { run } = require('../export-to-mongo/wrappers');

const writeFileAsync = promisify(fs.writeFile);
let userId = 1;

function getGithubUser (name) {
  let opts = {
    host: 'api.github.com',
    path: '/users/' + name,
    method: 'GET',
    headers: {'user-agent': 'node.js'}
  };
  return new Promise((resolve, reject) => {
    https.get(opts, res => {
      res.setEncoding('utf8');
      let body = '';
      res.on('data', data => {
        body += data;
      });
      // TODO res.on error
      res.on('end', () => {
        body = JSON.parse(body);
        let user = {
          id: userId++,
          isAdmin: true,
          name: body.name,
          username: body.login,
          email: body.email,
          gender: null,
          dateOfBirth: null,
          occupation: null,
          avatar: body.avatar_url
        };
        resolve(user);
      });
    });
  });
}

let users = [
];

let result = {
  users,
  categories: []
  // TODO: tags, posts, posts_tags, profile
};

run(async function () {
  let author = await getGithubUser('szkrd');
  users.push(author);
  await writeFileAsync('output/db.json', JSON.stringify(result, null, '  '));
});
