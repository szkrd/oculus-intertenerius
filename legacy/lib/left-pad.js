module.exports = function leftPad (n, count, str = '0') {
  return Array(count - String(n).length + 1).join(str) + n;
};
