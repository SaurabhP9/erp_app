  const mongoose = require("mongoose");

  const prioritySchema = new mongoose.Schema({
    priority: String,
    createdBy: String,
    createdTime: { type: String, default: () => new Date().toISOString() },
    updatedBy: String,
    updatedTime: { type: String, default: () => new Date().toISOString() }
  });

  module.exports = mongoose.model("Priority", prioritySchema);
