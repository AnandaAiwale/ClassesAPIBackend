const crypto = require("crypto");
const attendanceRepository = require("./attendance.repository");
const teacherPermissionsRepository = require("../teacherPermissions/teacherPermissions.repository");
const studentsRepository = require("../students/students.repository");
const classesRepository = require("../classes/classes.repository");

function generateId() {
    return crypto.randomUUID();
}

function validateDate(date) {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function validateStatus(status) {
    return status === "PRESENT" || status === "ABSENT";
}

async function getAttendanceByDate(classId, attendanceDate) {
    if (!classId || !attendanceDate) {
        throw new Error("classId and attendanceDate are required");
    }

    if (!validateDate(attendanceDate)) {
        throw new Error("attendanceDate must be in YYYY-MM-DD format");
    }

    const classItem = await classesRepository.findById(classId);

    if (!classItem) {
        throw new Error("Class not found");
    }

    return attendanceRepository.findByDate(
        classId,
        attendanceDate
    );
}

async function getStudentAttendance(studentId) {
    if (!studentId) {
        throw new Error("studentId is required");
    }

    const student = await studentsRepository.findById(studentId);

    if (!student) {
        throw new Error("Student not found");
    }

    return attendanceRepository.findByStudent(studentId);
}

async function markAttendance({
    studentId,
    classId,
    attendanceDate,
    status
}) {
    if (!studentId || !classId || !attendanceDate || !status) {
        throw new Error(
            "studentId, classId, attendanceDate and status are required"
        );
    }

    if (!validateDate(attendanceDate)) {
        throw new Error("attendanceDate must be in YYYY-MM-DD format");
    }

    if (!validateStatus(status)) {
        throw new Error("status must be PRESENT or ABSENT");
    }

    const student = await studentsRepository.findById(studentId);

    if (!student) {
        throw new Error("Student not found");
    }

    if (!student.is_active) {
        throw new Error("Student is inactive");
    }

    if (student.class_id !== classId) {
        throw new Error("Student does not belong to this class");
    }

    const existing =
        await attendanceRepository.findByStudentAndDate(
            studentId,
            attendanceDate
        );

    if (existing) {
        throw new Error(
            "Attendance already exists for this student and date"
        );
    }

    const now = Date.now();

    return attendanceRepository.createAttendance({
        id: generateId(),
        studentId,
        classId,
        attendanceDate,
        status,
        createdAt: now
    });
}

async function updateAttendance({
    id,
    status
}) {
    if (!id || !status) {
        throw new Error("id and status are required");
    }

    if (!validateStatus(status)) {
        throw new Error("status must be PRESENT or ABSENT");
    }

    const updated = await attendanceRepository.updateAttendance({
        id,
        status,
        updatedAt: Date.now()
    });

    if (!updated) {
        throw new Error("Attendance record not found");
    }

    return updated;
}

module.exports = {
    getAttendanceByDate,
    getStudentAttendance,
    markAttendance,
    updateAttendance
};
