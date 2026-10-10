const pool = require("../../config/database");

async function findByDate(classId, attendanceDate) {
    const result = await pool.query(
        `SELECT
            a.id,
            a.student_id,
            a.class_id,
            a.attendance_date,
            a.status,
            a.created_at,
            a.updated_at,
            s.student_code,
            s.student_name,
            s.roll_number
         FROM attendance a
         JOIN students s ON s.id = a.student_id
         WHERE a.class_id = $1
           AND a.attendance_date = $2
         ORDER BY s.roll_number ASC`,
        [classId, attendanceDate]
    );

    return result.rows;
}

async function findByStudent(studentId) {
    const result = await pool.query(
        `SELECT
            a.id,
            a.student_id,
            a.class_id,
            a.attendance_date,
            a.status,
            a.created_at,
            a.updated_at
         FROM attendance a
         WHERE a.student_id = $1
         ORDER BY a.attendance_date DESC`,
        [studentId]
    );

    return result.rows;
}

async function findByStudentAndDate(studentId, attendanceDate) {
    const result = await pool.query(
        `SELECT
            id,
            student_id,
            class_id,
            attendance_date,
            status,
            created_at,
            updated_at
         FROM attendance
         WHERE student_id = $1
           AND attendance_date = $2`,
        [studentId, attendanceDate]
    );

    return result.rows[0] || null;
}

async function createAttendance({
    id,
    studentId,
    classId,
    attendanceDate,
    status,
    createdAt
}) {
    const result = await pool.query(
        `INSERT INTO attendance (
            id,
            student_id,
            class_id,
            attendance_date,
            status,
            created_at,
            updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $6)
        RETURNING
            id,
            student_id,
            class_id,
            attendance_date,
            status,
            created_at,
            updated_at`,
        [
            id,
            studentId,
            classId,
            attendanceDate,
            status,
            createdAt
        ]
    );

    return result.rows[0];
}

async function updateAttendance({
    id,
    status,
    updatedAt
}) {
    const result = await pool.query(
        `UPDATE attendance
         SET status = $2,
             updated_at = $3
         WHERE id = $1
         RETURNING
            id,
            student_id,
            class_id,
            attendance_date,
            status,
            created_at,
            updated_at`,
        [id, status, updatedAt]
    );

    return result.rows[0] || null;
}

module.exports = {
    findByDate,
    findByStudent,
    findByStudentAndDate,
    createAttendance,
    updateAttendance
};
