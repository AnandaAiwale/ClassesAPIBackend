const service = require("./studentSubjects.service");

function handleError(res, error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: error.message || "Something went wrong"
    });
}

async function getStudentSubjects(req, res) {
    try {
        const subjects = await service.getStudentSubjects(
            req.params.studentId
        );

        return res.json({
            success: true,
            subjects
        });
    } catch (error) {
        return handleError(res, error);
    }
}

async function getAssignmentById(req, res) {
    try {
        const assignment = await service.getAssignmentById(
            req.params.id
        );

        return res.json({
            success: true,
            assignment
        });
    } catch (error) {
        return handleError(res, error);
    }
}

async function createAssignment(req, res) {
    try {
        const {
            studentId,
            subjectId
        } = req.body;

        if (!studentId || !subjectId) {
            return res.status(400).json({
                success: false,
                message: "studentId and subjectId are required"
            });
        }

        const assignment = await service.createAssignment({
            studentId,
            subjectId
        });

        return res.status(201).json({
            success: true,
            message: "Subject assigned to student successfully",
            assignment
        });
    } catch (error) {
        return handleError(res, error);
    }
}

async function updateAssignmentStatus(req, res) {
    try {
        const { isActive } = req.body;

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive must be a boolean"
            });
        }

        const assignment =
            await service.updateAssignmentStatus(
                req.params.id,
                isActive
            );

        return res.json({
            success: true,
            message: "Student subject assignment status updated successfully",
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
            message: "Student subject assignment deleted successfully"
        });
    } catch (error) {
        return handleError(res, error);
    }
}

module.exports = {
    getStudentSubjects,
    getAssignmentById,
    createAssignment,
    updateAssignmentStatus,
    deleteAssignment
};
