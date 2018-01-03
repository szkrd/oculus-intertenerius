function jsonToMd (json) {
  let content = `# ${json.fullTitle}` + (json.movieYear ? ` - ${json.movieYear}` : '');
  content += '\n\n';
  content += json.mainContent;
  content += '\n\n';
  content += json.watchDateRaw;
  content += '\n\n';
  content += '----';
  content += '\n\n';
  content += (json.tags || []).map(tag => `[${tag}]`).join(', ');
  content += '\n\n';
  return content;
}

module.exports = jsonToMd;
