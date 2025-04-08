const fs = require('fs');
const path = require('path');

function loadStopwords(filePath) {
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  return new Set(
    fileContents
      .split(/\r?\n/)
      .map(word => word.trim().toLowerCase())
      .filter(word => word.length > 0)
  );
}

function process(text, stopwordsSet) {
  // Normalize to ASCII
  text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Lowercase
  text = text.toLowerCase();

  // Split on non-letter characters instead of removing them
  const tokens = text.split(/[^a-z]+/);

  // Remove stopwords and empty strings
  const filtered = tokens.filter(token =>
    token.length > 0 && !stopwordsSet.has(token)
  );

  // Don't deduplicate if you want to keep repeated important tokens
  return filtered;
}

module.exports = { process, loadStopwords }
