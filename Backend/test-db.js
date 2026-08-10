const db = require("./db");

db.query("SELECT 1 AS test", (err, results) => {
    if (err) {
        console.error("DB test failed.");
        console.error(err.message);
        return;
    }

    console.log("DB test successful!");
    console.log(results);

    db.end();
});