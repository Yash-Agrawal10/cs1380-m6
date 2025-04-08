const natural = require('natural');

// Stem using porterstem
function stem(tokens, URL) {
    const stemmed = tokens.map((token) => {
        console.log(token)
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

console.log(stem(myTokens))

module.exports = { stem }

