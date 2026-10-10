const { authenticateToken } = require("./auth");

function requireStudent(req, res, next) {
    authenticateToken(req, res, () => {
        if (req.user.role !== "student") {
            return res.status(403).json({
                success: false,
                message: "Student access required"
            });
        }

        next();
    });
}

module.exports = {
    requireStudent
};
