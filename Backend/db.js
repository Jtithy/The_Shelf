const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// Database folder
const dataDir = path.join(__dirname, "data");

// Create data folder if it doesn't exist
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Database file
const dbPath = path.join(dataDir, "the_shelf.db");

// Connect to SQLite
const db = new Database(dbPath);

console.log("SQLite database connected successfully!");
console.log("Database:", dbPath);

// Create books table if it doesn't exist
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