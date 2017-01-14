require('shelljs/global');
const _ = require('lodash');
const dedent = require('dedent');
const parser = require('xml2json');
const sanitize = require('sanitize-filename');
const removeDiacritics = require('diacritics').remove;
const HtmlEntities = require('html-entities').XmlEntities;
const entities = new HtmlEntities();
const leftPad = require('../../lib/left-pad');

const inputDir = './xml';
const outputDir = './posts';

// find the last exported xml in the xml folder
let xmlFile = _.last(Array.from(ls(`${inputDir}/*.xml`)).sort((a, b) => {
  let num = (fn) => {
    let date = fn.match(/blog-(\d{2})-(\d{2})-(\d{4})/) || [];
    return parseInt(date[3] || 0, 10) + parseInt(date[1] || 0, 10) + parseInt(date[2] || 0, 10) || 0;
  };
  a = num(a);
  b = num(b);
  return ((a < b) ? -1 : ((a > b) ? 1 : 0));
}));

if (!xmlFile) {
  console.error('xml file not found.');
  process.exit(1);
}

// and convert it to something less painful
let xmlFileContents = cat(xmlFile).toString();
let blog = parser.toJson(xmlFileContents, {object: true});
let entries = _.get(blog, 'feed.entry');
let posts = _.filter(entries, entry => entry.id.indexOf('.post-') > -1);

// create easily parsable json structure from blogger trash
posts = posts.map(post => {
  let ret = {};
  ret.rawDate = post.published.substr(0, 10);
  ret.date = new Date(post.published);
  ret.tags = _.without(_.map(post.category, cat => cat.term.indexOf('/') > -1 ? '' : cat.term), '');
  ret.title = post.title.$t;
  ret.body = post.content.$t;
  return ret;
});

posts = _.sortBy(posts, ['date']);

// write markdown files
posts.forEach((post, i) => {
  let niceName = entities.decode(post.title.replace(/^\d*@?\s?\|?\s?/, '').replace(/\//g, '-'));
  let fileName = leftPad(i + 1, 4) + ' ' + niceName;
  fileName = removeDiacritics(sanitize(fileName));
  fileName = fileName.replace(/\s+/g, ' ');
  fileName = fileName.replace(/\((\d{4})\)/, '- $1');
  let tags = _.map(post.tags.sort(), tag => `[${tag}]`).join(', ');
  let body = entities.decode(post.body);
  body = body.replace(/<br\s?\/?>/g, '\n'); // line breaks
  let md = dedent(`
    # ${niceName}

    ${body}

    ----

    ${tags}
  ` + '\n');
  md.to(`${outputDir}/${fileName}.md`);
});
