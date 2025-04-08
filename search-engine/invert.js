// Create a local index.txt for that website

// Should return array of objects mapping 
// {term: {url: freq}}

function invert(grams, URL) {
    res = []
    // Build map of term -> freq
    const termToFreq = {}
    grams.forEach((gram) => {
        // if gram in map
        if (gram in termToFreq) {
            termToFreq[gram] += 1
        }
        else {
            termToFreq[gram] = 1
        }
    })

    // Create array of objects
    for (const key in termToFreq) {
        const obj = {
            [key]: {
                'url': URL,
                'freq': termToFreq[key]
            }
        }
        res.push(obj)
    }
    return res
}

module.exports = {invert}