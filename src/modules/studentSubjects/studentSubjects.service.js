const crypto = require("crypto");

const repository = require("./studentSubjects.repository");
const studentRepository = require("../students/students.repository");
const subjectRepository = require("../subjects/subjects.repository");

async function getStudentSubjects(studentId) {
    const student = await studentRepository.findById(studentId);

    if (!student) {
        const error = new Error("Student not found");
        error.statusCode = 404;
        throw error;
    }

    return repository.findByStudent(studentId);
}

async function getAssignmentById(id) {
    const assignment = await repository.findById(id);

    if (!assignment) {
        const error = new Error("Student subject assignment not found");
        error.statusCode = 404;
        throw error;
    }

    return assignment;
}

async function createAssignment({
    studentId,
    subjectId
}) {
    const student = await studentRepository.findById(studentId);

    if (!student) {
        const error = new Error("Student not found");
        error.statusCode = 404;
        throw error;
    }

    if (!student.is_active) {
        const error = new Error("Student is inactive");
        error.statusCode = 403;
        throw error;
    }

    const subject = await subjectRepository.findById(subjectId);

    if (!subject) {
        const error = new Error("Subject not found");
        error.statusCode = 404;
        throw error;
    }

    if (!subject.is_active) {
        const error = new Error("Subject is inactive");
        error.statusCode = 403;
        throw error;
    }

    const existingAssignment = await repository.findExisting(
        studentId,
        subjectId
    );

    if (existingAssignment) {
        const error = new Error(
            "Subject is already assigned to this student"
        );
        error.statusCode = 409;
        throw error;
    }

    return repository.createAssignment({
        id: crypto.randomUUID(),
        studentId,
        classId: student.class_id,
        subjectId,
        createdAt: Date.now()
    });
}

async function updateAssignmentStatus(id, isActive) {
    const existingAssignment = await repository.findById(id);

    if (!existingAssignment) {
        const error = new Error("Student subject assignment not found");
        error.statusCode = 404;
        throw error;
    }

    return repository.updateStatus(
        id,
        isActive,
        Date.now()
    );
}

async function deleteAssignment(id) {
    const existingAssignment = await repository.findById(id);

    if (!existingAssignment) {
        const error = new Error("Student subject assignment not found");
        error.statusCode = 404;
        throw error;
    }

    return repository.deleteAssignment(id);
}

module.exports = {
    getStudentSubjects,
    getAssignmentById,
    createAssignment,
    updateAssignmentStatus,
    deleteAssignment
};
