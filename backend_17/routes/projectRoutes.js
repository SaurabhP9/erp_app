const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");

router.post("/create", projectController.createProject);
router.get("/all", projectController.getAllProjects);
router.get("/:id", projectController.getProjectById);
router.put("/update/:id", projectController.updateProject);
router.delete("/:id", projectController.deleteProject);

module.exports = router;