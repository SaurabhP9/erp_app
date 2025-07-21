const express = require("express");
const router = express.Router();
const {
    createPriority,
    getAllPriorities,
    updatePriority,
    deletePriority,
  } = require("../controllers/priortyController"); 

const { verifyToken, requireRole } = require("../middleware/auth");

router.post("/create", verifyToken, requireRole(["admin"]), createPriority);
router.get("/all", getAllPriorities);
router.put("/:id", verifyToken, requireRole(["admin"]), updatePriority);
router.delete("/:id", verifyToken, requireRole(["admin"]), deletePriority);

module.exports = router;
