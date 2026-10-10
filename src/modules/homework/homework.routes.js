const express = require("express");
const controller = require("./homework.controller");
const {
    requireTeacher,
    requireHomeworkOwnAssignment
} = require("../../middleware/teacherAuth");
const { homeworkUpload } = require("../../config/homeworkUpload");

const router = express.Router();

router.get(
    "/teacher",
    requireTeacher,
    controller.getTeacherHomework
);

router.get(
    "/class/:classId/subject/:subjectId",
    requireTeacher,
    controller.getClassSubjectHomework
);

router.get(
    "/:id",
    requireTeacher,
    requireHomeworkOwnAssignment,
    controller.getHomeworkById
);

router.post(
    "/",
    requireTeacher,
    controller.createHomework
);

router.put(
    "/:id",
    requireTeacher,
    controller.updateHomework
);

router.patch(
    "/:id/published",
    requireTeacher,
    controller.updatePublished
);

router.delete(
    "/:id",
    requireTeacher,
    controller.deleteHomework
);

router.post(
    "/:id/images",
    requireTeacher,
    requireHomeworkOwnAssignment,
    homeworkUpload.single("image"),
    controller.addImage
);

router.delete(
    "/images/:imageId",
    requireTeacher,
    controller.deleteImage
);

module.exports = router;
