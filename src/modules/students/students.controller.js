const service = require("./students.service");

function handleError(res, error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: error.message || "Something went wrong"
    });
}

async function getStudentsByClass(req, res) {
    try {
        const students = await service.getStudentsByClass(
            req.params.classId
        );

        return res.json({
            success: true,
            students
        });
    } catch (error) {
        return handleError(res, error);
    }
}

async function getStudentById(req, res) {
    try {
        const student = await service.getStudentById(req.params.id);

        return res.json({
            success: true,
            student
        });
    } catch (error) {
        return handleError(res, error);
    }
}

async function createStudent(req, res) {
    try {
        const {
            classId,
            studentName,
            parentName,
            mobile = "",
            rollNumber,
            username,
            password,
            photoUrl = ""
        } = req.body;

        if (
            !classId ||
            !studentName ||
            !parentName ||
            !rollNumber ||
            !username ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "classId, studentName, parentName, rollNumber, username and password are required"
            });
        }

        const student = await service.createStudent({
            classId,
            studentName,
            parentName,
            mobile,
            rollNumber,
            username,
            password,
            photoUrl
        });

        return res.status(201).json({
            success: true,
            message: "Student created successfully",
            student
        });
    } catch (error) {
        return handleError(res, error);
    }
}

async function updateStudent(req, res) {
    try {
        const {
            studentName,
            parentName,
            mobile = "",
            rollNumber,
            username,
            photoUrl = ""
        } = req.body;

        if (
            !studentName ||
            !parentName ||
            !rollNumber ||
            !username
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "studentName, parentName, rollNumber and username are required"
            });
        }

        const student = await service.updateStudent(
            req.params.id,
            {
                studentName,
                parentName,
                mobile,
                rollNumber,
                username,
                photoUrl
            }
        );

        return res.json({
            success: true,
            message: "Student updated successfully",
            student
        });
    } catch (error) {
        return handleError(res, error);
    }
}

async function updateStudentStatus(req, res) {
    try {
        const { isActive } = req.body;

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive must be a boolean"
            });
        }

        const student = await service.updateStatus(
            req.params.id,
            isActive
        );

        return res.json({
            success: true,
            message: "Student status updated successfully",
            student
        });
    } catch (error) {
        return handleError(res, error);
    }
}

async function updateStudentPassword(req, res) {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required"
            });
        }

        const student = await service.updatePassword(
            req.params.id,
            password
        );

        return res.json({
            success: true,
            message: "Student password updated successfully",
            student
        });
    } catch (error) {
        return handleError(res, error);
    }
}

async function deleteStudent(req, res) {
    try {
        await service.deleteStudent(req.params.id);

        return res.json({
            success: true,
            message: "Student deleted successfully"
        });
    } catch (error) {
        return handleError(res, error);
    }
}


async function getOwnProfile(req, res) {
    try {
        const profile = await studentsService.getOwnProfile(req.user.id);

        return res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error("Get student profile error:", error);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

async function updateOwnProfile(req, res) {
    try {
        const {
            studentName,
            parentName,
            mobile,
            photoUrl
        } = req.body;

        const profile = await studentsService.updateOwnProfile(
            req.user.id,
            {
                studentName,
                parentName,
                mobile,
                photoUrl
            }
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: profile
        });
    } catch (error) {
        console.error("Update student profile error:", error);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

async function changeOwnPassword(req, res) {
    try {
        const {
            currentPassword,
            newPassword
        } = req.body;

        const result = await studentsService.changeOwnPassword(
            req.user.id,
            currentPassword,
            newPassword
        );

        return res.status(200).json(result);
    } catch (error) {
        console.error("Change student password error:", error);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}


async function uploadOwnPhoto(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Photo file is required"
            });
        }

        const photoUrl = `/uploads/students/${req.file.filename}`;

        const result = await studentsService.updateOwnPhoto(
            req.user.id,
            photoUrl
        );

        return res.status(200).json({
            success: true,
            message: "Photo uploaded successfully",
            data: result
        });
    } catch (error) {
        if (req.file) {
            const fs = require("fs");
            const path = require("path");

            const filePath = path.join(
                __dirname,
                "../../uploads/students",
                req.file.filename
            );

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        console.error("Student photo upload error:", error);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    uploadOwnPhoto,
    getOwnProfile,
    updateOwnProfile,
    changeOwnPassword,
    getStudentsByClass,
    getStudentById,
    createStudent,
    updateStudent,
    updateStudentStatus,
    updateStudentPassword,
    deleteStudent
};
