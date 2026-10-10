const crypto = require("crypto");

const repository = require("./teacherPermissions.repository");
const teacherRepository = require("../teachers/teachers.repository");

async function getPermissions(teacherId) {
    const teacher = await teacherRepository.findById(teacherId);

    if (!teacher) {
        const error = new Error("Teacher not found");
        error.statusCode = 404;
        throw error;
    }

    let permissions = await repository.findByTeacherId(teacherId);

    if (!permissions) {
        permissions = await repository.createPermissions({
            id: crypto.randomUUID(),
            teacherId,
            homeworkEnabled: true,
            attendanceEnabled: true,
            reportsEnabled: true,
            createdAt: Date.now()
        });
    }

    return permissions;
}

async function updatePermissions(
    teacherId,
    {
        homeworkEnabled,
        attendanceEnabled,
        reportsEnabled,
        isActive = true
    }
) {
    const teacher = await teacherRepository.findById(teacherId);

    if (!teacher) {
        const error = new Error("Teacher not found");
        error.statusCode = 404;
        throw error;
    }

    const existingPermissions = await repository.findByTeacherId(
        teacherId
    );

    if (!existingPermissions) {
        return repository.createPermissions({
            id: crypto.randomUUID(),
            teacherId,
            homeworkEnabled,
            attendanceEnabled,
            reportsEnabled,
            createdAt: Date.now()
        });
    }

    return repository.updatePermissions({
        teacherId,
        homeworkEnabled,
        attendanceEnabled,
        reportsEnabled,
        isActive,
        updatedAt: Date.now()
    });
}

async function deletePermissions(teacherId) {
    const teacher = await teacherRepository.findById(teacherId);

    if (!teacher) {
        const error = new Error("Teacher not found");
        error.statusCode = 404;
        throw error;
    }

    const permissions = await repository.deletePermissions(teacherId);

    if (!permissions) {
        const error = new Error("Teacher permissions not found");
        error.statusCode = 404;
        throw error;
    }

    return permissions;
}

module.exports = {
    getPermissions,
    updatePermissions,
    deletePermissions
};
