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
app.get("/api/books", (req, res) => {
    try {
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
            ORDER BY dateAdded DESC
        `;

        const books = db.prepare(sql).all();

        res.json(books);

    } catch (err) {
        console.error("Error retrieving books:", err);

        res.status(500).json({
            message: "Failed to retrieve books from the database."
        });
    }
});

//Post new books
app.post("/api/books", (req, res) => {
    const {
        title,
        author,
        cover,
        rating,
        review,
        dateAdded
    } = req.body;

    // Validate required fields
    if (!title || !author || !rating || !review) {
        return res.status(400).json({
            message: "Title, author, rating and review are required fields."
        });
    }

    try {
        const sql = `
            INSERT INTO books
            (title, author, cover, rating, review, dateAdded)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const finalDateAdded = Number(dateAdded) || Date.now();

        const result = db.prepare(sql).run(
            title,
            author,
            cover || "",
            Number(rating),
            review,
            finalDateAdded
        );

        // Get the newly created book
        const newBook = db
            .prepare(`
                SELECT
                    id,
                    title,
                    author,
                    cover,
                    rating,
                    review,
                    dateAdded
                FROM books
                WHERE id = ?
            `)
            .get(result.lastInsertRowid);

        res.status(201).json(newBook);

    } catch (err) {
        console.error("Error adding book:", err);

        res.status(500).json({
            message: "Failed to add book to the database."
        });
    }
});

//PUT req to update book
// Update Book
app.put("/api/books/:id", (req, res) => {
    const id = req.params.id;

    const {
        title,
        author,
        cover,
        rating,
        review,
        dateAdded
    } = req.body;

    try {
        // Update the book
        const sql = `
            UPDATE books
            SET
                title = ?,
                author = ?,
                cover = ?,
                rating = ?,
                review = ?,
                dateAdded = ?
            WHERE id = ?
        `;

        const result = db.prepare(sql).run(
            title,
            author,
            cover || "",
            Number(rating),
            review,
            Number(dateAdded) || Date.now(),
            id
        );

        // Check whether the book exists
        if (result.changes === 0) {
            return res.status(404).json({
                message: "Book not found."
            });
        }

        // Get the updated book
        const updatedBook = db
            .prepare(`
                SELECT
                    id,
                    title,
                    author,
                    cover,
                    rating,
                    review,
                    dateAdded
                FROM books
                WHERE id = ?
            `)
            .get(id);

        res.json(updatedBook);

    } catch (err) {
        console.error("Error updating book:", err);

        res.status(500).json({
            message: "Failed to update book in the database."
        });
    }
});

// Delete Book
app.delete("/api/books/:id", (req, res) => {
    const id = req.params.id;

    try {
        const sql = `
            DELETE FROM books
            WHERE id = ?
        `;

        const result = db.prepare(sql).run(id);

        // Check whether the book existed
        if (result.changes === 0) {
            return res.status(404).json({
                message: "Book not found."
            });
        }

        res.json({
            message: "Book deleted successfully.",
            id: Number(id)
        });

    } catch (err) {
        console.error("Error deleting book:", err);

        res.status(500).json({
            message: "Failed to delete book from the database."
        });
    }
});

//Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`The_Shelf server is running on http://localhost:${PORT}`);
});