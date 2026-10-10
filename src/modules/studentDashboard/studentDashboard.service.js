const studentDashboardRepository = require("./studentDashboard.repository");
const studentsRepository = require("../students/students.repository");

async function verifyStudent(studentId) {
    const student = await studentsRepository.findById(studentId);

    if (!student || !student.is_active) {
        throw new Error("Student not found or inactive");
    }

    return student;
}

async function getProfile(studentId) {
    await verifyStudent(studentId);

    const profile =
        await studentDashboardRepository.findStudentProfile(
            studentId
        );

    if (!profile) {
        throw new Error("Student profile not found");
    }

    return profile;
}

async function getSubjects(studentId) {
    await verifyStudent(studentId);

    return studentDashboardRepository.findStudentSubjects(
        studentId
    );
}

async function getHomework(studentId) {
    await verifyStudent(studentId);

    return studentDashboardRepository.findStudentHomework(
        studentId
    );
}

async function getAttendance(studentId) {
    await verifyStudent(studentId);

    return studentDashboardRepository.findStudentAttendance(
        studentId
    );
}

async function getDashboard(studentId) {
    await verifyStudent(studentId);

    const [
        profile,
        subjects,
        homework,
        attendance
    ] = await Promise.all([
        studentDashboardRepository.findStudentProfile(studentId),
        studentDashboardRepository.findStudentSubjects(studentId),
        studentDashboardRepository.findStudentHomework(studentId),
        studentDashboardRepository.findStudentAttendance(studentId)
    ]);

    return {
        profile,
        subjects,
        homework,
        attendance
    };
}

module.exports = {
    getProfile,
    getSubjects,
    getHomework,
    getAttendance,
    getDashboard
};
