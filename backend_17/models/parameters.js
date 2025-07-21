const mongoose = require("mongoose");

const paramSchema = new mongoose.Schema({
  sendMail: String,
  setFrom: String,
  setName: String,
  password: String, 
  host: String,
  port: String,
  cc: String,
  createdBy: String,
  createdTime: String,
  updatedBy: String,
  updatedTime: String
});

module.exports = mongoose.model("Parameter", paramSchema);
