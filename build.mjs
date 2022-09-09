import { promises as fs } from 'fs';

// dry run? use stdout >> to append output
const PRINT = true;

function getTitle(fn = '', text = '') {
  const match = text.match(/#\s+(.*)/);
  if (match.length < 2) {
    console.error(`No title in ${fn}?`);
    return '';
  }
  return match[1].trim();
}

function getTagsText(text = '') {
  const parts = text.replace(/(\r|\n)/g, ' ').split(/-{3,}/);
  return (parts[1] ?? '').trim().replace(/\[/g, '(`').replace(/]/g, '`)');
}

function getScore(text = '') {
  const parts = text.replace(/(\r|\n)/g, ' ').split(/-{3,}/);
  const tagsText = (parts[1] ?? '').trim();
  const tags = tagsText.replace(/\s*/g, '').replace(/[\[\]]/g, '').split(',');
  return parseFloat(tags.filter(tag => /^[\d\.]+$/.test(tag))[0] ?? '-1');
}

function getScoreChar(score = -1) {
  if (score >= 8) return '🟢';
  if (score < 8 && score >= 7) return '🔵';
  if (score < 7 && score >= 5) return '⚪';
  if (score < 5 && score >= 2) return '🟤';
  if (score < 2) return '⚫';
}

async function main() {
  const data = [];
  const files = await fs.readdir('posts');
  files.sort();
  for (let idx = 0; idx < files.length; idx++) {
    const fn = files[idx];
    const fileName = `./posts/${fn}`;
    const contents = await fs.readFile(fileName, 'utf-8');
    const title = getTitle(fn, contents);
    const tags = getTagsText(contents);
    const score = getScore(contents);
    const scoreChar = getScoreChar(score);
    const buffer = { idx, fileName, contents, title, tags, score, scoreChar };
    data.push(buffer)
  }
  data.sort((a, b) => b.score - a.score);
  data.forEach(item => {
    if (PRINT) console.log([
      '-',
      item.scoreChar,
      String(item.idx).padStart(3, '0'),
      `**[${item.title}](${encodeURI(item.fileName)})**`,
      item.tags,
    ].join(' '))
  });
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
