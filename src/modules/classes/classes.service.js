const crypto = require("crypto");
const repository = require("./classes.repository");

function normalizeCode(value) {
    return String(value || "").trim().toUpperCase();
}

function notFoundError() {
    const error = new Error("Class not found");
    error.statusCode = 404;
    return error;
}

async function getClasses(adminId) {
    return repository.findAll(adminId);
}

async function getClassById(id, adminId) {
    const item = await repository.findById(id, adminId);
    if (!item) throw notFoundError();
    return item;
}

async function createClass({ adminId, className, classCode, classTeacherId = null }) {
    if (!adminId) {
        const error = new Error("Authenticated Admin ID is required");
        error.statusCode = 401;
        throw error;
    }

    const normalizedCode = normalizeCode(classCode);
    const existing = await repository.findByCode(normalizedCode, adminId);

    if (existing) {
        const error = new Error("Class code already exists");
        error.statusCode = 409;
        throw error;
    }

    return repository.createClass({
        id: crypto.randomUUID(),
        adminId,
        className: String(className).trim(),
        classCode: normalizedCode,
        classTeacherId,
        createdAt: Date.now()
    });
}

async function updateClass(id, adminId, { className, classCode, classTeacherId = null }) {
    await getClassById(id, adminId);

    const normalizedCode = normalizeCode(classCode);
    const existing = await repository.findByCode(normalizedCode, adminId);

    if (existing && existing.id !== id) {
        const error = new Error("Class code already exists");
        error.statusCode = 409;
        throw error;
    }

    const updated = await repository.updateClass({
        id, adminId,
        className: String(className).trim(),
        classCode: normalizedCode,
        classTeacherId,
        updatedAt: Date.now()
    });

    if (!updated) throw notFoundError();
    return updated;
}

async function updateStatus(id, adminId, isActive) {
    await getClassById(id, adminId);
    const updated = await repository.updateStatus(id, adminId, Boolean(isActive), Date.now());
    if (!updated) throw notFoundError();
    return updated;
}

async function deleteClass(id, adminId) {
    await getClassById(id, adminId);
    const deleted = await repository.deleteClass(id, adminId);
    if (!deleted) throw notFoundError();
    return deleted;
}

module.exports = {
    getClasses,
    getClassById,
    createClass,
    updateClass,
    updateStatus,
    deleteClass
};
