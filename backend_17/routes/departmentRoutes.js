const express = require("express");
const router = express.Router();
const {
  createDepartment,
  getAllDepartments,
  updateDepartment,
  deleteDepartment
} = require("../controllers/departmentController");

// Uncomment these when auth is ready
// const { verifyToken, requireRole } = require("../middleware/auth");

router.post("/create", /*verifyToken, requireRole(["admin"]),*/ createDepartment);
router.get("/all", getAllDepartments);
router.put("/:id", /*verifyToken, requireRole(["admin"]),*/ updateDepartment);
router.delete("/:id", /*verifyToken, requireRole(["admin"]),*/ deleteDepartment);

module.exports = router;
