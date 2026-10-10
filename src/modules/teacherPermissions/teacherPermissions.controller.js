const service = require("./teacherPermissions.service");

function handleError(res, error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: error.message || "Something went wrong"
    });
}

async function getPermissions(req, res) {
    try {
        const permissions = await service.getPermissions(
            req.params.teacherId
        );

        return res.json({
            success: true,
            permissions
        });
    } catch (error) {
        return handleError(res, error);
    }
}

async function updatePermissions(req, res) {
    try {
        const {
            homeworkEnabled,
            attendanceEnabled,
            reportsEnabled,
            isActive = true
        } = req.body;

        if (typeof homeworkEnabled !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "homeworkEnabled must be a boolean"
            });
        }

        if (typeof attendanceEnabled !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "attendanceEnabled must be a boolean"
            });
        }

        if (typeof reportsEnabled !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "reportsEnabled must be a boolean"
            });
        }

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive must be a boolean"
            });
        }

        const permissions = await service.updatePermissions(
            req.params.teacherId,
            {
                homeworkEnabled,
                attendanceEnabled,
                reportsEnabled,
                isActive
            }
        );

        return res.json({
            success: true,
            message: "Teacher permissions updated successfully",
            permissions
        });
    } catch (error) {
        return handleError(res, error);
    }
}

async function deletePermissions(req, res) {
    try {
        await service.deletePermissions(
            req.params.teacherId
        );

        return res.json({
            success: true,
            message: "Teacher permissions deleted successfully"
        });
    } catch (error) {
        return handleError(res, error);
    }
}

module.exports = {
    getPermissions,
    updatePermissions,
    deletePermissions
};
