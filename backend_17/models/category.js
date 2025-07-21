const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  category: { type: String, required: true },
  createdBy: String,
  createdTime:  { type: String, default: () => new Date().toISOString() },
  updatedBy: String,
  updatedTime:  { type: String, default: () => new Date().toISOString() }
});

module.exports = mongoose.model("Category", categorySchema);
