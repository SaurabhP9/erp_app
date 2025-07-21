const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: String,
  message: String,
  isView: String,
  createdBy: String,
  createdTime: String,
  updatedBy: String,
  updatedTime: String
});

module.exports = mongoose.model("Notification", notificationSchema);
