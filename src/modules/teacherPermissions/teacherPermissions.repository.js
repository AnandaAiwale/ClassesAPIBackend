const pool = require("../../config/database");

async function findByTeacherId(teacherId) {
    const result = await pool.query(
        `SELECT
            id,
            teacher_id,
            homework_enabled,
            attendance_enabled,
            reports_enabled,
            is_active,
            created_at,
            updated_at
         FROM teacher_permissions
         WHERE teacher_id = $1`,
        [teacherId]
    );

    return result.rows[0] || null;
}

async function createPermissions({
    id,
    teacherId,
    homeworkEnabled,
    attendanceEnabled,
    reportsEnabled,
    createdAt
}) {
    const result = await pool.query(
        `INSERT INTO teacher_permissions (
            id,
            teacher_id,
            homework_enabled,
            attendance_enabled,
            reports_enabled,
            is_active,
            created_at,
            updated_at
        )
        VALUES ($1, $2, $3, $4, $5, TRUE, $6, $6)
        RETURNING
            id,
            teacher_id,
            homework_enabled,
            attendance_enabled,
            reports_enabled,
            is_active,
            created_at,
            updated_at`,
        [
            id,
            teacherId,
            homeworkEnabled,
            attendanceEnabled,
            reportsEnabled,
            createdAt
        ]
    );

    return result.rows[0];
}

async function updatePermissions({
    teacherId,
    homeworkEnabled,
    attendanceEnabled,
    reportsEnabled,
    isActive,
    updatedAt
}) {
    const result = await pool.query(
        `UPDATE teacher_permissions
         SET homework_enabled = $2,
             attendance_enabled = $3,
             reports_enabled = $4,
             is_active = $5,
             updated_at = $6
         WHERE teacher_id = $1
         RETURNING
            id,
            teacher_id,
            homework_enabled,
            attendance_enabled,
            reports_enabled,
            is_active,
            created_at,
            updated_at`,
        [
            teacherId,
            homeworkEnabled,
            attendanceEnabled,
            reportsEnabled,
            isActive,
            updatedAt
        ]
    );

    return result.rows[0] || null;
}

async function deletePermissions(teacherId) {
    const result = await pool.query(
        `DELETE FROM teacher_permissions
         WHERE teacher_id = $1
         RETURNING id`,
        [teacherId]
    );

    return result.rows[0] || null;
}

module.exports = {
    findByTeacherId,
    createPermissions,
    updatePermissions,
    deletePermissions
};
