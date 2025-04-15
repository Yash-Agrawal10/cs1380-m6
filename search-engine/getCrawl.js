const distribution = require('../config');

const getCrawl = (crawlGroup, indexGroup, indexOrchestrator, seedURLs, MAX_URLS, URLS_PER_BATCH) => {
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
                // Set up index group on workers and orchestrator
                distribution.crawl.groups.put('index', indexGroup, (e3, v3) => {
                    distribution.local.groups.put('index', indexGroup, (e4, v4) => {
                        callback();
                    });
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
            const contentType = response.headers.get('content-type') || '';

            if (text.length > 1_000_000) {
                console.log(`Page too long at url ${url}`);
                return [{[url]: {valid: false, text: null}}];
            }

            let toStore = text;
            if (contentType.includes('text/html')) {
                const cheerio = distribution.cheerio;
                const $ = cheerio.load(text);
                toStore = $('body').text().replace(/\s+/g, ' ').trim();
            } else if (contentType.includes('text/plain')) {
                toStore = text;
            } else {
                console.log(`Invalid content type at url ${url}`);
                return [{[url]: {valid: false, text: null}}];
            }

            await new Promise((resolve, reject) => {
                distribution.index.store.put(toStore, url, (err, res) => {
                    if (err) return reject(err);
                    resolve(res);
                });
            });

            return [{[url]: {valid: true, text: text}}];
        } catch (err) {
            console.log('Error occurred in crawl mapper:', err);
            return [{[url]: {valid: false, text: null}}];
        }
    };

    const reducer = (key, values) => {
        const url = key;
        const text = values[0].text;
        const valid = values[0].valid;
        if (!valid) {
            return { [url]: {valid: false, urls: []} };
        }

        try {
            const { JSDOM } = distribution.jsdom;
            const dom = new JSDOM(text, { url });
            const document = dom.window.document;
            const links = Array.from(document.querySelectorAll('a[href]'))
                .map(link => link.href)
                .filter(href => href.startsWith('http'));
                return { [url]: {valid: true, urls: links} };
        } catch (err) {
            console.error(`Error occurred in crawl reducer:`, err);
            return { [url]: {valid: false, urls: []} };
        }
    };

    // Define workflow
    const crawlStep = (toCrawl, visited, cb) => {
        console.log('crawl step starting');
        // Termination condition
        if (visited.size >= MAX_URLS) {
            console.log('crawled max URLs');
            cb(toCrawl, Array.from(visited));
            return;
        }

        // Get batch
        let batch = [];
        while (toCrawl.length != 0 && batch.length < URLS_PER_BATCH && visited.size + batch.length < MAX_URLS) {
            const url = toCrawl.shift();
            if (!visited.has(url) && !batch.includes(url)) {
                batch.push(url);
            }
        }

        if (batch.length == 0) {
            console.log('toCrawl empty');
            cb(toCrawl, visited);
            return;
        }

        // Call map-reduce (value is url: [new_urls])
        console.log('mr starting');
        distribution.crawl.mr.exec({keys: batch, map: mapper, reduce: reducer, useStore: false}, (e1, v1) => {
            console.log('mr complete');
            let allNewURLs = [];
            let completedURLs = [];
            v1.map((o) => {
                const completedURL = Object.keys(o)[0];
                const newURLs = Object.values(o)[0].urls;
                const valid = Object.values(o)[0].valid;
                visited.add(completedURL);
                if (valid) {
                    completedURLs.push(completedURL);
                }
                allNewURLs = allNewURLs.concat(newURLs);
            });
            toCrawl = toCrawl.concat(allNewURLs);
            // Persist toCrawl and visited
            distribution.local.store.put(toCrawl, 'toCrawl', (e2, v2) => {
                const visitedList = Array.from(visited);
                distribution.local.store.put(visitedList, 'visited', (e2, v2) => {
                    const remote = {node: indexOrchestrator, service: 'store', method: 'append'};
                    const message = [completedURLs, 'toIndex'];
                    distribution.local.comm.send(message, remote, (e, v) => {
                        const remote2 = {node: indexOrchestrator, service: 'index', method: 'index'};
                        distribution.local.comm.send([], remote2, (e2, v2) => {
                            console.log(`crawl step ending, crawled ${visited.size} urls`);
                            crawlStep(toCrawl, visited, cb);
                        });
                    });
                });
            });
        });
    }

    return (cb) => setupGroups(() => setupLists((toCrawl, visited) => crawlStep(toCrawl, visited, cb)));
}

module.exports = {getCrawl};