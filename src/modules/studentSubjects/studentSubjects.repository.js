const pool = require("../../config/database");

async function findById(id) {
    const result = await pool.query(
        `SELECT
            scs.id,
            scs.student_id,
            scs.class_id,
            scs.subject_id,
            scs.is_active,
            scs.created_at,
            scs.updated_at,
            st.student_code,
            st.student_name,
            c.class_name,
            c.class_code,
            s.subject_name
         FROM student_class_subjects scs
         JOIN students st ON st.id = scs.student_id
         JOIN classes c ON c.id = scs.class_id
         JOIN subjects s ON s.id = scs.subject_id
         WHERE scs.id = $1`,
        [id]
    );

    return result.rows[0] || null;
}

async function findByStudent(studentId) {
    const result = await pool.query(
        `SELECT
            scs.id,
            scs.student_id,
            scs.class_id,
            scs.subject_id,
            scs.is_active,
            scs.created_at,
            scs.updated_at,
            s.subject_name
         FROM student_class_subjects scs
         JOIN subjects s ON s.id = scs.subject_id
         WHERE scs.student_id = $1
         ORDER BY s.subject_name ASC`,
        [studentId]
    );

    return result.rows;
}

async function findExisting(studentId, subjectId) {
    const result = await pool.query(
        `SELECT
            id,
            student_id,
            class_id,
            subject_id,
            is_active,
            created_at,
            updated_at
         FROM student_class_subjects
         WHERE student_id = $1
           AND subject_id = $2`,
        [studentId, subjectId]
    );

    return result.rows[0] || null;
}

async function createAssignment({
    id,
    studentId,
    classId,
    subjectId,
    createdAt
}) {
    const result = await pool.query(
        `INSERT INTO student_class_subjects (
            id,
            student_id,
            class_id,
            subject_id,
            is_active,
            created_at,
            updated_at
        )
        VALUES ($1, $2, $3, $4, TRUE, $5, $5)
        RETURNING
            id,
            student_id,
            class_id,
            subject_id,
            is_active,
            created_at,
            updated_at`,
        [
            id,
            studentId,
            classId,
            subjectId,
            createdAt
        ]
    );

    return result.rows[0];
}

async function updateStatus(id, isActive, updatedAt) {
    const result = await pool.query(
        `UPDATE student_class_subjects
         SET is_active = $2,
             updated_at = $3
         WHERE id = $1
         RETURNING
            id,
            student_id,
            class_id,
            subject_id,
            is_active,
            created_at,
            updated_at`,
        [id, isActive, updatedAt]
    );

    return result.rows[0] || null;
}

async function deleteAssignment(id) {
    const result = await pool.query(
        `DELETE FROM student_class_subjects
         WHERE id = $1
         RETURNING id`,
        [id]
    );

    return result.rows[0] || null;
}

module.exports = {
    findById,
    findByStudent,
    findExisting,
    createAssignment,
    updateStatus,
    deleteAssignment
};
