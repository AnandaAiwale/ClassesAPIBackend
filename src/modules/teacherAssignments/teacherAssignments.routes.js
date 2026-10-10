const express = require("express");
const controller = require("./teacherAssignments.controller");
const { requireAdmin } = require("../../middleware/adminAuth");

const router = express.Router();

router.get("/:id", requireAdmin, controller.getAssignmentById);

router.get(
    "/teacher/:teacherId",
    requireAdmin,
    controller.getTeacherAssignments
);

router.get(
    "/class/:classId",
    requireAdmin,
    controller.getClassAssignments
);

router.post(
    "/",
    requireAdmin,
    controller.createAssignment
);

router.put(
    "/:id",
    requireAdmin,
    controller.updateAssignment
);

router.delete(
    "/:id",
    requireAdmin,
    controller.deleteAssignment
);

module.exports = router;
