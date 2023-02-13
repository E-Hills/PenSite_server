// Requirements
const express = require("express");
const cors = require("cors")

require("dotenv").config({ path: "./config.env"});
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(require("./routes/account"));
app.use(require("./routes/product"));

// Driver connecting
const customers_db = require("./db/conn");
const products_db = require("./db/conn");

app.listen(port, () => {
    // Connect to database on server start
    customers_db.connectToServer("customers", function (err) {
        if (err) console.error(err);
    });

    console.log(`Server is running on port: ${port}`);
});
