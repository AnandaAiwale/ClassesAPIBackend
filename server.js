const express = require("express");
const cors = require("cors");
const path = require("path");
const adminRoutes = require("./src/modules/admin/admin.routes");
const classesRoutes = require("./src/modules/classes/classes.routes");
const subjectsRoutes = require("./src/modules/subjects/subjects.routes");
const teachersRoutes = require("./src/modules/teachers/teachers.routes");
const teacherAuthRoutes = require("./src/modules/teachers/teacherAuth.routes");
const teacherAssignmentsRoutes = require("./src/modules/teacherAssignments/teacherAssignments.routes");
const teacherPermissionsRoutes = require("./src/modules/teacherPermissions/teacherPermissions.routes");
const studentsRoutes = require("./src/modules/students/students.routes");
const studentAuthRoutes = require("./src/modules/students/studentAuth.routes");
const studentDashboardRoutes = require("./src/modules/studentDashboard/studentDashboard.routes");
const studentSubjectsRoutes = require("./src/modules/studentSubjects/studentSubjects.routes");
const attendanceRoutes = require("./src/modules/attendance/attendance.routes");
const homeworkRoutes = require("./src/modules/homework/homework.routes");
const reportsRoutes = require("./src/modules/reports/reports.routes");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

app.use("/api/admin", adminRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/subjects", subjectsRoutes);
app.use("/api/teachers", teachersRoutes);
app.use("/api/teacher-auth", teacherAuthRoutes);
app.use("/api/teacher-assignments", teacherAssignmentsRoutes);
app.use("/api/teacher-permissions", teacherPermissionsRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/student-auth", studentAuthRoutes);
app.use("/api/student-dashboard", studentDashboardRoutes);
app.use("/api/student-subjects", studentSubjectsRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/reports", reportsRoutes);

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Class API is working"
    });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Class API running on port ${PORT}`);
    });
}

module.exports = app;
