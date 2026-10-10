const crypto = require("crypto");

const repository = require("./teachers.repository");
const { hashPassword } = require("../../utils/password");

function createTeacherCode() {
    const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
    return `TCH${randomPart}`;
}

async function generateUniqueTeacherCode() {
    let teacherCode;

    do {
        teacherCode = createTeacherCode();
        const existingTeacher = await repository.findByTeacherCode(teacherCode);

        if (!existingTeacher) {
            return teacherCode;
        }
    } while (true);
}

async function getTeachers() {
    return repository.findAll();
}

async function getTeacherById(id) {
    const teacher = await repository.findById(id);

    if (!teacher) {
        const error = new Error("Teacher not found");
        error.statusCode = 404;
        throw error;
    }

    return teacher;
}

async function createTeacher({
    name,
    email,
    mobile = "",
    password
}) {
    const normalizedName = String(name || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedMobile = String(mobile || "").trim();

    const existingTeacher = await repository.findByEmail(normalizedEmail);

    if (existingTeacher) {
        const error = new Error("Teacher email already exists");
        error.statusCode = 409;
        throw error;
    }

    const teacherCode = await generateUniqueTeacherCode();
    const passwordHash = await hashPassword(password);

    return repository.createTeacher({
        id: crypto.randomUUID(),
        teacherCode,
        name: normalizedName,
        email: normalizedEmail,
        mobile: normalizedMobile,
        passwordHash,
        createdAt: Date.now()
    });
}

async function updateTeacher(
    id,
    {
        name,
        email,
        mobile = ""
    }
) {
    const existingTeacher = await repository.findById(id);

    if (!existingTeacher) {
        const error = new Error("Teacher not found");
        error.statusCode = 404;
        throw error;
    }

    const normalizedName = String(name || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedMobile = String(mobile || "").trim();

    const teacherWithEmail = await repository.findByEmail(normalizedEmail);

    if (teacherWithEmail && teacherWithEmail.id !== id) {
        const error = new Error("Teacher email already exists");
        error.statusCode = 409;
        throw error;
    }

    return repository.updateTeacher({
        id,
        name: normalizedName,
        email: normalizedEmail,
        mobile: normalizedMobile,
        updatedAt: Date.now()
    });
}

async function updateStatus(id, isActive) {
    const existingTeacher = await repository.findById(id);

    if (!existingTeacher) {
        const error = new Error("Teacher not found");
        error.statusCode = 404;
        throw error;
    }

    return repository.updateStatus(
        id,
        isActive,
        Date.now()
    );
}

async function updatePassword(id, password) {
    const existingTeacher = await repository.findById(id);

    if (!existingTeacher) {
        const error = new Error("Teacher not found");
        error.statusCode = 404;
        throw error;
    }

    const passwordHash = await hashPassword(password);

    return repository.updatePassword(
        id,
        passwordHash,
        Date.now()
    );
}

async function deleteTeacher(id) {
    const existingTeacher = await repository.findById(id);

    if (!existingTeacher) {
        const error = new Error("Teacher not found");
        error.statusCode = 404;
        throw error;
    }

    return repository.deleteTeacher(id);
}


async function getOwnProfile(teacherId) {
    const teacher = await teachersRepository.findById(teacherId);

    if (!teacher || !teacher.is_active) {
        throw new Error("Teacher not found");
    }

    const assignments =
        await teacherAssignmentsRepository.findByTeacher(teacherId);

    return {
        id: teacher.id,
        teacherCode: teacher.teacher_code,
        name: teacher.name,
        email: teacher.email,
        mobile: teacher.mobile,
        isActive: teacher.is_active,
        createdAt: teacher.created_at,
        updatedAt: teacher.updated_at,
        assignments: assignments
            .filter((item) => item.is_active)
            .map((item) => ({
                assignmentId: item.id,
                classId: item.class_id,
                className: item.class_name,
                classCode: item.class_code,
                subjectId: item.subject_id,
                subjectName: item.subject_name,
                isClassTeacher: item.is_class_teacher
            }))
    };
}

async function updateOwnProfile(teacherId, { name, email, mobile }) {
    if (!name || !email) {
        throw new Error("Name and Email are required");
    }

    const teacher = await teachersRepository.findById(teacherId);

    if (!teacher || !teacher.is_active) {
        throw new Error("Teacher not found");
    }

    const existingTeacher = await teachersRepository.findByEmail(email.trim());

    if (existingTeacher && existingTeacher.id !== teacherId) {
        throw new Error("Email already exists");
    }

    const updatedTeacher = await teachersRepository.updateOwnProfile({
        id: teacherId,
        name: name.trim(),
        email: email.trim(),
        mobile: (mobile || "").trim(),
        updatedAt: Date.now()
    });

    return {
        id: updatedTeacher.id,
        teacherCode: updatedTeacher.teacher_code,
        name: updatedTeacher.name,
        email: updatedTeacher.email,
        mobile: updatedTeacher.mobile,
        isActive: updatedTeacher.is_active
    };
}

async function changeOwnPassword(teacherId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
        throw new Error("Current password and new password are required");
    }

    if (newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters");
    }

    const teacher = await teachersRepository.findById(teacherId);

    if (!teacher || !teacher.is_active) {
        throw new Error("Teacher not found");
    }

    const currentPasswordValid = await bcrypt.compare(
        currentPassword,
        teacher.password_hash
    );

    if (!currentPasswordValid) {
        throw new Error("Current password is incorrect");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await teachersRepository.updateOwnPassword({
        id: teacherId,
        passwordHash,
        updatedAt: Date.now()
    });

    return {
        success: true,
        message: "Password changed successfully"
    };
}

module.exports = {
    getOwnProfile,
    updateOwnProfile,
    changeOwnPassword,
    getTeachers,
    getTeacherById,
    createTeacher,
    updateTeacher,
    updateStatus,
    updatePassword,
    deleteTeacher
};
