const express = require("express");
const db_conn = require("../db/conn");
//const Product = require("../models/product");
//const ObjectId = require("mongodb").ObjectId;
 
const accountRoutes = express.Router();
 
// Get all the pen-related products.
accountRoutes.route("/pens").get(function (req, res) {
 let product_db = db_conn.getDb("products");
 product_db
   .collection("pens")
   .find({})
   .toArray(function (err, result) {
     if (err) throw err;
     res.json(result);
   });
});
 
module.exports = accountRoutes;