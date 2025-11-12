const mongoose = require("mongoose");

const taskCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdTime: { type: String, default: () => new Date().toISOString() },
  updatedTime: { type: String, default: () => new Date().toISOString() },
});

module.exports = mongoose.model("TaskCategory", taskCategorySchema);