const express = require("express");
const controller = require("./studentAuth.controller");

const router = express.Router();

router.post("/login", controller.login);

module.exports = router;
