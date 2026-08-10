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

//Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`The_Shelf server is running on http://localhost:${PORT}`);
});