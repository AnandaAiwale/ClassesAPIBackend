const studentDashboardService = require("./studentDashboard.service");

async function getDashboard(req, res) {
    try {
        const data =
            await studentDashboardService.getDashboard(
                req.user.id
            );

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Get student dashboard error:", error);

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Unable to get student dashboard"
        });
    }
}

async function getProfile(req, res) {
    try {
        const data =
            await studentDashboardService.getProfile(
                req.user.id
            );

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Get student profile error:", error);

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Unable to get student profile"
        });
    }
}

async function getSubjects(req, res) {
    try {
        const data =
            await studentDashboardService.getSubjects(
                req.user.id
            );

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Get student subjects error:", error);

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Unable to get student subjects"
        });
    }
}

async function getHomework(req, res) {
    try {
        const data =
            await studentDashboardService.getHomework(
                req.user.id
            );

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Get student homework error:", error);

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Unable to get student homework"
        });
    }
}

async function getAttendance(req, res) {
    try {
        const data =
            await studentDashboardService.getAttendance(
                req.user.id
            );

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Get student attendance error:", error);

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Unable to get student attendance"
        });
    }
}

module.exports = {
    getDashboard,
    getProfile,
    getSubjects,
    getHomework,
    getAttendance
};
