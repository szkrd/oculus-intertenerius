// or just do a reduce + concat + [...new Set]
module.exports = function concatUnique (toArray, fromArray) {
  for (let i = 0, l = fromArray.length; i < l; i++) {
    if (!toArray.includes(fromArray[i])) {
      toArray.push(fromArray[i]);
    }
  }
  return toArray;
};
