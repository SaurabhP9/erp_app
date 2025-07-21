const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true },
    reactions: {
      like: { type: Number, default: 0 },
      love: { type: Number, default: 0 }
    },
    userName: { type: String },
    visibility: {
      type: String,
      enum: ["public", "internal"],
      default: "public"
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comment", commentSchema);
