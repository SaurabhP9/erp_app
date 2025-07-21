const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

router.post("/", commentController.createComment);
router.get("/:ticketId", commentController.getCommentsByTicket);
router.patch("/react/:commentId", commentController.updateReaction);
router.delete("/:commentId", commentController.deleteComment);
router.put("/:commentId", commentController.updateComment);

module.exports = router;