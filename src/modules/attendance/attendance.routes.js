const express = require("express");
const controller = require("./attendance.controller");
const { requireTeacher } = require("../../middleware/teacherAuth");
const {
    requireClassTeacher,
    requireOwnClass,
    requireAttendanceOwnClass
} = require("../../middleware/classTeacherAuth");

const router = express.Router();

router.get(
    "/class/:classId",
    requireTeacher,
    requireClassTeacher,
    requireOwnClass,
    requireAttendanceOwnClass,
    controller.getAttendanceByDate
);

router.get(
    "/student/:studentId",
    requireTeacher,
    requireClassTeacher,
    requireAttendanceOwnClass,
    controller.getStudentAttendance
);

router.post(
    "/",
    requireTeacher,
    requireClassTeacher,
    requireOwnClass,
    requireAttendanceOwnClass,
    controller.markAttendance
);

router.patch(
    "/:id",
    requireTeacher,
    requireClassTeacher,
    requireAttendanceOwnClass,
    controller.updateAttendance
);

module.exports = router;
