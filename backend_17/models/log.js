const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  loginId: Number,
  loginTime: String,
  loginIP: String,
  loginUserAgent: String,
  logoutTime: String,
  logoutIP: String,
  logoutUserAgent: String
});

module.exports = mongoose.model("Log", logSchema);
