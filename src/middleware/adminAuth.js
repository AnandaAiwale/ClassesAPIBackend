const { authenticateToken } = require("./auth");

function requireAdmin(req, res, next) {
    authenticateToken(req, res, () => {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });
        }

        next();
    });
}

module.exports = {
    requireAdmin
};
