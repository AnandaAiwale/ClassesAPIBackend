const service = require("./teachers.service");

function handleError(res, error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: error.message || "Something went wrong"
    });
}

async function getTeachers(req, res) {
    try {
        const teachers = await service.getTeachers();

        return res.json({
            success: true,
            teachers
        });
    } catch (error) {
        return handleError(res, error);
    }
}

async function getTeacherById(req, res) {
    try {
        const teacher = await service.getTeacherById(req.params.id);

        return res.json({
            success: true,
            teacher
        });
    } catch (error) {
        return handleError(res, error);
    }
}

async function createTeacher(req, res) {
    try {
        const {
            name,
            email,
            mobile = "",
            password
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const teacher = await service.createTeacher({
            name,
            email,
            mobile,
            password
        });

        return res.status(201).json({
            success: true,
            message: "Teacher created successfully",
            teacher
        });
    } catch (error) {
        return handleError(res, error);
    }
}

async function updateTeacher(req, res) {
    try {
        const {
            name,
            email,
            mobile = ""
        } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required"
            });
        }

        const teacher = await service.updateTeacher(
            req.params.id,
            {
                name,
                email,
                mobile
            }
        );

        return res.json({
            success: true,
            message: "Teacher updated successfully",
            teacher
        });
    } catch (error) {
        return handleError(res, error);
    }
}

async function updateTeacherStatus(req, res) {
    try {
        const { isActive } = req.body;

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive must be a boolean"
            });
        }

        const teacher = await service.updateStatus(
            req.params.id,
            isActive
        );

        return res.json({
            success: true,
            message: "Teacher status updated successfully",
            teacher
        });
    } catch (error) {
        return handleError(res, error);
    }
}

async function updateTeacherPassword(req, res) {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required"
            });
        }

        const teacher = await service.updatePassword(
            req.params.id,
            password
        );

        return res.json({
            success: true,
            message: "Teacher password updated successfully",
            teacher
        });
    } catch (error) {
        return handleError(res, error);
    }
}

async function deleteTeacher(req, res) {
    try {
        await service.deleteTeacher(req.params.id);

        return res.json({
            success: true,
            message: "Teacher deleted successfully"
        });
    } catch (error) {
        return handleError(res, error);
    }
}


async function getOwnProfile(req, res) {
    try {
        const profile = await teachersService.getOwnProfile(req.user.id);

        return res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error("Get teacher profile error:", error);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

async function updateOwnProfile(req, res) {
    try {
        const { name, email, mobile } = req.body;

        const profile = await teachersService.updateOwnProfile(
            req.user.id,
            { name, email, mobile }
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: profile
        });
    } catch (error) {
        console.error("Update teacher profile error:", error);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

async function changeOwnPassword(req, res) {
    try {
        const { currentPassword, newPassword } = req.body;

        const result = await teachersService.changeOwnPassword(
            req.user.id,
            currentPassword,
            newPassword
        );

        return res.status(200).json(result);
    } catch (error) {
        console.error("Change teacher password error:", error);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    getOwnProfile,
    updateOwnProfile,
    changeOwnPassword,
    getTeachers,
    getTeacherById,
    createTeacher,
    updateTeacher,
    updateTeacherStatus,
    updateTeacherPassword,
    deleteTeacher
};
