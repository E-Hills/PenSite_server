const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  forename: {
    type: String,
    required: false,
  },
  surname: {
    type: String,
    required: false,
  },
}, {timestamps: true})

const Account = mongoose.model("User", userSchema)

module.exports = Account;