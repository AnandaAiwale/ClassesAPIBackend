const pool = require("../config/database");

async function getClassTeacherClasses(teacherId) {
    const result = await pool.query(
        `SELECT DISTINCT ON (tcs.class_id)
            tcs.class_id,
            c.class_name,
            c.class_code
         FROM teacher_class_subjects tcs
         JOIN classes c ON c.id = tcs.class_id
         WHERE tcs.teacher_id = $1
           AND tcs.is_class_teacher = TRUE
           AND tcs.is_active = TRUE
         ORDER BY tcs.class_id, c.class_name ASC`,
        [teacherId]
    );

    return result.rows;
}

async function getClassTeacherClass(teacherId) {
    const classes = await getClassTeacherClasses(teacherId);
    return classes[0] || null;
}

function mapClassTeacher(row) {
    return {
        classId: row.class_id,
        className: row.class_name,
        classCode: row.class_code
    };
}

function teacherOwnsClass(req, classId) {
    if (!classId) {
        return false;
    }

    if (Array.isArray(req.classTeacherClasses)) {
        return req.classTeacherClasses.some(
            (item) => item.classId === classId
        );
    }

    return Boolean(
        req.classTeacher && req.classTeacher.classId === classId
    );
}

function requestedClassId(req) {
    return req.params.classId || req.body.classId || req.query.classId;
}

async function requireClassTeacher(req, res, next) {
    try {
        if (!req.user || req.user.role !== "teacher") {
            return res.status(403).json({
                success: false,
                message: "Class Teacher access required"
            });
        }

        const classTeacherClasses = await getClassTeacherClasses(
            req.user.id
        );

        if (classTeacherClasses.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Teacher is not assigned as a Class Teacher"
            });
        }

        req.classTeacherClasses = classTeacherClasses.map(mapClassTeacher);

        const classId = requestedClassId(req);

        if (classId) {
            const matched = classTeacherClasses.find(
                (row) => row.class_id === classId
            );

            if (!matched) {
                return res.status(403).json({
                    success: false,
                    message: "You can manage students only in your own class"
                });
            }

            req.classTeacher = mapClassTeacher(matched);
        } else {
            req.classTeacher = mapClassTeacher(classTeacherClasses[0]);
        }

        next();
    } catch (error) {
        console.error("Class Teacher authorization error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to verify Class Teacher access"
        });
    }
}

async function requireOwnClass(req, res, next) {
    try {
        if (!req.classTeacher && !req.classTeacherClasses) {
            return res.status(403).json({
                success: false,
                message: "Class Teacher authorization required"
            });
        }

        const classId = requestedClassId(req);

        if (!classId) {
            return res.status(400).json({
                success: false,
                message: "classId is required"
            });
        }

        if (!teacherOwnsClass(req, classId)) {
            return res.status(403).json({
                success: false,
                message: "You can manage students only in your own class"
            });
        }

        next();
    } catch (error) {
        console.error("Own class authorization error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to verify class access"
        });
    }
}

async function requireStudentOwnClass(req, res, next) {
    try {
        if (!req.classTeacher && !req.classTeacherClasses) {
            return res.status(403).json({
                success: false,
                message: "Class Teacher authorization required"
            });
        }

        const studentId = req.params.id;

        if (!studentId) {
            return next();
        }

        const result = await pool.query(
            `SELECT class_id
             FROM students
             WHERE id = $1`,
            [studentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        if (!teacherOwnsClass(req, result.rows[0].class_id)) {
            return res.status(403).json({
                success: false,
                message: "You can manage students only in your own class"
            });
        }

        next();
    } catch (error) {
        console.error("Student class authorization error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to verify student class access"
        });
    }
}

async function requireStudentSubjectAssignmentOwnClass(req, res, next) {
    try {
        if (!req.classTeacher && !req.classTeacherClasses) {
            return res.status(403).json({
                success: false,
                message: "Class Teacher authorization required"
            });
        }

        const assignmentId = req.params.id;

        if (!assignmentId) {
            return res.status(400).json({
                success: false,
                message: "Assignment id is required"
            });
        }

        const result = await pool.query(
            `SELECT s.class_id
             FROM student_class_subjects scs
             JOIN students s ON s.id = scs.student_id
             WHERE scs.id = $1`,
            [assignmentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student subject assignment not found"
            });
        }

        if (!teacherOwnsClass(req, result.rows[0].class_id)) {
            return res.status(403).json({
                success: false,
                message: "You can manage student subjects only in your own class"
            });
        }

        next();
    } catch (error) {
        console.error(
            "Student subject assignment authorization error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to verify student subject access"
        });
    }
}

async function requireStudentSubjectCreateOwnClass(req, res, next) {
    try {
        if (!req.classTeacher && !req.classTeacherClasses) {
            return res.status(403).json({
                success: false,
                message: "Class Teacher authorization required"
            });
        }

        const studentId = req.body.studentId;

        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: "studentId is required"
            });
        }

        const result = await pool.query(
            `SELECT class_id
             FROM students
             WHERE id = $1`,
            [studentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        if (!teacherOwnsClass(req, result.rows[0].class_id)) {
            return res.status(403).json({
                success: false,
                message: "You can assign subjects only to students in your own class"
            });
        }

        next();
    } catch (error) {
        console.error(
            "Student subject create authorization error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to verify student class access"
        });
    }
}

async function requireAttendanceOwnClass(req, res, next) {
    try {
        if (!req.classTeacher && !req.classTeacherClasses) {
            return res.status(403).json({
                success: false,
                message: "Class Teacher authorization required"
            });
        }

        let classId = null;

        if (req.params.studentId) {
            const result = await pool.query(
                `SELECT class_id
                 FROM students
                 WHERE id = $1`,
                [req.params.studentId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Student not found"
                });
            }

            classId = result.rows[0].class_id;
        } else if (req.params.id) {
            const result = await pool.query(
                `SELECT class_id
                 FROM attendance
                 WHERE id = $1`,
                [req.params.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Attendance record not found"
                });
            }

            classId = result.rows[0].class_id;
        } else {
            classId = requestedClassId(req);
        }

        if (!teacherOwnsClass(req, classId)) {
            return res.status(403).json({
                success: false,
                message: "You can access attendance only for your own class"
            });
        }

        next();
    } catch (error) {
        console.error("Attendance authorization error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to verify attendance access"
        });
    }
}

module.exports = {
    requireStudentSubjectCreateOwnClass,
    requireClassTeacher,
    requireOwnClass,
    requireStudentOwnClass,
    requireStudentSubjectAssignmentOwnClass,
    requireAttendanceOwnClass,
    getClassTeacherClass,
    getClassTeacherClasses
};
