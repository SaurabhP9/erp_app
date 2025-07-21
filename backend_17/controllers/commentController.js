const Comment = require("../models/comment");

// CREATE comment
exports.createComment = async (req, res) => {
  try {
    console.log("new comment req body ", req.body);
    const newComment = await Comment.create(req.body);
    console.log("new comment ", newComment);
    const populated = await newComment.populate("userId", "name email");
    console.log("new comment populated  ", populated);
    res.status(201).json(populated);
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ error: "Failed to create comment", details: err });
  }
};

// GET /api/comments/:ticketId?userRole=client
exports.getCommentsByTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { userRole } = req.query;

    let comments = await Comment.find({ ticketId })
      .sort({ createdAt: 1 })
      .populate("userId", "name email");

    if (userRole === "client") {
      comments = comments.filter(c => c.visibility === "public");
    }

    res.status(200).json(comments);
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ error: "Failed to fetch comments", details: err });
  }
};

// UPDATE reaction
exports.updateReaction = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { type } = req.body;

    if (!["like", "love", "laugh"].includes(type)) {
      return res.status(400).json({ error: "Invalid reaction type" });
    }

    const updated = await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { [`reactions.${type}`]: 1 } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Comment not found" });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update reaction", details: err });
  }
};

// DELETE comment
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const deleted = await Comment.findByIdAndDelete(commentId);
    if (!deleted) return res.status(404).json({ error: "Comment not found" });
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete comment", details: err });
  }
};

// UPDATE comment text
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { comment } = req.body;

    const updated = await Comment.findByIdAndUpdate(
      commentId,
      { comment, updatedAt: new Date() },
      { new: true }
    ).populate("userId", "name email");

    if (!updated) return res.status(404).json({ error: "Comment not found" });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error updating comment", details: err });
  }
};
