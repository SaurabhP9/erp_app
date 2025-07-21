// models/Counter.js
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g., 'ticket'
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);
module.exports = Counter;
