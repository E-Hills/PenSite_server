const express = require("express");
const dbo = require("../db/conn");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Account = require("../models/account");
const ObjectId = require("mongodb").ObjectId;
 
const accountRoutes = express.Router();

function verifyJWT(req, res, next) {
  const token = req.headers["x-access-token"]?.split(" ")[1]

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(400).json({
        msg: "Authentication Failed",
        validToken: false
      })
      req.user = {};
      req.user._id = decoded._id;
      req.user.forename = decoded.forename;
      next();
    });
  } else {
    res.status(401).json({msg: "Invalid Token", validToken: false});
  }
}

accountRoutes.route("/verifyToken").get( verifyJWT, function (req, res) {
  res.status(200).json({msg: "Valid Token", validToken: true, forename: req.user.forename});
})
 
// List of all the accounts.
accountRoutes.route("/account").get(function (req, res) {
 let db_connect = dbo.getDb("customers");
 db_connect
   .collection("accounts")
   .find({})
   .toArray(function (err, result) {
     if (err) throw err;
     res.json(result);
   });
});

// Get a single account by email
accountRoutes.route("/account/:email").get(function (req, res) {
  let db_connect = dbo.getDb();
  let myquery = { email: req.params.email };
  db_connect
    .collection("accounts")
    .findOne(myquery, function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});
 
// Create a new account.
accountRoutes.route("/account/create").post(async function (req, res) {
  const saltRounds = 10;
  
  let collection = dbo.getDb().collection("accounts");

  const postAccount = new Account ({
    email: req.body.email.toLowerCase(),
    password: req.body.password,
    forename: req.body.forename,
    surname: req.body.surname
  })

  // Check email is not associated with an existing account
  collection.findOne({email: postAccount.email})
  .then(
    (compAccount) => {
      if (compAccount) {
        return res.status(409).json("An account already exists with that email");
      } else {
        // Generate salt
        bcrypt.genSalt(saltRounds)
        .then(
          (salt) => {
            // Perform hash using salt
            bcrypt.hash(postAccount.password, salt) 
            .then (
              (hash) => {
                // Insert new account
                collection.insertOne({ 
                  email: postAccount.email, 
                  password: hash,
                  forename: postAccount.forename})
                .then(
                  (out) => {
                    return res.json(out);
                  }, 
                  (insertErr) => {
                    if (insertErr) throw insertErr;
                  }
                );
              },
              (hashErr) => {
                if (hashErr) throw hashErr;
              }
            );
          },
          (saltErr) => {
            if (saltErr) throw saltErr;
          } 
        );
      }
    }, 
    (findErr) => {
      if (findErr) throw findErr;
    }
  );
});

// Sign-in with pre-existing account
accountRoutes.route("/account/signin").post(async function (req, res) {
  
  let collection = dbo.getDb().collection("accounts");

  const postAccount = new Account ({
    email: req.body.email.toLowerCase(),
    password: req.body.password
  })

  // Check email is associated with an existing account
  collection.findOne({email: postAccount.email})
  .then(
    (compAccount) => {
      if (!compAccount) {
        return res.status(404).json({msg: "Could not find an account with that email"});
      } else {
        // Compare passwords
        bcrypt.compare(postAccount.password, compAccount.password)
        .then(
          (match) => {
            if (match) {
              const payloadAccount = {
                _id: compAccount._id,
                forename: compAccount.forename
              }
              // Generate token
              jwt.sign(
                payloadAccount,
                process.env.JWT_SECRET,
                {expiresIn: 86400},
                (tokenErr, token) => {
                  if (tokenErr) throw tokenErr;
                  return res.status(200).json({
                    msg: "Sign-in accepted",
                    tkn: "Bearer " + token,
                    name: compAccount.forename
                  });
                }
              );
              } else {
              return res.status(401).json({msg: "Sign-in rejected"});
            }
          },
          (matchErr) => {
            if (matchErr) throw matchErr;
          } 
        );
      }
    }, 
    (findErr) => {
      if (findErr) throw findErr;
    }
  );
});

 
// update an account by id.
accountRoutes.route("/update/:id").post(function (req, res) {
  let db_connect = dbo.getDb();
  let myquery = { _id: ObjectId(req.params.id) };
  let newvalues = {
    $set: {
      email: req.body.email,
      password: req.body.password,
    },
  };
 db_connect
   .collection("accounts")
   .updateOne(myquery, newvalues, function (err, res) {
     if (err) throw err;
     console.log("1 document updated");
     res.json(res);
   });
});
 
// delete a account
accountRoutes.route("/:id").delete((req, res) => {
 let db_connect = dbo.getDb();
 let myquery = { _id: ObjectId(req.params.id) };
 db_connect.collection("accounts").deleteOne(myquery, function (err, obj) {
   if (err) throw err;
   console.log("1 document deleted");
   res.json(obj);
 });
});
 
module.exports = accountRoutes;