const teacherAuthService = require("./teacherAuth.service");

async function login(req, res) {
    try {
        const { email, teacherCode, password, classCode } = req.body || {};

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required"
            });
        }

        const result = await teacherAuthService.loginFromRequest({
            email,
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

        return res.status(error.statusCode || 401).json({
            success: false,
            message: error.message || "Teacher login failed"
        });
    }
}

module.exports = {
    login
};
