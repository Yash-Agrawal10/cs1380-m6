const distribution = require('../config');

const crawl = (crawlGroup, indexGroup, indexOrchestrator, seedURLs, MAX_URLS, URLS_PER_BATCH) => {
    // Set up toCrawl and visited lists
    const setupLists = (callback) => {
        // Initialize toCrawl list
        distribution.local.store.get('toCrawl', (e1, v1) => {
            const toCrawl = v1 || seedURLs;
            distribution.local.store.put(toCrawl, 'toCrawl', (e2, v2) => {
                // Initialize visited list
                distribution.local.store.get('visited', (e3, v3) => {
                    const visited = v3 || [];
                    distribution.local.store.put(visited, 'visited', (e4, v4) => {
                        const visitedSet = new Set(visited);
                        callback(toCrawl, visitedSet);
                    });
                });
            });
        });
    }

    // Set up groups
    const setupGroups = (callback) => {
        // Set up crawl group on orchestrator
        distribution.local.groups.put('crawl', crawlGroup, (e1, v1) => {
            // Set up crawl group on workers
            distribution.crawl.groups.put('crawl', crawlGroup, (e2, v2) => {
                // Set up index group on workers
                distribution.crawl.groups.put('index', indexGroup, (e3, v3) => {
                    callback();
                });
            });
        });
    }

    // Define map and reduce functions
    const mapper = async (key, value) => {
        const url = key;
        try {
            const response = await fetch(url);
            const text = await response.text();
            return [{[url]: text}];
        } catch (err) {
            console.log('Error occurred in mapper: ', err);
            return [];
        }
    };

    const reducer = (key, values) => {
        const url = key;
        const text = values[0];
        try {
            const { JSDOM } = distribution.jsdom;
            const dom = new JSDOM(text, { url });
            const document = dom.window.document;
            const links = Array.from(document.querySelectorAll('a[href]'))
                .map(link => link.href)
                .filter(href => href.startsWith('http'));
            return { [url]: links };
        } catch (err) {
            console.error(`Reducer error for ${url}:`, err);
            return { [url]: [] };
        }
    };

    // Define workflow
    const crawlStep = (toCrawl, visited) => {
        // Termination condition
        if (visited.size >= MAX_URLS) {
            console.log('Done crawling!');
            return;
        }

        // Get batch
        let batch = [];
        while (toCrawl.length != 0 && batch.length < URLS_PER_BATCH) {
            const url = toCrawl.shift();
            if (!visited.has(url)) {
                batch.push(url);
            }
        }

        if (batch.length == 0) {
            console.log('Out of URLs to crawl');
            return;
        }

        // Call map-reduce (value is url: [new_urls])
        distribution.crawl.mr.exec({keys: batch, map: mapper, reduce: reducer, useStore: false}, (e1, v1) => {
            batch.map((url) => visited.add(url));
            const newURLs = v1.flat();
            toCrawl.push(...newURLs);
            // Persist toCrawl and visited
            distribution.local.store.put(toCrawl, 'toCrawl', (e2, v2) => {
                const visitedList = Array.from(visited);
                distribution.local.store.put(visitedList, 'visited', (e2, v2) => {
                    crawlStep(toCrawl, visited);
                });
            });
        });
    }

    setupGroups(() => setupLists((toCrawl, visited) => crawlStep(toCrawl, visited)));
}

module.exports = {crawl};