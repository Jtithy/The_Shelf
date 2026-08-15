const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const defaultDataDir = path.join(__dirname, "data");
const defaultDatabasePath = path.join(
    defaultDataDir,
    "the_shelf.db"
);

// Use Electron's database location when provided.
// Otherwise use the normal development location.
const databasePath =
    process.env.THE_SHELF_DB_PATH || defaultDatabasePath;

// Make sure the parent directory exists.
fs.mkdirSync(path.dirname(databasePath), {
    recursive: true
});

// Connect to SQLite
const db = new Database(databasePath);

console.log("SQLite database connected successfully!");
console.log("Database:", databasePath);

// Create books table if it doesn't exist.
db.exec(`
    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        cover TEXT DEFAULT '',
        rating INTEGER NOT NULL,
        review TEXT NOT NULL,
        dateAdded INTEGER NOT NULL
    )
`);

console.log("Books table is ready.");

module.exports = db;