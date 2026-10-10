const pool = require("../../config/database");

async function findStudentProfile(studentId) {
    const result = await pool.query(
        `SELECT
            s.id,
            s.student_code,
            s.student_name,
            s.parent_name,
            s.mobile,
            s.roll_number,
            s.username,
            s.photo_url,
            s.is_active,
            s.class_id,
            c.class_name,
            c.class_code,
            s.created_at,
            s.updated_at
         FROM students s
         JOIN classes c ON c.id = s.class_id
         WHERE s.id = $1`,
        [studentId]
    );

    return result.rows[0] || null;
}

async function findStudentSubjects(studentId) {
    const result = await pool.query(
        `SELECT
            scs.id,
            scs.student_id,
            scs.class_id,
            scs.subject_id,
            scs.is_active,
            s.subject_name
         FROM student_class_subjects scs
         JOIN subjects s ON s.id = scs.subject_id
         WHERE scs.student_id = $1
           AND scs.is_active = TRUE
           AND s.is_active = TRUE
         ORDER BY s.subject_name ASC`,
        [studentId]
    );

    return result.rows;
}

async function findStudentHomework(studentId) {
    const result = await pool.query(
        `SELECT
            h.id,
            h.teacher_id,
            h.class_id,
            h.subject_id,
            h.homework_date,
            h.homework_text,
            h.published,
            h.created_at,
            h.updated_at,
            s.subject_name,
            t.name AS teacher_name
         FROM students st
         JOIN student_class_subjects scs
           ON scs.student_id = st.id
          AND scs.is_active = TRUE
         JOIN homework h
           ON h.class_id = st.class_id
          AND h.subject_id = scs.subject_id
          AND h.published = TRUE
         JOIN subjects s
           ON s.id = h.subject_id
         JOIN teachers t
           ON t.id = h.teacher_id
         WHERE st.id = $1
           AND st.is_active = TRUE
         ORDER BY h.homework_date DESC, h.created_at DESC`,
        [studentId]
    );

    return result.rows;
}

async function findStudentAttendance(studentId) {
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

module.exports = {
    findStudentProfile,
    findStudentSubjects,
    findStudentHomework,
    findStudentAttendance
};
