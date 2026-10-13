const bcrypt = require("bcryptjs");
const teachersRepository = require("./teachers.repository");
const teacherAssignmentsRepository = require("../teacherAssignments/teacherAssignments.repository");
const { generateToken } = require("../../utils/jwt");

function buildTeacherPayload(teacher) {
    return {
        id: teacher.id,
        teacherCode: teacher.teacher_code,
        name: teacher.name,
        email: teacher.email,
        mobile: teacher.mobile
    };
}

function groupAssignmentsByClass(assignments) {
    const byClass = new Map();

    for (const row of assignments) {
        if (!row.is_active) {
            continue;
        }

        if (!byClass.has(row.class_id)) {
            byClass.set(row.class_id, {
                id: row.class_id,
                className: row.class_name,
                classCode: row.class_code,
                isClassTeacher: false,
                subjects: []
            });
        }

        const group = byClass.get(row.class_id);

        if (row.is_class_teacher) {
            group.isClassTeacher = true;
        }

        group.subjects.push({
            assignmentId: row.id,
            id: row.subject_id,
            subjectName: row.subject_name
        });
    }

    return Array.from(byClass.values()).sort((left, right) =>
        String(left.className).localeCompare(String(right.className))
    );
}

async function verifyTeacherPassword(teacher, password) {
    if (!teacher || !teacher.is_active) {
        throw new Error("Invalid credentials");
    }

    const passwordValid = await bcrypt.compare(
        password,
        teacher.password_hash
    );

    if (!passwordValid) {
        throw new Error("Invalid credentials");
    }

    return teacher;
}

async function loginWithEmail({ email, password }) {
    if (!email || !password) {
        throw new Error("Email and password are required");
    }

    const teacher = await teachersRepository.findByEmail(
        String(email).trim()
    );

    try {
        await verifyTeacherPassword(teacher, password);
    } catch (error) {
        throw new Error("Invalid email or password");
    }

    const assignments =
        await teacherAssignmentsRepository.findByTeacher(teacher.id);
    const classes = groupAssignmentsByClass(assignments);

    if (classes.length === 0) {
        throw new Error("No class assignments found for this teacher");
    }

    const token = generateToken({
        id: teacher.id,
        role: "teacher",
        teacherCode: teacher.teacher_code,
        email: teacher.email
    });

    return {
        token,
        teacher: buildTeacherPayload(teacher),
        classes
    };
}

async function login({ teacherCode, password, classCode }) {
    if (!teacherCode || !password || !classCode) {
        throw new Error("Teacher Code, Password and Class Code are required");
    }

    const teacher = await teachersRepository.findByTeacherCode(
        teacherCode.trim()
    );

    try {
        await verifyTeacherPassword(teacher, password);
    } catch (error) {
        throw new Error("Invalid Teacher Code or Password");
    }

    const assignments =
        await teacherAssignmentsRepository.findByTeacher(teacher.id);

    const classAssignment = assignments.find(
        (item) =>
            item.class_code &&
            item.class_code.toUpperCase() === classCode.trim().toUpperCase() &&
            item.is_active
    );

    if (!classAssignment) {
        throw new Error("Teacher is not assigned to this Class Code");
    }

    const token = generateToken({
        id: teacher.id,
        role: "teacher",
        teacherCode: teacher.teacher_code,
        classId: classAssignment.class_id
    });

    return {
        token,
        teacher: buildTeacherPayload(teacher),
        class: {
            id: classAssignment.class_id,
            className: classAssignment.class_name,
            classCode: classAssignment.class_code
        }
    };
}

async function loginFromRequest({ email, teacherCode, password, classCode }) {
    const normalizedEmail = String(email || "").trim();
    const normalizedTeacherCode = String(teacherCode || "").trim();
    const normalizedClassCode = String(classCode || "").trim();

    if (normalizedEmail) {
        if (normalizedClassCode || normalizedTeacherCode) {
            const error = new Error(
                "Use either email and password, or teacher code with class code"
            );
            error.statusCode = 400;
            throw error;
        }

        return loginWithEmail({ email: normalizedEmail, password });
    }

    return login({
        teacherCode: normalizedTeacherCode,
        password,
        classCode: normalizedClassCode
    });
}

module.exports = {
    login,
    loginWithEmail,
    loginFromRequest,
    groupAssignmentsByClass
};
