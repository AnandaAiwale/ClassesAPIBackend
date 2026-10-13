const express = require("express");
const { studentUpload } = require("../../config/studentUpload");
const controller = require("./students.controller");
const { requireTeacher } = require("../../middleware/teacherAuth");
const { requireStudent } = require("../../middleware/studentAuth");
const {
    requireClassTeacher,
    requireOwnClass,
    requireStudentOwnClass
} = require("../../middleware/classTeacherAuth");

const router = express.Router();

router.get(
    "/class/:classId",
    requireTeacher,
    requireClassTeacher,
    requireOwnClass,
    controller.getStudentsByClass
);

router.get(
    "/:id",
    requireTeacher,
    requireClassTeacher,
    requireStudentOwnClass,
    controller.getStudentById
);

router.post(
    "/",
    requireTeacher,
    requireClassTeacher,
    requireOwnClass,
    controller.createStudent
);

router.put(
    "/:id",
    requireTeacher,
    requireClassTeacher,
    requireStudentOwnClass,
    controller.updateStudent
);

router.patch(
    "/:id/status",
    requireTeacher,
    requireClassTeacher,
    requireStudentOwnClass,
    controller.updateStudentStatus
);

router.patch(
    "/:id/password",
    requireTeacher,
    requireClassTeacher,
    requireStudentOwnClass,
    controller.updateStudentPassword
);

router.delete(
    "/:id",
    requireTeacher,
    requireClassTeacher,
    requireStudentOwnClass,
    controller.deleteStudent
);


router.get("/profile", requireStudent, controller.getOwnProfile);
router.put("/profile", requireStudent, controller.updateOwnProfile);
router.patch("/profile/password", requireStudent, controller.changeOwnPassword);

router.post(
    "/profile/photo",
    requireStudent,
    studentUpload.single("photo"),
    controller.uploadOwnPhoto
);

module.exports = router;
