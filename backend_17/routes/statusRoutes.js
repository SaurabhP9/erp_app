const express = require("express");
const router = express.Router();
const {
  createStatus,
  getAllStatuses,
  updateStatus,
  deleteStatus,
} = require("../controllers/statusController");
const { verifyToken, requireRole } = require("../middleware/auth");

router.post("/create", verifyToken, requireRole(["admin"]), createStatus);
router.get("/all", verifyToken, getAllStatuses);
router.put("/:id", verifyToken, requireRole(["admin"]), updateStatus);
router.delete("/:id", verifyToken, requireRole(["admin"]), deleteStatus);

module.exports = router;