const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.resolve(__dirname, '../store/crawl.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS tocrawl (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    url  TEXT    UNIQUE,
    seen BOOLEAN NOT NULL DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS idx_tocrawl_seen ON tocrawl(seen);

  CREATE TABLE IF NOT EXISTS visited (
    url TEXT PRIMARY KEY
  );
`);

const enqueueStmt = db.prepare(`INSERT OR IGNORE INTO tocrawl (url) VALUES (?)`);
const selectNextStmt = db.prepare(`
  SELECT id, url
    FROM tocrawl
   WHERE seen = 0
ORDER BY id
   LIMIT ?
`);

const markSeenStmt = db.prepare(`UPDATE tocrawl SET seen = 1 WHERE id = ?`);
const markVisitedStmt = db.prepare(`INSERT OR IGNORE INTO visited (url) VALUES (?)`);
const countVisitedStmt = db.prepare(
    `SELECT COUNT(*) AS c FROM tocrawl WHERE seen = 1`
);

const dequeueBatch = db.transaction((n) => {
  const rows = selectNextStmt.all(n);
  for (const { id } of rows) {
    markSeenStmt.run(id);
  }
  return rows.map(r => r.url);
});

module.exports = {
  enqueue:      url => enqueueStmt.run(url),
  dequeueBatch,
  markVisited:  url => markVisitedStmt.run(url).changes > 0,
  visitedCount: ()  => {
    const { c } = countVisitedStmt.get();
    return c;
  }
};
