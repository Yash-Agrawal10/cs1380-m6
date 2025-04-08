const natural = require('natural');

// Stem using porterstem
function stem(tokens) {
    const stemmed = tokens.map((token) => {
        return natural.PorterStemmer.stem(token)
    })
    return stemmed
}
// TODO: Use this for testing later
myTokens = [
    'simple', 'links',
    'check',  'stuff',
    'level',  'check',
    'stuff',  'level',
    'rights'
]

module.exports = { stem }

