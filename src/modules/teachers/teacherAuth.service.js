const bcrypt = require("bcryptjs");
const teachersRepository = require("./teachers.repository");
const teacherAssignmentsRepository = require("../teacherAssignments/teacherAssignments.repository");
const { generateToken } = require("../../utils/jwt");

async function login({ teacherCode, password, classCode }) {
    if (!teacherCode || !password || !classCode) {
        throw new Error("Teacher Code, Password and Class Code are required");
    }

    const teacher = await teachersRepository.findByTeacherCode(
        teacherCode.trim()
    );

    if (!teacher || !teacher.is_active) {
        throw new Error("Invalid Teacher Code or Password");
    }

    const passwordValid = await bcrypt.compare(
        password,
        teacher.password_hash
    );

    if (!passwordValid) {
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
        teacher: {
            id: teacher.id,
            teacherCode: teacher.teacher_code,
            name: teacher.name,
            email: teacher.email,
            mobile: teacher.mobile
        },
        class: {
            id: classAssignment.class_id,
            className: classAssignment.class_name,
            classCode: classAssignment.class_code
        }
    };
}

module.exports = {
    login
};
