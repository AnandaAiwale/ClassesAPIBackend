const pool = require("../../config/database");

const RETURNING_FIELDS = `
    id,
    admin_id,
    class_name,
    class_code,
    class_teacher_id,
    is_active,
    created_at,
    updated_at
`;

async function findAll(adminId) {
    const result = await pool.query(
        `SELECT ${RETURNING_FIELDS}
         FROM classes
         WHERE admin_id = $1
         ORDER BY class_name ASC`,
        [adminId]
    );
    return result.rows;
}

async function findById(id, adminId) {
    const result = await pool.query(
        `SELECT ${RETURNING_FIELDS}
         FROM classes
         WHERE id = $1 AND admin_id = $2`,
        [id, adminId]
    );
    return result.rows[0] || null;
}

async function findByCode(classCode) {
    const result = await pool.query(
        `SELECT ${RETURNING_FIELDS}
         FROM classes
         WHERE class_code = $1`,
        [classCode]
    );
    return result.rows[0] || null;
}

async function createClass({
    id,
    adminId,
    className,
    classCode,
    classTeacherId,
    createdAt
}) {
    const result = await pool.query(
        `INSERT INTO classes (
            id, admin_id, class_name, class_code,
            class_teacher_id, is_active, created_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, TRUE, $6, $6)
         RETURNING ${RETURNING_FIELDS}`,
        [
            id,
            adminId,
            className,
            classCode,
            classTeacherId || null,
            createdAt
        ]
    );
    return result.rows[0];
}

async function updateClass({
    id,
    adminId,
    className,
    classCode,
    classTeacherId,
    updatedAt
}) {
    const result = await pool.query(
        `UPDATE classes
         SET class_name = $3,
             class_code = $4,
             class_teacher_id = $5,
             updated_at = $6
         WHERE id = $1 AND admin_id = $2
         RETURNING ${RETURNING_FIELDS}`,
        [
            id,
            adminId,
            className,
            classCode,
            classTeacherId || null,
            updatedAt
        ]
    );
    return result.rows[0] || null;
}

async function updateStatus(id, adminId, isActive, updatedAt) {
    const result = await pool.query(
        `UPDATE classes
         SET is_active = $3, updated_at = $4
         WHERE id = $1 AND admin_id = $2
         RETURNING ${RETURNING_FIELDS}`,
        [id, adminId, isActive, updatedAt]
    );
    return result.rows[0] || null;
}

async function deleteClass(id, adminId) {
    const result = await pool.query(
        `DELETE FROM classes
         WHERE id = $1 AND admin_id = $2
         RETURNING id`,
        [id, adminId]
    );
    return result.rows[0] || null;
}

module.exports = {
    findAll,
    findById,
    findByCode,
    createClass,
    updateClass,
    updateStatus,
    deleteClass
};
