const express = require("express");
const controller = require("./subjects.controller");
const { requireAdmin } = require("../../middleware/adminAuth");

const router = express.Router();

router.get("/", requireAdmin, controller.getSubjects);
router.get("/:id", requireAdmin, controller.getSubjectById);

router.post("/", requireAdmin, controller.createSubject);
router.put("/:id", requireAdmin, controller.updateSubject);
router.patch("/:id/status", requireAdmin, controller.updateSubjectStatus);
router.delete("/:id", requireAdmin, controller.deleteSubject);

module.exports = router;
