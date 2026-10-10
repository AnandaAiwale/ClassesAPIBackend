const pool = require("../../config/database");

async function findById(id) {
    const result = await pool.query(
        `SELECT
            tcs.id,
            tcs.teacher_id,
            tcs.class_id,
            tcs.subject_id,
            tcs.is_class_teacher,
            tcs.is_active,
            tcs.created_at,
            tcs.updated_at,
            t.teacher_code,
            t.name AS teacher_name,
            c.class_name,
            c.class_code,
            s.subject_name
         FROM teacher_class_subjects tcs
         JOIN teachers t ON t.id = tcs.teacher_id
         JOIN classes c ON c.id = tcs.class_id
         JOIN subjects s ON s.id = tcs.subject_id
         WHERE tcs.id = $1`,
        [id]
    );

    return result.rows[0] || null;
}

async function findByTeacher(teacherId) {
    const result = await pool.query(
        `SELECT
            tcs.id,
            tcs.teacher_id,
            tcs.class_id,
            tcs.subject_id,
            tcs.is_class_teacher,
            tcs.is_active,
            tcs.created_at,
            tcs.updated_at,
            c.class_name,
            c.class_code,
            s.subject_name
         FROM teacher_class_subjects tcs
         JOIN classes c ON c.id = tcs.class_id
         JOIN subjects s ON s.id = tcs.subject_id
         WHERE tcs.teacher_id = $1
         ORDER BY c.class_name ASC, s.subject_name ASC`,
        [teacherId]
    );

    return result.rows;
}

async function findByClass(classId) {
    const result = await pool.query(
        `SELECT
            tcs.id,
            tcs.teacher_id,
            tcs.class_id,
            tcs.subject_id,
            tcs.is_class_teacher,
            tcs.is_active,
            tcs.created_at,
            tcs.updated_at,
            t.teacher_code,
            t.name AS teacher_name,
            s.subject_name
         FROM teacher_class_subjects tcs
         JOIN teachers t ON t.id = tcs.teacher_id
         JOIN subjects s ON s.id = tcs.subject_id
         WHERE tcs.class_id = $1
         ORDER BY t.name ASC, s.subject_name ASC`,
        [classId]
    );

    return result.rows;
}

async function findExisting(teacherId, classId, subjectId) {
    const result = await pool.query(
        `SELECT
            id,
            teacher_id,
            class_id,
            subject_id,
            is_class_teacher,
            is_active,
            created_at,
            updated_at
         FROM teacher_class_subjects
         WHERE teacher_id = $1
           AND class_id = $2
           AND subject_id = $3`,
        [teacherId, classId, subjectId]
    );

    return result.rows[0] || null;
}

async function createAssignment({
    id,
    teacherId,
    classId,
    subjectId,
    isClassTeacher,
    createdAt
}) {
    const result = await pool.query(
        `INSERT INTO teacher_class_subjects (
            id,
            teacher_id,
            class_id,
            subject_id,
            is_class_teacher,
            is_active,
            created_at,
            updated_at
        )
        VALUES ($1, $2, $3, $4, $5, TRUE, $6, $6)
        RETURNING
            id,
            teacher_id,
            class_id,
            subject_id,
            is_class_teacher,
            is_active,
            created_at,
            updated_at`,
        [
            id,
            teacherId,
            classId,
            subjectId,
            isClassTeacher,
            createdAt
        ]
    );

    return result.rows[0];
}

async function updateAssignment({
    id,
    isClassTeacher,
    isActive,
    updatedAt
}) {
    const result = await pool.query(
        `UPDATE teacher_class_subjects
         SET is_class_teacher = $2,
             is_active = $3,
             updated_at = $4
         WHERE id = $1
         RETURNING
            id,
            teacher_id,
            class_id,
            subject_id,
            is_class_teacher,
            is_active,
            created_at,
            updated_at`,
        [
            id,
            isClassTeacher,
            isActive,
            updatedAt
        ]
    );

    return result.rows[0] || null;
}

async function deleteAssignment(id) {
    const result = await pool.query(
        `DELETE FROM teacher_class_subjects
         WHERE id = $1
         RETURNING id`,
        [id]
    );

    return result.rows[0] || null;
}

async function clearClassTeacher(classId, updatedAt) {
    await pool.query(
        `UPDATE teacher_class_subjects
         SET is_class_teacher = FALSE,
             updated_at = $2
         WHERE class_id = $1
           AND is_class_teacher = TRUE`,
        [classId, updatedAt]
    );
}

module.exports = {
    findById,
    findByTeacher,
    findByClass,
    findExisting,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    clearClassTeacher
};
