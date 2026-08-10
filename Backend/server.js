const express = require("express");
const cors = require("cors");

require("dotenv").config();

const db = require("./db");
const app = express();

//Frontend -> Backend Communication
app.use(cors());
//JSON data
app.use(express.json({
    limit: "10mb"
}));

//Test Route
app.get("/", (req, res) => {
    res.send("The_Shelf backend is running!");
});

//Get All Books
app.get("/api?books", (req, res) => {
    const sql = `
    SELECT
        id,
        title,
        author,
        cover,
        rating,
        review,
        dateAdded
    FROM books
    ORDER BY dateADDED DESC`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error retrieving books: ", err);
            return res.status(500).json({
                message: "Failed to retrieve books from the database."
            });
        }
        res.json(results);
    });
});

//Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`The_Shelf server is running on http://localhost:${PORT}`);
});