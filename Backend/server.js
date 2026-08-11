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

//Post new books
app.post("/api/books", (req, res) => {
    const {
        title, author, cover, rating, review, dateAdded
    } = req.body;

    //Validate feilds
    if (!title || !author || !rating || !review) {
        return res.status(400).json({
            message: "Title, author, rating and review are required fields."
        });
    }

    //SQL Insertion Query
    const sql = `
    INSERT INTO books 
    (title, author, cover, rating, review, dateAdded)
    VALUES (?, ?, ?, ?, ?, ?)`;

    const values = [
        title, author, cover || 0, rating, review, dateAdded || Date.now()
    ];

    //Execute the query
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error adding books: ", err);
            return res.status(500).json({
                message: "Failed to add book to the database."
            });
        }

        //Return newly added book
        const newBook = {
            id: result.insertId,
            title: title,
            author: author,
            cover: cover || "",
            rating: Number(rating),
            review: review,
            dateAdded: Number(dateAdded) || Date.now()
        };

        res.status(201).json(newBook);
    });
});

//PUT req to update book
//Update Book
app.put("/api/books/:id", (req, res) => {
    const id = req.params.id;
    const {
        title, author, cover, rating, review, dateAdded
    } = req.body;

    //Variable Fields
    const sql = `
    UPDATE books
    SET 
        title = ?,
        author = ?,
        cover = ?,
        rating = ?,
        review = ?,
        dateAdded = ?
    WHERE id = ?`;

    const values = [
        title, author, cover || "", Number(rating), review, Number(dateAdded) || Date.now(), id
    ];

    //Execute query
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating book.", err);

            return res.status(500).json({
                message: "Failed to update book in the database."
            });
        }

        //Check book existance
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Book not found."
            });
        }

        //Get Updated book
        const selectSql = `
        SELECT
            id,
            title,
            author,
            cover,
            rating,
            review,
            dateAdded
        FROM books
        WHERE id = ?`;

        db.query(selectSql, [id], (selectErr, rows) => {
            if (selectErr) {
                console.error("Error retrieving updated book.", selectErr);

                return res.status(500).json({
                    message: "Failed to retrieve updated book from the database."
                });
            }
            res.json(rows[0]);
        });
    });
});

//Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`The_Shelf server is running on http://localhost:${PORT}`);
});