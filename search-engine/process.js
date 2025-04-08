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

// Load stopwords from the file in the current directory TODO: LOAD ONCE AND STORE IN GLOBAL VAR
const stopwordsFile = path.join(__dirname, 'stopwords.txt');
const stopwords = loadStopwords(stopwordsFile);

// use this for testing later
const inputText = `
WELCOME TO CS1380 SIMPLE LINKS
Check out Some stuff [level_2a/index.html].
Check out Some more stuff [level_2b/index.html].
© 2023 CS1380. All rights reserved.
`;

module.exports = { process }
