const crypto = require('crypto');

function getChecksum (item) {
  let s = [
    item.fileName,
    item.movieYear,
    item.fullTitle,
    (item.tags || []).join(','),
    item.mainContent
  ].join('|');
  return crypto.createHash('sha1').update(s, 'utf8').digest('hex');
}

module.exports = getChecksum;
