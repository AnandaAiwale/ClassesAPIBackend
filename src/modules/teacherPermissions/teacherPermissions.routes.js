const express = require("express");
const controller = require("./teacherPermissions.controller");
const { requireAdmin } = require("../../middleware/adminAuth");

const router = express.Router();

router.get(
    "/:teacherId",
    requireAdmin,
    controller.getPermissions
);

router.put(
    "/:teacherId",
    requireAdmin,
    controller.updatePermissions
);

router.delete(
    "/:teacherId",
    requireAdmin,
    controller.deletePermissions
);

module.exports = router;
