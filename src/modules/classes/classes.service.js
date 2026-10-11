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

function normalizeSubjectIds(subjectIds) {
    if (!Array.isArray(subjectIds)) {
        const error = new Error("subjectIds must be an array");
        error.statusCode = 400;
        throw error;
    }

    const normalized = [];

    for (const subjectId of subjectIds) {
        if (typeof subjectId !== "string" || subjectId.trim() === "") {
            const error = new Error("Each subject ID must be a non-empty string");
            error.statusCode = 400;
            throw error;
        }

        normalized.push(subjectId.trim());
    }

    if (new Set(normalized).size !== normalized.length) {
        const error = new Error("Duplicate subject IDs are not allowed");
        error.statusCode = 400;
        throw error;
    }

    return normalized;
}

async function assertAssignableSubjects(client, subjectIds) {
    if (subjectIds.length === 0) {
        return;
    }

    const rows = await repository.findSubjectsByIds(client, subjectIds);
    const byId = new Map(rows.map((row) => [row.id, row]));

    if (subjectIds.some((id) => !byId.has(id))) {
        const error = new Error("Subject not found");
        error.statusCode = 404;
        throw error;
    }

    if (subjectIds.some((id) => byId.get(id).is_active !== true)) {
        const error = new Error("Subject is inactive");
        error.statusCode = 403;
        throw error;
    }
}

async function getClasses(adminId) {
    return repository.findAll(adminId);
}

async function getClassById(id, adminId) {
    const item = await repository.findById(id, adminId);
    if (!item) throw notFoundError();
    return item;
}

async function createClass({
    adminId,
    className,
    classCode,
    classTeacherId = null,
    subjectIds
}) {
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

    const createdAt = Date.now();
    const payload = {
        id: crypto.randomUUID(),
        adminId,
        className: String(className).trim(),
        classCode: normalizedCode,
        classTeacherId,
        createdAt
    };

    if (subjectIds === undefined) {
        const created = await repository.createClass(payload);
        const [item] = await repository.attachSubjects([created]);
        return item;
    }

    const normalizedSubjectIds = normalizeSubjectIds(subjectIds);

    return repository.withTransaction(async (client) => {
        await assertAssignableSubjects(client, normalizedSubjectIds);

        const created = await repository.createClass(payload, client);

        if (normalizedSubjectIds.length > 0) {
            await repository.insertClassSubjects(
                client,
                created.id,
                normalizedSubjectIds,
                createdAt
            );
        }

        const [item] = await repository.attachSubjects([created], client);
        return item;
    });
}

async function updateClass(id, adminId, {
    className,
    classCode,
    classTeacherId = null,
    subjectIds
}) {
    await getClassById(id, adminId);

    const normalizedCode = normalizeCode(classCode);
    const existing = await repository.findByCode(normalizedCode, adminId);

    if (existing && existing.id !== id) {
        const error = new Error("Class code already exists");
        error.statusCode = 409;
        throw error;
    }

    const updatedAt = Date.now();
    const payload = {
        id,
        adminId,
        className: String(className).trim(),
        classCode: normalizedCode,
        classTeacherId,
        updatedAt
    };

    if (subjectIds === undefined) {
        const updated = await repository.updateClass(payload);
        if (!updated) throw notFoundError();
        const [item] = await repository.attachSubjects([updated]);
        return item;
    }

    const normalizedSubjectIds = normalizeSubjectIds(subjectIds);

    const updated = await repository.withTransaction(async (client) => {
        const locked = await repository.lockOwnedClass(client, id, adminId);

        if (!locked) {
            return null;
        }

        await assertAssignableSubjects(client, normalizedSubjectIds);

        const saved = await repository.updateClass(payload, client);

        if (!saved) {
            return null;
        }

        await repository.replaceClassSubjects(
            client,
            id,
            normalizedSubjectIds,
            updatedAt
        );

        const [item] = await repository.attachSubjects([saved], client);
        return item;
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
