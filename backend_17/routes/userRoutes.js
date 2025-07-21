const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  changePassword,
  getAllUsersByRole
} = require("../controllers/userController");

const { verifyToken, requireRole } = require("../middleware/auth");

router.post("/change-password", verifyToken, changePassword);

// Secure your routes if needed
router.post("/create", verifyToken, requireRole(["admin"]), createUser);
router.get("/all", verifyToken, getAllUsers);
router.put("/:id", verifyToken, requireRole(["admin"]), updateUser);
router.delete("/:id", verifyToken, requireRole(["admin"]), deleteUser);

router.get("/by-role/:role", verifyToken, getAllUsersByRole);


module.exports = router;