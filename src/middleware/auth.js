const pool = require("../config/database");
const { verifyToken } = require("../utils/jwt");

async function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Access token required"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const user = verifyToken(token);

        if (!user.id || !user.role) {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        const tableMap = {
            admin: "admins",
            teacher: "teachers",
            student: "students"
        };

        const table = tableMap[user.role];

        if (!table) {
            return res.status(401).json({
                success: false,
                message: "Invalid token role"
            });
        }

        const selectFields = user.role === "admin"
            ? "id, is_active, deletion_scheduled_at"
            : "id, is_active";

        const result = await pool.query(
            `SELECT ${selectFields}
             FROM ${table}
             WHERE id = $1
             LIMIT 1`,
            [user.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Account not found"
            });
        }

        if (!result.rows[0].is_active) {
            return res.status(403).json({
                success: false,
                message: "Account is inactive"
            });
        }

        if (
            user.role === "admin" &&
            result.rows[0].deletion_scheduled_at !== null &&
            result.rows[0].deletion_scheduled_at !== undefined
        ) {
            return res.status(403).json({
                success: false,
                message: "Admin account is pending deletion"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication error:", error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}

module.exports = {
    authenticateToken
};
