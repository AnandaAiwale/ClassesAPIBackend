const { authenticateToken } = require("./auth");

function requireTeacher(req, res, next) {
    authenticateToken(req, res, () => {
        if (req.user.role !== "teacher") {
            return res.status(403).json({
                success: false,
                message: "Teacher access required"
            });
        }

        next();
    });
}


async function requireHomeworkOwnAssignment(req, res, next) {
    try {
        if (!req.user || req.user.role !== "teacher") {
            return res.status(403).json({
                success: false,
                message: "Teacher access required"
            });
        }

        const homeworkId = req.params.id;

        if (!homeworkId) {
            return res.status(400).json({
                success: false,
                message: "Homework id is required"
            });
        }

        const pool = require("../config/database");

        const result = await pool.query(
            `SELECT h.teacher_id, h.class_id, h.subject_id
             FROM homework h
             WHERE h.id = $1`,
            [homeworkId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Homework not found"
            });
        }

        const homework = result.rows[0];

        if (homework.teacher_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You can access only your own homework"
            });
        }

        const assignment = await pool.query(
            `SELECT id
             FROM teacher_class_subjects
             WHERE teacher_id = $1
               AND class_id = $2
               AND subject_id = $3
               AND is_active = TRUE
             LIMIT 1`,
            [
                req.user.id,
                homework.class_id,
                homework.subject_id
            ]
        );

        if (assignment.rows.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Teacher is not assigned to this class and subject"
            });
        }

        next();
    } catch (error) {
        console.error("Homework authorization error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to verify homework access"
        });
    }
}

module.exports = {
    requireHomeworkOwnAssignment,
    requireTeacher
};
