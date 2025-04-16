const distribution = require('../config');
const { enqueue, dequeueBatch, markVisited, visitedCount } = require('./db');

const getCrawl = (crawlGroup, indexGroup, indexOrchestrator, seedURLs, MAX_URLS, URLS_PER_BATCH) => {
    // Set up toCrawl and visited lists
    // const setupLists = (callback) => {
    //     // Initialize toCrawl list
    //     distribution.local.store.get('toCrawl', (e1, v1) => {
    //         const toCrawl = v1 || seedURLs;
    //         distribution.local.store.put(toCrawl, 'toCrawl', (e2, v2) => {
    //             // Initialize visited list
    //             distribution.local.store.get('visited', (e3, v3) => {
    //                 const visited = v3 || [];
    //                 distribution.local.store.put(visited, 'visited', (e4, v4) => {
    //                     const visitedSet = new Set(visited);
    //                      callback(toCrawl, visitedSet);
    //                 });
    //             });
    //         });
    //     });
    // }

    const setupDB = () => {
        for (const url of seedURLs) enqueue(url);
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
            const MAX_LENGTH = 200_000;
            const response = await fetch(url);
            const contentType = response.headers.get('content-type') || '';
            const length  = response.headers.get('content-length');

            if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
                console.log(`Invalid content type at url ${url}, type ${contentType}`);
                return [{[url]: {valid: false, text: null}}]; 
            }

            if (length && Number(length) > MAX_LENGTH) {
                console.log(`Page too long at url ${url}, len ${length}`);
                return [{[url]: {valid: false, text: null}}]; 
            }


            const text = await response.text();
            if (text.length > MAX_LENGTH) {
                console.log(`Downloaded page too long at url ${url}, len ${text.length}`);
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
                console.log(`Should not reach here, did at ${url}`);
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
    const crawlStep = (cb) => {
        console.log('crawl step starting');

        const batch = dequeueBatch(URLS_PER_BATCH);
        // console.log(batch);
        if (batch.length === 0) {
            console.log('toCrawl empty');
            return cb();
        }

        // Call map-reduce (value is url: [new_urls])
        distribution.crawl.mr.exec({keys: batch, map: mapper, reduce: reducer, useStore: false}, (e1, v1) => {
            const completedURLs = [];
            const allNewURLs    = [];

            for (const resultObj of v1) {
                const [url] = Object.keys(resultObj);
                const { valid, urls } = resultObj[url];
                if (valid) {
                    completedURLs.push(url);
                    allNewURLs.push(...urls);
                }
            }

            for (const link of allNewURLs) {
                if (markVisited(link)) {
                    enqueue(link);
                }
            }

            const remote = {node: indexOrchestrator, service: 'store', method: 'append'};
            const message = [completedURLs, 'toIndex'];
            distribution.local.comm.send(message, remote, (e, v) => {
                const remote2 = {node: indexOrchestrator, service: 'index', method: 'index'};
                distribution.local.comm.send([], remote2, (e2, v2) => {
                    const visitedURLs = visitedCount();
                    console.log(`crawl step ending, crawled ${visitedURLs} urls`);
                    if (visitedURLs >= MAX_URLS) {
                        console.log('done crawling!');
                        return cb();
                    }
                    crawlStep(cb);
                });
            });

            // toCrawl = toCrawl.concat(allNewURLs);
            // // Persist toCrawl and visited
            // distribution.local.store.put(toCrawl, 'toCrawl', (e2, v2) => {
            //     const visitedList = Array.from(visited);
            //     distribution.local.store.put(visitedList, 'visited', (e2, v2) => {
            //         const remote = {node: indexOrchestrator, service: 'store', method: 'append'};
            //         const message = [completedURLs, 'toIndex'];
            //         distribution.local.comm.send(message, remote, (e, v) => {
            //             const remote2 = {node: indexOrchestrator, service: 'index', method: 'index'};
            //             distribution.local.comm.send([], remote2, (e2, v2) => {
            //                 console.log(`crawl step ending, crawled ${visited.size} urls`);
            //                 crawlStep(toCrawl, visited, cb);
            //             });
            //         });
            //     });
            // });
        });
    }

    return (cb) => {
        setupDB();
        setupGroups(() => {
            crawlStep(cb);
        });
    }
}

module.exports = { getCrawl };