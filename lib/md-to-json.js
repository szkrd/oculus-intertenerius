const getChecksum = require('../lib/get-checksum');

function mdToJson (fileName, content) {
  fileName = fileName.replace(/^.*\//, '').replace(/\.md$/, '');
  let id = parseInt((fileName.match(/^(\d+)\s/) || [])[1], 10) || 0;
  let fullTitle = ((content.match(/^\s*#\s*([^\n]*)\n/) || [])[1] || '').trim();
  let movieYear = parseInt((fullTitle.match(/(\d{4})\s*$/) || [])[1], 10) || 0;
  fullTitle = fullTitle.replace(/\d{4}\s*$/, '').trim().replace(/\s+[-|]$/, '');

  let titles = [fullTitle];
  if (fullTitle.indexOf(' | ') > -1) {
    titles = fullTitle.split(' | ');
  } else if (fullTitle.indexOf(' - ') > -1) {
    titles = fullTitle.split(' - ');
  }
  titles = titles.map(title => title.trim());

  let spacelessContent = content.replace(/[\s\r\n]*/g, '');
  let watchDateRaw = (spacelessContent.match(/(\d{4}-\d{2}-\d{2})-{2,4}/) || [])[1] || null;
  let watchDate = watchDateRaw ? new Date(watchDateRaw) : null;

  let tags = [];
  if (spacelessContent.match(/.*--\[/)) {
    let tagLine = spacelessContent.replace(/.*--\[/, '[').replace(/,/g, '')
      .replace(/^\[/, '').replace(/]$/, '').replace(/]\[/g, ',');
    tags = tagLine.split(',');
    tags = tags.map(tag => /^[\d.]+$/.test(tag) ? parseFloat(tag, 10) : tag.trim());
  }

  let score = tags.find(tag => typeof tag === 'number');
  score = typeof score === 'number' ? score : null;

  let mainContent = content.trim();
  mainContent = mainContent.replace(/^#.*?\n/, '');
  mainContent = (mainContent.split(/-{2,4}.*/)[0] || '').trim();
  mainContent = mainContent.replace(/\d{4}-\d{2}-\d{2}$/, '').trim();

  let ret = {
    fileName, // '0007 Nippon Konchuki - Insect Woman',
    id, // 7
    movieYear, // 2000
    fullTitle, // 'The Isle - Seom'
    titles, // [ 'The Isle', 'Seom' ]
    watchDateRaw, // '2013-05-20'
    watchDate, // 2013-05-20T00:00:00.000Z
    tags, // [ 5.5, 'korea' ]
    score, // 5.5
    mainContent // 'A néma...
  };

  ret.checksum = getChecksum(ret);
  return ret;
}

module.exports = mdToJson;
