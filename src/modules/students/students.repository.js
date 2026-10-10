const pool = require("../../config/database");

async function findAllByClass(classId) {
    const result = await pool.query(
        `SELECT
            id,
            class_id,
            student_code,
            student_name,
            parent_name,
            mobile,
            roll_number,
            username,
            photo_url,
            is_active,
            created_at,
            updated_at
         FROM students
         WHERE class_id = $1
         ORDER BY roll_number ASC`,
        [classId]
    );

    return result.rows;
}

async function findById(id) {
    const result = await pool.query(
        `SELECT
            id,
            class_id,
            student_code,
            student_name,
            parent_name,
            mobile,
            roll_number,
            username,
            password_hash,
            photo_url,
            is_active,
            created_at,
            updated_at
         FROM students
         WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
}

async function findByUsername(username) {
    const result = await pool.query(
        `SELECT
            id,
            class_id,
            student_code,
            student_name,
            parent_name,
            mobile,
            roll_number,
            username,
            password_hash,
            photo_url,
            is_active,
            created_at,
            updated_at
         FROM students
         WHERE LOWER(username) = LOWER($1)`,
        [username]
    );

    return result.rows[0] || null;
}

async function findByStudentCode(studentCode) {
    const result = await pool.query(
        `SELECT
            id,
            class_id,
            student_code,
            student_name,
            parent_name,
            mobile,
            roll_number,
            username,
            password_hash,
            photo_url,
            is_active,
            created_at,
            updated_at
         FROM students
         WHERE UPPER(student_code) = UPPER($1)`,
        [studentCode]
    );

    return result.rows[0] || null;
}

async function findByUsernameOrStudentCode(username, studentCode) {
    const result = await pool.query(
        `SELECT
            id,
            class_id,
            student_code,
            student_name,
            parent_name,
            mobile,
            roll_number,
            username,
            password_hash,
            photo_url,
            is_active,
            created_at,
            updated_at
         FROM students
         WHERE LOWER(username) = LOWER($1)
            OR UPPER(student_code) = UPPER($2)
         LIMIT 1`,
        [username, studentCode]
    );

    return result.rows[0] || null;
}

async function findByClassAndRollNumber(classId, rollNumber) {
    const result = await pool.query(
        `SELECT id
         FROM students
         WHERE class_id = $1
           AND roll_number = $2`,
        [classId, rollNumber]
    );

    return result.rows[0] || null;
}

async function createStudent({
    id,
    classId,
    studentCode,
    studentName,
    parentName,
    mobile,
    rollNumber,
    username,
    passwordHash,
    photoUrl,
    createdAt
}) {
    const result = await pool.query(
        `INSERT INTO students (
            id,
            class_id,
            student_code,
            student_name,
            parent_name,
            mobile,
            roll_number,
            username,
            password_hash,
            photo_url,
            is_active,
            created_at,
            updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE, $11, $11)
        RETURNING
            id,
            class_id,
            student_code,
            student_name,
            parent_name,
            mobile,
            roll_number,
            username,
            photo_url,
            is_active,
            created_at,
            updated_at`,
        [
            id,
            classId,
            studentCode,
            studentName,
            parentName,
            mobile,
            rollNumber,
            username,
            passwordHash,
            photoUrl,
            createdAt
        ]
    );

    return result.rows[0];
}

async function updateStudent({
    id,
    studentName,
    parentName,
    mobile,
    rollNumber,
    username,
    photoUrl,
    updatedAt
}) {
    const result = await pool.query(
        `UPDATE students
         SET student_name = $2,
             parent_name = $3,
             mobile = $4,
             roll_number = $5,
             username = $6,
             photo_url = $7,
             updated_at = $8
         WHERE id = $1
         RETURNING
            id,
            class_id,
            student_code,
            student_name,
            parent_name,
            mobile,
            roll_number,
            username,
            photo_url,
            is_active,
            created_at,
            updated_at`,
        [
            id,
            studentName,
            parentName,
            mobile,
            rollNumber,
            username,
            photoUrl,
            updatedAt
        ]
    );

    return result.rows[0] || null;
}

async function updateStatus(id, isActive, updatedAt) {
    const result = await pool.query(
        `UPDATE students
         SET is_active = $2,
             updated_at = $3
         WHERE id = $1
         RETURNING
            id,
            class_id,
            student_code,
            student_name,
            parent_name,
            mobile,
            roll_number,
            username,
            photo_url,
            is_active,
            created_at,
            updated_at`,
        [id, isActive, updatedAt]
    );

    return result.rows[0] || null;
}

async function updatePassword(id, passwordHash, updatedAt) {
    const result = await pool.query(
        `UPDATE students
         SET password_hash = $2,
             updated_at = $3
         WHERE id = $1
         RETURNING
            id,
            class_id,
            student_code,
            student_name,
            parent_name,
            mobile,
            roll_number,
            username,
            photo_url,
            is_active,
            created_at,
            updated_at`,
        [id, passwordHash, updatedAt]
    );

    return result.rows[0] || null;
}

async function deleteStudent(id) {
    const result = await pool.query(
        `DELETE FROM students
         WHERE id = $1
         RETURNING id`,
        [id]
    );

    return result.rows[0] || null;
}


async function updateOwnProfile({ id, studentName, parentName, mobile, photoUrl, updatedAt }) {
    const result = await pool.query(
        `UPDATE students
         SET student_name = $1,
             parent_name = $2,
             mobile = $3,
             photo_url = $4,
             updated_at = $5
         WHERE id = $6
         RETURNING
             id,
             class_id,
             student_code,
             student_name,
             parent_name,
             mobile,
             roll_number,
             username,
             photo_url,
             is_active,
             created_at,
             updated_at`,
        [
            studentName,
            parentName,
            mobile,
            photoUrl,
            updatedAt,
            id
        ]
    );

    return result.rows[0] || null;
}

async function updateOwnPassword({ id, passwordHash, updatedAt }) {
    const result = await pool.query(
        `UPDATE students
         SET password_hash = $1,
             updated_at = $2
         WHERE id = $3
         RETURNING id`,
        [passwordHash, updatedAt, id]
    );

    return result.rows[0] || null;
}

module.exports = {
    updateOwnProfile,
    updateOwnPassword,
    findAllByClass,
    findById,
    findByUsername,
    findByStudentCode,
    findByUsernameOrStudentCode,
    findByClassAndRollNumber,
    createStudent,
    updateStudent,
    updateStatus,
    updatePassword,
    deleteStudent
};
