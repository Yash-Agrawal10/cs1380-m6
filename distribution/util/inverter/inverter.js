const {convert} = require('html-to-text');
const {process, loadStopwords} = require('./process')
const {stem} = require('./stem')
const {invert} = require('./invert')
const path = require('path');

// Takes in string of html markup and URL string
function inverter(html, URL) {
    // Convert html markup to text
    text = convert(html)

    // Load stopwords
    const stopwordsFile = path.join(__dirname, 'stopwords.txt');
    const stopwords = loadStopwords(stopwordsFile);
    
    // Process the text
    const tokens = process(text, stopwords)

    // Stem the tokens
    const stemmed = stem(tokens)
    
    // Create local index
    const index = invert(stemmed, URL)

    return index
}

// Testing
const testInverter = async () => {
    const url = 'https://www.gutenberg.org/';
    const response = await fetch(url);
    const text = await response.text();
    const index = inverter(text, url);
    console.log(index);
}

module.exports = { inverter }