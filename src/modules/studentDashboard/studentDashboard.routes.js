const express = require("express");
const controller = require("./studentDashboard.controller");
const { requireStudent } = require("../../middleware/studentAuth");

const router = express.Router();

router.get(
    "/",
    requireStudent,
    controller.getDashboard
);

router.get(
    "/profile",
    requireStudent,
    controller.getProfile
);

router.get(
    "/subjects",
    requireStudent,
    controller.getSubjects
);

router.get(
    "/homework",
    requireStudent,
    controller.getHomework
);

router.get(
    "/attendance",
    requireStudent,
    controller.getAttendance
);

module.exports = router;
