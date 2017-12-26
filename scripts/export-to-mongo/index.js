require('dotenv').config();
require('shelljs/global');
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const mdToJson = require('../../lib/md-to-json');
const projectMetaData = require('../../package');
const { run } = require('./wrappers');

const readFileAsync = promisify(fs.readFile);
const MongoClient = require('mongodb').MongoClient;

const dbUrl = process.env.DB_URL;
const dbName = projectMetaData.name;
const postsDir = path.resolve(__dirname, '../../posts');

function addUniqueItems (toArray, fromArray) {
  for (let i = 0, l = fromArray.length; i < l; i++) {
    if (!toArray.includes(fromArray[i])) {
      toArray.push(fromArray[i]);
    }
  }
  return toArray;
}

run(async function () {
  // convert all md posts to jsons
  let fileNames = Array.from(ls(`${postsDir}/*.md`));
  let contents = await Promise.all(fileNames.map(fn => readFileAsync(fn, 'utf8')));
  let jsons = contents
    .map((text, i) => mdToJson(fileNames[i], text))
    .map(post => ({...post, _id: post.id}));

  // connect to mongo
  let client = await MongoClient.connect(dbUrl);
  let db = client.db(dbName);
  console.log(`connected to db "${dbName}"`);

  // reset and reinsert posts
  let collection = db.collection('posts');
  await collection.remove({});
  await collection.insertMany(jsons);
  console.log(`${jsons.length} posts added`);

  // example queries
  collection = db.collection('posts');
  let items = await collection.find().project({ tags: 1 }).toArray();
  let tags1 = jsons.reduce((acc, item) => addUniqueItems(acc, item.tags), []); // or reduce + concat + new Set
  let tags2 = items.reduce((acc, item) => addUniqueItems(acc, item.tags), []);
  assert(items.length, jsons.length);
  assert(tags1.length, tags2.length);
  client.close();
});
