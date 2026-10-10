const express = require("express");
const controller = require("./studentSubjects.controller");
const { requireTeacher } = require("../../middleware/teacherAuth");
const {
    requireClassTeacher,
    requireStudentOwnClass,
    requireStudentSubjectAssignmentOwnClass,
    requireStudentSubjectCreateOwnClass
} = require("../../middleware/classTeacherAuth");

const router = express.Router();

router.get(
    "/student/:studentId",
    requireTeacher,
    requireClassTeacher,
    requireStudentOwnClass,
    controller.getStudentSubjects
);

router.get(
    "/:id",
    requireTeacher,
    requireClassTeacher,
    requireStudentSubjectAssignmentOwnClass,
    controller.getAssignmentById
);

router.post(
    "/",
    requireTeacher,
    requireClassTeacher,
    requireStudentSubjectCreateOwnClass,
    controller.createAssignment
);

router.patch(
    "/:id/status",
    requireTeacher,
    requireClassTeacher,
    requireStudentSubjectAssignmentOwnClass,
    controller.updateAssignmentStatus
);

router.delete(
    "/:id",
    requireTeacher,
    requireClassTeacher,
    requireStudentSubjectAssignmentOwnClass,
    controller.deleteAssignment
);

module.exports = router;
