require('shelljs/global');
const _ = require('lodash');
const mdToJson = require('../../lib/md-to-json');

const postsDir = './posts';
const target = './docs/meta.js';

let files = Array.from(ls(`${postsDir}/*.md`));
let jsons = files.map(fn => mdToJson(fn, cat(fn) + ''));
jsons = jsons.map(item => _.omit(item, [ 'mainContent', 'fullTitle', 'watchDate' ]));

`ocin = window.ocin || {}; ocin.meta = ${JSON.stringify(jsons)};\n`.to(target);
