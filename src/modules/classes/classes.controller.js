const service = require("./classes.service");

function sendError(res, error, fallback) {
    console.error(fallback, error);
    return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Server error"
    });
}

async function getClasses(req, res) {
    try {
        const classes = await service.getClasses(req.user.id);
        return res.json({ success: true, classes });
    } catch (error) {
        return sendError(res, error, "Get classes error:");
    }
}

async function getClassById(req, res) {
    try {
        const item = await service.getClassById(req.params.id, req.user.id);
        return res.json({ success: true, class: item });
    } catch (error) {
        return sendError(res, error, "Get class error:");
    }
}

async function createClass(req, res) {
    try {
        const body = req.body || {};
        const { className, classCode, classTeacherId } = body;

        if (!className || !classCode) {
            return res.status(400).json({
                success: false,
                message: "Class name and class code are required"
            });
        }

        const input = {
            adminId: req.user.id,
            className,
            classCode,
            classTeacherId
        };

        if (Object.prototype.hasOwnProperty.call(body, "subjectIds")) {
            input.subjectIds = body.subjectIds;
        }

        const item = await service.createClass(input);

        return res.status(201).json({
            success: true,
            message: "Class created successfully",
            class: item
        });
    } catch (error) {
        return sendError(res, error, "Create class error:");
    }
}

async function updateClass(req, res) {
    try {
        const body = req.body || {};
        const { className, classCode, classTeacherId } = body;

        if (!className || !classCode) {
            return res.status(400).json({
                success: false,
                message: "Class name and class code are required"
            });
        }

        const input = { className, classCode, classTeacherId };

        if (Object.prototype.hasOwnProperty.call(body, "subjectIds")) {
            input.subjectIds = body.subjectIds;
        }

        const item = await service.updateClass(
            req.params.id,
            req.user.id,
            input
        );

        return res.json({
            success: true,
            message: "Class updated successfully",
            class: item
        });
    } catch (error) {
        return sendError(res, error, "Update class error:");
    }
}

async function updateClassStatus(req, res) {
    try {
        const { isActive } = req.body || {};

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive must be true or false"
            });
        }

        const item = await service.updateStatus(
            req.params.id,
            req.user.id,
            isActive
        );

        return res.json({
            success: true,
            message: isActive
                ? "Class enabled successfully"
                : "Class disabled successfully",
            class: item
        });
    } catch (error) {
        return sendError(res, error, "Update class status error:");
    }
}

async function deleteClass(req, res) {
    try {
        await service.deleteClass(req.params.id, req.user.id);
        return res.json({
            success: true,
            message: "Class deleted successfully"
        });
    } catch (error) {
        return sendError(res, error, "Delete class error:");
    }
}

module.exports = {
    getClasses,
    getClassById,
    createClass,
    updateClass,
    updateClassStatus,
    deleteClass
};
