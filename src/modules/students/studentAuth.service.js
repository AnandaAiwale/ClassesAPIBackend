const bcrypt = require("bcryptjs");
const studentsRepository = require("./students.repository");
const { generateToken } = require("../../utils/jwt");

async function login({ username, password, studentCode }) {
    if (!username || !password || !studentCode) {
        throw new Error(
            "Username, Password and Student Code are required"
        );
    }

    const student =
        await studentsRepository.findByUsername(username.trim());

    if (!student || !student.is_active) {
        throw new Error("Invalid username or password");
    }

    const passwordValid = await bcrypt.compare(
        password,
        student.password_hash
    );

    if (!passwordValid) {
        throw new Error("Invalid username or password");
    }

    if (
        student.student_code.toUpperCase() !==
        studentCode.trim().toUpperCase()
    ) {
        throw new Error("Invalid Student Code");
    }

    const token = generateToken({
        id: student.id,
        role: "student",
        studentCode: student.student_code,
        classId: student.class_id
    });

    return {
        token,
        student: {
            id: student.id,
            studentCode: student.student_code,
            studentName: student.student_name,
            parentName: student.parent_name,
            mobile: student.mobile,
            username: student.username,
            photoUrl: student.photo_url,
            classId: student.class_id
        }
    };
}

module.exports = {
    login
};
