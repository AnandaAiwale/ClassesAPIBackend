const crypto = require("crypto");

const repository = require("./teacherAssignments.repository");
const teacherRepository = require("../teachers/teachers.repository");
const classRepository = require("../classes/classes.repository");
const subjectRepository = require("../subjects/subjects.repository");

async function getAssignmentById(id) {
    const assignment = await repository.findById(id);

    if (!assignment) {
        const error = new Error("Teacher assignment not found");
        error.statusCode = 404;
        throw error;
    }

    return assignment;
}

async function getTeacherAssignments(teacherId) {
    const teacher = await teacherRepository.findById(teacherId);

    if (!teacher) {
        const error = new Error("Teacher not found");
        error.statusCode = 404;
        throw error;
    }

    return repository.findByTeacher(teacherId);
}

async function getClassAssignments(classId) {
    const classData = await classRepository.findById(classId);

    if (!classData) {
        const error = new Error("Class not found");
        error.statusCode = 404;
        throw error;
    }

    return repository.findByClass(classId);
}

async function createAssignment({
    teacherId,
    classId,
    subjectId,
    isClassTeacher = false
}) {
    const teacher = await teacherRepository.findById(teacherId);

    if (!teacher) {
        const error = new Error("Teacher not found");
        error.statusCode = 404;
        throw error;
    }

    if (!teacher.is_active) {
        const error = new Error("Teacher is inactive");
        error.statusCode = 403;
        throw error;
    }

    const classData = await classRepository.findById(classId);

    if (!classData) {
        const error = new Error("Class not found");
        error.statusCode = 404;
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
        teacherId,
        classId,
        subjectId
    );

    if (existingAssignment) {
        const error = new Error("Teacher is already assigned to this class and subject");
        error.statusCode = 409;
        throw error;
    }

    const now = Date.now();

    if (isClassTeacher) {
        await repository.clearClassTeacher(classId, now);
    }

    return repository.createAssignment({
        id: crypto.randomUUID(),
        teacherId,
        classId,
        subjectId,
        isClassTeacher,
        createdAt: now
    });
}

async function updateAssignment(
    id,
    {
        isClassTeacher,
        isActive
    }
) {
    const existingAssignment = await repository.findById(id);

    if (!existingAssignment) {
        const error = new Error("Teacher assignment not found");
        error.statusCode = 404;
        throw error;
    }

    const now = Date.now();

    if (isClassTeacher) {
        await repository.clearClassTeacher(
            existingAssignment.class_id,
            now
        );
    }

    return repository.updateAssignment({
        id,
        isClassTeacher,
        isActive,
        updatedAt: now
    });
}

async function deleteAssignment(id) {
    const existingAssignment = await repository.findById(id);

    if (!existingAssignment) {
        const error = new Error("Teacher assignment not found");
        error.statusCode = 404;
        throw error;
    }

    return repository.deleteAssignment(id);
}

module.exports = {
    getAssignmentById,
    getTeacherAssignments,
    getClassAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment
};
