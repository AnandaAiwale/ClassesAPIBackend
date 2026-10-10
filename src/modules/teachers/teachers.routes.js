const express = require("express");
const controller = require("./teachers.controller");
const { requireAdmin } = require("../../middleware/adminAuth");
const { requireTeacher } = require("../../middleware/teacherAuth");

const router = express.Router();

router.get("/", requireAdmin, controller.getTeachers);
router.get("/profile", requireTeacher, controller.getOwnProfile);
router.put("/profile", requireTeacher, controller.updateOwnProfile);
router.patch("/profile/password", requireTeacher, controller.changeOwnPassword);

router.get("/:id", requireAdmin, controller.getTeacherById);

router.post("/", requireAdmin, controller.createTeacher);
router.put("/:id", requireAdmin, controller.updateTeacher);
router.patch("/:id/status", requireAdmin, controller.updateTeacherStatus);
router.patch("/:id/password", requireAdmin, controller.updateTeacherPassword);
router.delete("/:id", requireAdmin, controller.deleteTeacher);


module.exports = router;
