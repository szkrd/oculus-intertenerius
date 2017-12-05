require('shelljs/global');
const mdToJson = require('../../lib/md-to-json');

const postsDir = './posts';
const target = './output/tags.json';
const targetForRenamer = './output/tags-rename.json';

let files = Array.from(ls(`${postsDir}/*.md`));
let jsons = files.map(fn => mdToJson(fn, cat(fn) + ''));

let tags = [...new Set(jsons.reduce((acc, item) => {
  acc.push(...item.tags);
  return acc;
}, []))].sort((a, b) => String(a).localeCompare(String(b)));

let tagsForRename = tags.reduce((acc, tag) => {
  if (/^[\d.]+$/.test(tag)) {
    return acc;
  }
  acc.push([tag, tag]);
  return acc;
}, []);

console.info(`I saved a list of tags to "${target}"`);
JSON.stringify(tags, null, '  ').to(target);

console.info(`I saved a list of tags for you to help with tag renaming to "${target}"`);
JSON.stringify(tagsForRename, null, '  ').to(targetForRenamer);
