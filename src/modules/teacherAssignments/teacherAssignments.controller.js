const service = require("./teacherAssignments.service");

function handleError(res, error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: error.message || "Something went wrong"
    });
}

async function getAssignmentById(req, res) {
    try {
        const assignment = await service.getAssignmentById(req.params.id);

        return res.json({
            success: true,
            assignment
        });
    } catch (error) {
        return handleError(res, error);
    }
}

async function getTeacherAssignments(req, res) {
    try {
        const assignments = await service.getTeacherAssignments(
            req.params.teacherId
        );

        return res.json({
            success: true,
            assignments
        });
    } catch (error) {
        return handleError(res, error);
    }
}

async function getClassAssignments(req, res) {
    try {
        const assignments = await service.getClassAssignments(
            req.params.classId,
            req.user.id
        );

        return res.json({
            success: true,
            assignments
        });
    } catch (error) {
        return handleError(res, error);
    }
}

async function createAssignment(req, res) {
    try {
        const {
            teacherId,
            classId,
            subjectId,
            isClassTeacher = false
        } = req.body;

        if (!teacherId || !classId || !subjectId) {
            return res.status(400).json({
                success: false,
                message: "teacherId, classId and subjectId are required"
            });
        }

        if (typeof isClassTeacher !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isClassTeacher must be a boolean"
            });
        }

        const assignment = await service.createAssignment({
            adminId: req.user.id,
            teacherId,
            classId,
            subjectId,
            isClassTeacher
        });

        return res.status(201).json({
            success: true,
            message: "Teacher assignment created successfully",
            assignment
        });
    } catch (error) {
        return handleError(res, error);
    }
}

async function updateAssignment(req, res) {
    try {
        const {
            isClassTeacher,
            isActive
        } = req.body;

        if (typeof isClassTeacher !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isClassTeacher must be a boolean"
            });
        }

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive must be a boolean"
            });
        }

        const assignment = await service.updateAssignment(
            req.params.id,
            {
                isClassTeacher,
                isActive
            }
        );

        return res.json({
            success: true,
            message: "Teacher assignment updated successfully",
            assignment
        });
    } catch (error) {
        return handleError(res, error);
    }
}

async function deleteAssignment(req, res) {
    try {
        await service.deleteAssignment(req.params.id);

        return res.json({
            success: true,
            message: "Teacher assignment deleted successfully"
        });
    } catch (error) {
        return handleError(res, error);
    }
}

module.exports = {
    getAssignmentById,
    getTeacherAssignments,
    getClassAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment
};
