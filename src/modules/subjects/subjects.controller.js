const service = require("./subjects.service");

async function getSubjects(req, res) {
    try {
        const subjects = await service.getSubjects();

        return res.json({
            success: true,
            subjects
        });
    } catch (error) {
        console.error("Get subjects error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
}

async function getSubjectById(req, res) {
    try {
        const subject = await service.getSubjectById(req.params.id);

        return res.json({
            success: true,
            subject
        });
    } catch (error) {
        console.error("Get subject error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
}

async function createSubject(req, res) {
    try {
        const { subjectName } = req.body;

        if (!subjectName || !String(subjectName).trim()) {
            return res.status(400).json({
                success: false,
                message: "Subject name is required"
            });
        }

        const subject = await service.createSubject(subjectName);

        return res.status(201).json({
            success: true,
            message: "Subject created successfully",
            subject
        });
    } catch (error) {
        console.error("Create subject error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
}

async function updateSubject(req, res) {
    try {
        const { subjectName } = req.body;

        if (!subjectName || !String(subjectName).trim()) {
            return res.status(400).json({
                success: false,
                message: "Subject name is required"
            });
        }

        const subject = await service.updateSubject(
            req.params.id,
            subjectName
        );

        return res.json({
            success: true,
            message: "Subject updated successfully",
            subject
        });
    } catch (error) {
        console.error("Update subject error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
}

async function updateSubjectStatus(req, res) {
    try {
        const { isActive } = req.body;

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive must be true or false"
            });
        }

        const subject = await service.updateStatus(
            req.params.id,
            isActive
        );

        return res.json({
            success: true,
            message: isActive
                ? "Subject enabled successfully"
                : "Subject disabled successfully",
            subject
        });
    } catch (error) {
        console.error("Update subject status error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
}

async function deleteSubject(req, res) {
    try {
        await service.deleteSubject(req.params.id);

        return res.json({
            success: true,
            message: "Subject deleted successfully"
        });
    } catch (error) {
        console.error("Delete subject error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
}

module.exports = {
    getSubjects,
    getSubjectById,
    createSubject,
    updateSubject,
    updateSubjectStatus,
    deleteSubject
};
