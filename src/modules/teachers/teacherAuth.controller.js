const teacherAuthService = require("./teacherAuth.service");

async function login(req, res) {
    try {
        const { teacherCode, password, classCode } = req.body;

        const result = await teacherAuthService.login({
            teacherCode,
            password,
            classCode
        });

        return res.status(200).json({
            success: true,
            message: "Teacher login successful",
            data: result
        });
    } catch (error) {
        console.error("Teacher login error:", error);

        return res.status(401).json({
            success: false,
            message: error.message || "Teacher login failed"
        });
    }
}

module.exports = {
    login
};
