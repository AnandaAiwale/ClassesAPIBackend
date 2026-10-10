const service = require("./admin.service");

async function createAdmin(req, res) {
    try {
        const { name, email, password, mobile } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const admin = await service.createAdmin({
            name,
            email,
            password,
            mobile
        });

        return res.status(201).json({
            success: true,
            message: "Admin created successfully",
            admin
        });
    } catch (error) {
        console.error("Create admin error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const result = await service.login(email, password);

        return res.json({
            success: true,
            message: "Admin login successful",
            ...result
        });
    } catch (error) {
        console.error("Admin login error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
}

async function getProfile(req, res) {
    try {
        const admin = await service.getProfile(req.user.id);

        return res.json({
            success: true,
            admin
        });
    } catch (error) {
        console.error("Get admin profile error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
}

async function updateProfile(req, res) {
    try {
        const { name, email, mobile } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required"
            });
        }

        const admin = await service.updateProfile(
            req.user.id,
            {
                name,
                email,
                mobile
            }
        );

        return res.json({
            success: true,
            message: "Admin profile updated successfully",
            admin
        });
    } catch (error) {
        console.error("Update admin profile error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
}

async function changePassword(req, res) {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters"
            });
        }

        const result = await service.changePassword(
            req.user.id,
            currentPassword,
            newPassword
        );

        return res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error("Change admin password error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
}

module.exports = {
    createAdmin,
    login,
    getProfile,
    updateProfile,
    changePassword
};
