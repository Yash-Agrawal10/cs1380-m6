const {convert} = require('html-to-text');
const {process, loadStopwords} = require('./process')
const {stem} = require('./stem')
const {invert} = require('./invert')
const fs = require('fs');
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

module.exports = { inverter }