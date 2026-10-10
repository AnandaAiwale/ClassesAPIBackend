const express = require("express");
const controller = require("./classes.controller");
const { requireAdmin } = require("../../middleware/adminAuth");

const router = express.Router();

router.get("/", requireAdmin, controller.getClasses);
router.get("/:id", requireAdmin, controller.getClassById);

router.post("/", requireAdmin, controller.createClass);
router.put("/:id", requireAdmin, controller.updateClass);
router.patch("/:id/status", requireAdmin, controller.updateClassStatus);
router.delete("/:id", requireAdmin, controller.deleteClass);

module.exports = router;
