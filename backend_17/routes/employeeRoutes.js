const express = require("express");
const router = express.Router();
const controller = require("../controllers/employeeController");

const { verifyToken, requireRole } = require("../middleware/auth");

router.post("/create", verifyToken, requireRole(["admin"]), controller.createEmployee);
router.get("/", controller.getAllEmployees);
router.put("/:id", verifyToken, requireRole(["admin"]), controller.updateEmployee);
router.delete("/:id", verifyToken, requireRole(["admin"]), controller.deleteEmployee);

module.exports = router;
