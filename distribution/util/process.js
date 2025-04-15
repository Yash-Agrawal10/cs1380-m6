const fs = require('node:fs/promises');
const natural = require('natural');
const path = require('node:path');

async function loadWordList(filepath) {
    try {
        const text = await fs.readFile(filepath, 'utf-8');
        return new Set(text.split(/\r?\n/).map(word => word.trim()).filter(Boolean));
    } catch (error) {
        console.log('Error loading word list:', error);
        return new Set();
    }
}

async function process(url, text) {
    const stopwordsPath = path.resolve(__dirname, 'stopwords.txt');
    const stopwords = await loadWordList(stopwordsPath);

    const words = text.match(/\b\w+\b/g) || [];
    const stemmedWords = words.map((word) => natural.PorterStemmer.stem(word));

    const wordCounts = new Map();
    for (let word of stemmedWords) {
        if (!stopwords.has(word)) {
            if (wordCounts.has(word)) {
                wordCounts.set(word, wordCounts.get(word) + 1);
            } else {
                wordCounts.set(word, 1);
            }
        }
    }

    const output = [];
    for (let [word, count] of wordCounts) {
        output.push({[word]: {url: url, freq: count}});
    }
    return output;
}

// Test
// (async () => {
//     // const url = 'https://www.gutenberg.org/files/11/11-0.txt';
//     const url = 'https://www.usenix.org/publications/proceedings';
//     const response = await fetch(url);
//     const text = await response.text();
//     const result = await process(url, text);

//     console.log(result.slice(0, 10));
// })();

module.exports = { process };