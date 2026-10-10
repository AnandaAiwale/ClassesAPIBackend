const reportsService = require("./reports.service");

async function getClassAttendanceReport(req, res) {
    try {
        const data =
            await reportsService.getClassAttendanceReport(
                req.params.classId,
                req.query.fromDate,
                req.query.toDate
            );

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error(
            "Get class attendance report error:",
            error
        );

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Unable to get attendance report"
        });
    }
}

async function getClassAttendanceSummary(req, res) {
    try {
        const data =
            await reportsService.getClassAttendanceSummary(
                req.params.classId,
                req.query.fromDate,
                req.query.toDate
            );

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error(
            "Get class attendance summary error:",
            error
        );

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Unable to get attendance summary"
        });
    }
}

async function getClassHomeworkReport(req, res) {
    try {
        const data =
            await reportsService.getClassHomeworkReport(
                req.params.classId,
                req.query.fromDate,
                req.query.toDate
            );

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error(
            "Get class homework report error:",
            error
        );

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Unable to get homework report"
        });
    }
}

async function getTeacherReport(req, res) {
    try {
        const data =
            await reportsService.getTeacherReport();

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error(
            "Get teacher report error:",
            error
        );

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Unable to get teacher report"
        });
    }
}

async function getStudentReport(req, res) {
    try {
        const data =
            await reportsService.getStudentReport(
                req.params.classId
            );

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error(
            "Get student report error:",
            error
        );

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Unable to get student report"
        });
    }
}

async function getHomeworkSummary(req, res) {
    try {
        const data =
            await reportsService.getHomeworkSummary();

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error(
            "Get homework summary error:",
            error
        );

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Unable to get homework summary"
        });
    }
}

async function getClassTeacherAttendanceReport(req, res) {
    try {
        const data =
            await reportsService.getClassTeacherAttendanceReport(
                req.user.id,
                req.query.fromDate,
                req.query.toDate
            );

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error(
            "Get Class Teacher attendance report error:",
            error
        );

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Unable to get attendance report"
        });
    }
}

async function getClassTeacherHomeworkReport(req, res) {
    try {
        const data =
            await reportsService.getClassTeacherHomeworkReport(
                req.user.id,
                req.query.fromDate,
                req.query.toDate
            );

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error(
            "Get Class Teacher homework report error:",
            error
        );

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Unable to get homework report"
        });
    }
}

async function getStudentAttendanceReport(req, res) {
    try {
        const data =
            await reportsService.getStudentAttendanceReport(
                req.user.id
            );

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error(
            "Get student attendance report error:",
            error
        );

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Unable to get student attendance report"
        });
    }
}

module.exports = {
    getClassAttendanceReport,
    getClassAttendanceSummary,
    getClassHomeworkReport,
    getTeacherReport,
    getStudentReport,
    getHomeworkSummary,
    getClassTeacherAttendanceReport,
    getClassTeacherHomeworkReport,
    getStudentAttendanceReport
};
