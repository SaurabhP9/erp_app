const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController");

const { verifyToken, requireRole } = require("../middleware/auth");

router.post("/create", verifyToken, requireRole(["admin"]), createCategory);
router.get("/all", getAllCategories);
router.put("/:id", verifyToken, requireRole(["admin"]), updateCategory);
router.delete("/:id", verifyToken, requireRole(["admin"]), deleteCategory);

module.exports = router;
