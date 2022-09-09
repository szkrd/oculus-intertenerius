require('shelljs/global');
const mdToJson = require('../../lib/md-to-json');

const ignoreYearBelow = 501;
const postsDir = './posts';

let files = Array.from(ls(`${postsDir}/*.md`));
let jsons = files.map(fn => mdToJson(fn, cat(fn) + ''));

// poor man's schema
let stats = jsons.map(item => {
  let s = [item.fileName];
  if (typeof item.id !== 'number') {
    s.push('id');
  }
  if (item.movieYear === 0 && item.id > ignoreYearBelow) {
    s.push('movieYear');
  }
  if (!item.fullTitle) {
    s.push('fullTitle');
  }
  if (!item.watchDateRaw) {
    s.push('watchDateRaw');
  }
  if (!item.tags || typeof item.tags !== 'object' || item.tags.length === 0) {
    s.push('tags');
  }
  if (typeof item.score !== 'number') {
    s.push('score');
  }
  return s;
});

let errorCount = 0;
stats.forEach(stat => {
  if (stat.length > 1) {
    errorCount++;
    console.log(stat.shift(), '--', stat.join(' '));
  }
});

if (!errorCount) {
  console.log('Everything is fine');
  process.exit(0);
} else {
  process.exit(1);
}
