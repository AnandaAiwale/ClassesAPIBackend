const crypto = require("crypto");
const repository = require("./subjects.repository");

async function getSubjects() {
    return repository.findAll();
}

async function getSubjectById(id) {
    const subject = await repository.findById(id);

    if (!subject) {
        const error = new Error("Subject not found");
        error.statusCode = 404;
        throw error;
    }

    return subject;
}

async function createSubject(subjectName) {
    const normalizedName = String(subjectName || "").trim();

    const existingSubject = await repository.findByName(normalizedName);

    if (existingSubject) {
        const error = new Error("Subject already exists");
        error.statusCode = 409;
        throw error;
    }

    return repository.createSubject({
        id: crypto.randomUUID(),
        subjectName: normalizedName,
        createdAt: Date.now()
    });
}

async function updateSubject(id, subjectName) {
    const existingSubject = await repository.findById(id);

    if (!existingSubject) {
        const error = new Error("Subject not found");
        error.statusCode = 404;
        throw error;
    }

    const normalizedName = String(subjectName || "").trim();

    const subjectWithName = await repository.findByName(normalizedName);

    if (subjectWithName && subjectWithName.id !== id) {
        const error = new Error("Subject already exists");
        error.statusCode = 409;
        throw error;
    }

    return repository.updateSubject({
        id,
        subjectName: normalizedName,
        updatedAt: Date.now()
    });
}

async function updateStatus(id, isActive) {
    const existingSubject = await repository.findById(id);

    if (!existingSubject) {
        const error = new Error("Subject not found");
        error.statusCode = 404;
        throw error;
    }

    return repository.updateStatus(
        id,
        Boolean(isActive),
        Date.now()
    );
}

async function deleteSubject(id) {
    const existingSubject = await repository.findById(id);

    if (!existingSubject) {
        const error = new Error("Subject not found");
        error.statusCode = 404;
        throw error;
    }

    return repository.deleteSubject(id);
}

module.exports = {
    getSubjects,
    getSubjectById,
    createSubject,
    updateSubject,
    updateStatus,
    deleteSubject
};
