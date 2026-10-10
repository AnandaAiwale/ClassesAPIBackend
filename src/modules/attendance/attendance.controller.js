const attendanceService = require("./attendance.service");

async function getAttendanceByDate(req, res) {
    try {
        const { classId } = req.params;
        const { attendanceDate } = req.query;

        const data = await attendanceService.getAttendanceByDate(
            classId,
            attendanceDate
        );

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Get attendance error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Unable to get attendance"
        });
    }
}

async function getStudentAttendance(req, res) {
    try {
        const { studentId } = req.params;

        const data =
            await attendanceService.getStudentAttendance(studentId);

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Get student attendance error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Unable to get student attendance"
        });
    }
}

async function markAttendance(req, res) {
    try {
        const {
            studentId,
            classId,
            attendanceDate,
            status
        } = req.body;

        const data = await attendanceService.markAttendance({
            studentId,
            classId,
            attendanceDate,
            status
        });

        return res.status(201).json({
            success: true,
            message: "Attendance marked successfully",
            data
        });
    } catch (error) {
        console.error("Mark attendance error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Unable to mark attendance"
        });
    }
}

async function updateAttendance(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const data = await attendanceService.updateAttendance({
            id,
            status
        });

        return res.status(200).json({
            success: true,
            message: "Attendance updated successfully",
            data
        });
    } catch (error) {
        console.error("Update attendance error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Unable to update attendance"
        });
    }
}

module.exports = {
    getAttendanceByDate,
    getStudentAttendance,
    markAttendance,
    updateAttendance
};
