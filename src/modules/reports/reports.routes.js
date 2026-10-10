const express = require("express");
const controller = require("./reports.controller");
const { requireAdmin } = require("../../middleware/adminAuth");
const { requireTeacher } = require("../../middleware/teacherAuth");
const { requireStudent } = require("../../middleware/studentAuth");
const {
    requireClassTeacher
} = require("../../middleware/classTeacherAuth");

const router = express.Router();

/*
 * ADMIN REPORTS
 */

router.get(
    "/admin/attendance/:classId",
    requireAdmin,
    controller.getClassAttendanceReport
);

router.get(
    "/admin/attendance/:classId/summary",
    requireAdmin,
    controller.getClassAttendanceSummary
);

router.get(
    "/admin/homework/:classId",
    requireAdmin,
    controller.getClassHomeworkReport
);

router.get(
    "/admin/teachers",
    requireAdmin,
    controller.getTeacherReport
);

router.get(
    "/admin/students/:classId",
    requireAdmin,
    controller.getStudentReport
);

router.get(
    "/admin/homework-summary",
    requireAdmin,
    controller.getHomeworkSummary
);

/*
 * CLASS TEACHER REPORTS
 */

router.get(
    "/teacher/attendance",
    requireTeacher,
    requireClassTeacher,
    controller.getClassTeacherAttendanceReport
);

router.get(
    "/teacher/homework",
    requireTeacher,
    requireClassTeacher,
    controller.getClassTeacherHomeworkReport
);

/*
 * STUDENT REPORTS
 */

router.get(
    "/student/attendance",
    requireStudent,
    controller.getStudentAttendanceReport
);

module.exports = router;
