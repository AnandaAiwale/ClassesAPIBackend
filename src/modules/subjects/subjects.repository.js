const pool = require("../../config/database");

async function findAll() {
    const result = await pool.query(
        `SELECT
            id,
            subject_name,
            is_active,
            created_at,
            updated_at
         FROM subjects
         ORDER BY subject_name ASC`
    );

    return result.rows;
}

async function findById(id) {
    const result = await pool.query(
        `SELECT
            id,
            subject_name,
            is_active,
            created_at,
            updated_at
         FROM subjects
         WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
}

async function findByName(subjectName) {
    const result = await pool.query(
        `SELECT
            id,
            subject_name,
            is_active,
            created_at,
            updated_at
         FROM subjects
         WHERE LOWER(subject_name) = LOWER($1)`,
        [subjectName]
    );

    return result.rows[0] || null;
}

async function createSubject({
    id,
    subjectName,
    createdAt
}) {
    const result = await pool.query(
        `INSERT INTO subjects (
            id,
            subject_name,
            is_active,
            created_at,
            updated_at
        )
        VALUES ($1, $2, TRUE, $3, $3)
        RETURNING
            id,
            subject_name,
            is_active,
            created_at,
            updated_at`,
        [
            id,
            subjectName,
            createdAt
        ]
    );

    return result.rows[0];
}

async function updateSubject({
    id,
    subjectName,
    updatedAt
}) {
    const result = await pool.query(
        `UPDATE subjects
         SET
            subject_name = $2,
            updated_at = $3
         WHERE id = $1
         RETURNING
            id,
            subject_name,
            is_active,
            created_at,
            updated_at`,
        [
            id,
            subjectName,
            updatedAt
        ]
    );

    return result.rows[0] || null;
}

async function updateStatus(id, isActive, updatedAt) {
    const result = await pool.query(
        `UPDATE subjects
         SET
            is_active = $2,
            updated_at = $3
         WHERE id = $1
         RETURNING
            id,
            subject_name,
            is_active,
            created_at,
            updated_at`,
        [
            id,
            isActive,
            updatedAt
        ]
    );

    return result.rows[0] || null;
}

async function deleteSubject(id) {
    const result = await pool.query(
        `DELETE FROM subjects
         WHERE id = $1
         RETURNING id`,
        [id]
    );

    return result.rows[0] || null;
}

module.exports = {
    findAll,
    findById,
    findByName,
    createSubject,
    updateSubject,
    updateStatus,
    deleteSubject
};
