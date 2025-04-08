const natural = require('natural');

// Stem using porterstem
function stem(tokens) {
    const stemmed = tokens.map((token) => {
        return natural.PorterStemmer.stem(token)
    })
    return stemmed
}

module.exports = { stem }

