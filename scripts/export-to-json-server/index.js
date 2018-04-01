/* eslint no-unused-vars:0 */
require('shelljs/global');
const https = require('https');
const fs = require('fs');
const sanitize = require('sanitize-filename');
const removeDiacritics = require('diacritics').remove;
const { promisify } = require('util');
const { run } = require('../export-to-mongo/wrappers');
const mdToJson = require('../../lib/md-to-json');

const postsDir = './posts';
const target = './output/db.json';
const writeFileAsync = promisify(fs.writeFile);
const minTagCount = 1;
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

function getTags (jsons) {
  let tagId = 1;
  let tagCollisions = {};
  let tags = [...new Set(jsons.reduce((acc, item) => {
    acc.push(...item.tags);
    return acc;
  }, []))].sort((a, b) => String(a).localeCompare(String(b)));
  return tags.map(tag => {
    tag = String(tag);
    let slug = removeDiacritics(sanitize(tag));
    tagCollisions[slug] = ~~tagCollisions[slug] + 1;
    let collCount = tagCollisions[slug];
    return {
      id: tagId++,
      name: tag,
      slug: collCount > 1 ? `${slug}-${collCount}` : slug
    };
  });
}

function getPosts (jsons, result) {
  const getTagId = name => (result.tags.find(tag => String(tag.name) === String(name)) || {}).id;
  const getTagIds = item => (item.tags || []).map(name => getTagId(name));
  let junctionId = 1;
  return jsons.map(item => {
    const tagIds = getTagIds(item);
    let categoryId = 1;
    if (item.tags.includes('sorozat')) {
      categoryId = 2;
    }
    if (tagIds && tagIds.length) {
      tagIds.forEach(tagId => {
        result.posts_tags.push({
          id: junctionId++,
          postId: item.id,
          tagId
        });
      });
    }
    return {
      id: item.id,
      title: item.fullTitle,
      createdAt: new Date(item.watchDate) * 1,
      body: item.mainContent,
      image: null,
      views: 0,
      recommends: 0,
      userId: 1,
      categoryId,
      tags: tagIds,
      tagIds
    };
  });
}

let result = {
  users: [
    {
      id: 1,
      isAdmin: true,
      name: 'Szabolcs Kurdi',
      username: 'szkrd',
      email: null,
      gender: null,
      dateOfBirth: null,
      occupation: null,
      avatar: 'https://secure.gravatar.com/avatar/1c4b81c444f2d2f76fd27be622a13382'
    }
  ],
  categories: [
    {
      id: 1,
      name: 'film',
      slug: 'film'
    },
    {
      id: 2,
      name: 'sorozat',
      slug: 'sorozat'
    }
  ],
  tags: [],
  posts: [],
  posts_tags: [],
  comments: [],
  profile: {}
};

run(async function () {
  // let author = await getGithubUser('szkrd');
  // result.users.push(author);
  let files = Array.from(ls(`${postsDir}/*.md`));
  let jsons = files.map(fn => mdToJson(fn, cat(fn) + ''));
  result.tags = getTags(jsons);
  result.posts = getPosts(jsons, result);
  await writeFileAsync(target, JSON.stringify(result, null, '  '));
});
