const pool = require("../../config/database");

async function getAttendanceByClass(classId, fromDate, toDate) {
    const result = await pool.query(
        `SELECT
            a.attendance_date,
            a.status,
            s.id AS student_id,
            s.student_code,
            s.student_name,
            s.roll_number,
            c.class_name,
            c.class_code
         FROM attendance a
         JOIN students s ON s.id = a.student_id
         JOIN classes c ON c.id = a.class_id
         WHERE a.class_id = $1
           AND a.attendance_date BETWEEN $2 AND $3
         ORDER BY a.attendance_date DESC, s.roll_number ASC`,
        [classId, fromDate, toDate]
    );

    return result.rows;
}

async function getAttendanceSummaryByClass(
    classId,
    fromDate,
    toDate
) {
    const result = await pool.query(
        `SELECT
            s.id AS student_id,
            s.student_code,
            s.student_name,
            s.roll_number,
            COUNT(a.id) AS total_days,
            COUNT(a.id) FILTER (
                WHERE a.status = 'PRESENT'
            ) AS present_days,
            COUNT(a.id) FILTER (
                WHERE a.status = 'ABSENT'
            ) AS absent_days
         FROM students s
         LEFT JOIN attendance a
           ON a.student_id = s.id
          AND a.class_id = $1
          AND a.attendance_date BETWEEN $2 AND $3
         WHERE s.class_id = $1
         GROUP BY
            s.id,
            s.student_code,
            s.student_name,
            s.roll_number
         ORDER BY s.roll_number ASC`,
        [classId, fromDate, toDate]
    );

    return result.rows;
}

async function getHomeworkByClass(
    classId,
    fromDate,
    toDate
) {
    const result = await pool.query(
        `SELECT
            h.id,
            h.homework_date,
            h.homework_text,
            h.published,
            t.id AS teacher_id,
            t.teacher_code,
            t.name AS teacher_name,
            s.id AS subject_id,
            s.subject_name,
            c.class_name,
            c.class_code
         FROM homework h
         JOIN teachers t ON t.id = h.teacher_id
         JOIN subjects s ON s.id = h.subject_id
         JOIN classes c ON c.id = h.class_id
         WHERE h.class_id = $1
           AND h.homework_date BETWEEN $2 AND $3
         ORDER BY h.homework_date DESC, s.subject_name ASC`,
        [classId, fromDate, toDate]
    );

    return result.rows;
}

async function getTeacherReport() {
    const result = await pool.query(
        `SELECT
            t.id,
            t.teacher_code,
            t.name,
            t.email,
            t.mobile,
            t.is_active,
            COUNT(DISTINCT tcs.class_id) AS class_count,
            COUNT(DISTINCT tcs.subject_id) AS subject_count,
            COUNT(DISTINCT tcs.id) AS assignment_count
         FROM teachers t
         LEFT JOIN teacher_class_subjects tcs
           ON tcs.teacher_id = t.id
          AND tcs.is_active = TRUE
         GROUP BY
            t.id,
            t.teacher_code,
            t.name,
            t.email,
            t.mobile,
            t.is_active
         ORDER BY t.name ASC`
    );

    return result.rows;
}

async function getStudentReport(classId) {
    const result = await pool.query(
        `SELECT
            s.id,
            s.student_code,
            s.student_name,
            s.parent_name,
            s.mobile,
            s.roll_number,
            s.username,
            s.is_active,
            c.class_name,
            c.class_code,
            COUNT(DISTINCT scs.subject_id) AS subject_count
         FROM students s
         JOIN classes c ON c.id = s.class_id
         LEFT JOIN student_class_subjects scs
           ON scs.student_id = s.id
          AND scs.is_active = TRUE
         WHERE s.class_id = $1
         GROUP BY
            s.id,
            s.student_code,
            s.student_name,
            s.parent_name,
            s.mobile,
            s.roll_number,
            s.username,
            s.is_active,
            c.class_name,
            c.class_code
         ORDER BY s.roll_number ASC`,
        [classId]
    );

    return result.rows;
}


async function getStudentAttendanceSummary(studentId) {
    const result = await pool.query(
        `SELECT
            COUNT(*) AS total_days,
            COUNT(*) FILTER (
                WHERE status = 'PRESENT'
            ) AS present_days,
            COUNT(*) FILTER (
                WHERE status = 'ABSENT'
            ) AS absent_days
         FROM attendance
         WHERE student_id = $1`,
        [studentId]
    );

    return result.rows[0];
}

async function getHomeworkSummary() {
    const result = await pool.query(
        `SELECT
            COUNT(*) AS total_homework,
            COUNT(*) FILTER (
                WHERE published = TRUE
            ) AS published_homework,
            COUNT(*) FILTER (
                WHERE published = FALSE
            ) AS unpublished_homework
         FROM homework`
    );

    return result.rows[0];
}

module.exports = {
    getAttendanceByClass,
    getAttendanceSummaryByClass,
    getHomeworkByClass,
    getTeacherReport,
    getStudentReport,
    getHomeworkSummary,
    getStudentAttendanceSummary
};
