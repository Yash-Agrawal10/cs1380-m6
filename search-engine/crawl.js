const distribution = require('../config');

// Set up toCrawl and visited lists (persistently)
const seedURLs = [
    'temp'
];

const setup = (callback) => {
    // Initialize toCrawl list
    distribution.local.store.get('toCrawl', (e1, v1) => {
        const toCrawl = v1 || seedURLs;
        distribution.local.store.put(toCrawl, 'toCrawl', (e2, v2) => {
            // Initialize visited list
            distribution.local.store.get('visited', (e3, v3) => {
                const visited = v3 || [];
                distribution.local.store.put(visited, 'visited', (e4, v4) => {
                    callback(toCrawl, visited);
                });
            });
        });
    });
}

// Call map-reduce to crawl batch of urls in a loop
const crawlGroup = {};
const MAX_URLS = 5;
const URLS_PER_BATCH = 3;
const crawl = (toCrawl, visited) => {
    while (true) {
        // Termination condition
        if (visited.length >= MAX_URLS) break;

        // Select urls for batch
        const urlsInBatch = Math.min(toCrawl.length, URLS_PER_BATCH);
        const urls = toCrawl.splice(0, urlsInBatch);

        // Put urls in storage system
        urls.forEach((url) => {
            distribution.crawlGroup.store.put(url, url)
        });
    }
}

// Until certain number of urls are crawled