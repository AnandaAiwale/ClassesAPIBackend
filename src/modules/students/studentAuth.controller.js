const studentAuthService = require("./studentAuth.service");

async function login(req, res) {
    try {
        const {
            username,
            password,
            studentCode
        } = req.body;

        const result = await studentAuthService.login({
            username,
            password,
            studentCode
        });

        return res.status(200).json({
            success: true,
            message: "Student login successful",
            data: result
        });
    } catch (error) {
        console.error("Student login error:", error);

        return res.status(401).json({
            success: false,
            message: error.message || "Student login failed"
        });
    }
}

module.exports = {
    login
};
