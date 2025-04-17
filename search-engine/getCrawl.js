const distribution = require('../config');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const getCrawl = (crawlGroup, indexGroup, indexOrchestrator, seedURLs, MAX_URLS, URLS_PER_BATCH) => {
    const dataDir = path.resolve(__dirname, '../store/orchestrator');
    const toCrawlPath = path.join(dataDir, 'toCrawl.txt');
    const visitedPath  = path.join(dataDir, 'visited.txt');
    const offsetPath   = path.join(dataDir, 'toCrawl.offset');

    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // Set up toCrawl and visited lists
    const setupLists = async () => {
        if (!fs.existsSync(toCrawlPath)) {
            await fs.promises.writeFile(
              toCrawlPath,
              seedURLs.map(u => u + '\n').join('')
            );
        }

        if (!fs.existsSync(visitedPath)) {
            await fs.promises.writeFile(visitedPath, '');
        }

        if (!fs.existsSync(offsetPath)) {
            await fs.promises.writeFile(offsetPath, '0');
        }

        const offsetStr = await fs.promises.readFile(offsetPath, 'utf-8');
        const offset = parseInt(offsetStr, 10) || 0;

        // read visited URLs into a Set
        const visitedData = await fs.promises.readFile(visitedPath, 'utf-8');
        const visitedArr = visitedData.split(/\r?\n/).filter(Boolean);
        const visitedSet = new Set(visitedArr);

        return { offset, visitedSet };
    }

    async function getBatch(offset, visitedSet) {
        const stream = fs.createReadStream(toCrawlPath, {
            encoding: 'utf8',
            start: offset
        });
        const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

        const batch = [];
        let bytes = 0;
        const newlineLength = Buffer.byteLength('\n', 'utf8');

        for await (const line of rl) {
            const lineBytes = Buffer.byteLength(line, 'utf8') + newlineLength;
            if (batch.length >= URLS_PER_BATCH || visitedSet.size + batch.length >= MAX_URLS) {
                break;
            }
            const url = line.trim();
            if (url && !visitedSet.has(url) && !batch.includes(url)) {
                batch.push(url);
            }
            bytes += lineBytes;
        }
    
        rl.close();
        stream.close();
    
        return { batch, newOffset: offset + bytes };
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
    const crawlStep = async (offset, visitedSet, cb) => {
        console.log('crawl step starting');
        // Termination condition
        if (visitedSet.size >= MAX_URLS) {
            console.log('crawled max URLs');
            return cb();
        }

        // Get batch
        const { batch, newOffset } = await getBatch(offset, visitedSet);

        if (batch.length == 0) {
            console.log('toCrawl empty');
            return cb();
        }

        // Call map-reduce (value is url: [new_urls])
        distribution.crawl.mr.exec({keys: batch, map: mapper, reduce: reducer, useStore: false}, async (e1, v1) => {
            const completed = [];
            let allNew = [];

            for (const res of v1) {
                const url = Object.keys(res)[0];
                const { valid, urls } = res[url];
                visitedSet.add(url);
                completed.push(url);
                allNew = allNew.concat(urls);
            }

            await fs.promises.appendFile(
                visitedPath,
                completed.map(u => u + '\n').join('')
            );

            await fs.promises.appendFile(
                toCrawlPath,
                allNew.map(u => u + '\n').join('')
            );

            await fs.promises.writeFile(offsetPath, newOffset.toString());
  
            const remote = {node: indexOrchestrator, service: 'store', method: 'append'};
                const message = [completed, 'toIndex'];
                distribution.local.comm.send(message, remote, (e, v) => {
                    const remote2 = {node: indexOrchestrator, service: 'index', method: 'index'};
                    distribution.local.comm.send([], remote2, (e2, v2) => {
                        console.log(`crawl step ending, crawled ${visitedSet.size} urls`);
                        crawlStep(newOffset, visitedSet, cb);
                });
            });
        });
    }

    return (cb) => {
        setupGroups(async () => {
            const { offset, visitedSet } = await setupLists();
            crawlStep(offset, visitedSet, cb);
        });
    }
}

module.exports = { getCrawl };