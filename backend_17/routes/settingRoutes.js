const express = require("express");
const router = express.Router();
const settingController = require("../controllers/settingController");
const { verifyToken, requireRole } = require("../middleware/auth");

// ---------- Organization ----------
router.get("/organization", verifyToken, settingController.getAllOrganizations);
router.get("/organization/:id", verifyToken, settingController.getOrganizationById);
router.post("/organization", verifyToken, requireRole(["admin"]), settingController.createOrganization);
router.put("/organization/:id", verifyToken, requireRole(["admin"]), settingController.updateOrganizationById);
router.delete("/organization/:id", verifyToken, requireRole(["admin"]), settingController.deleteOrganizationById);

// ---------- Parameter ----------
router.get("/parameter", verifyToken, settingController.getParameter);
router.post("/parameter", verifyToken, requireRole(["admin"]), settingController.createParameter);
router.put("/parameter/:id", verifyToken, requireRole(["admin"]), settingController.updateParameter);
router.delete("/parameter/:id", verifyToken, requireRole(["admin"]), settingController.deleteParameter);

module.exports = router;
