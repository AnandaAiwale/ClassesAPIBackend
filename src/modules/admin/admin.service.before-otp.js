const crypto = require("crypto");
const repository = require("./admin.repository");
const { hashPassword, comparePassword } = require("../../utils/password");
const { generateToken } = require("../../utils/jwt");

async function createAdmin({ name, email, password, mobile = "" }) {
    const existingAdmin = await repository.findByEmail(email);

    if (existingAdmin) {
        const error = new Error("Admin email already exists");
        error.statusCode = 409;
        throw error;
    }

    const passwordHash = await hashPassword(password);
    const now = Date.now();

    const admin = await repository.createAdmin({
        id: crypto.randomUUID(),
        name,
        email,
        passwordHash,
        mobile,
        createdAt: now
    });

    return admin;
}

async function login(email, password) {
    const admin = await repository.findByEmail(email);

    if (!admin) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    if (!admin.is_active) {
        const error = new Error("Admin account is inactive");
        error.statusCode = 403;
        throw error;
    }

    const validPassword = await comparePassword(
        password,
        admin.password_hash
    );

    if (!validPassword) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const token = generateToken({
        id: admin.id,
        role: "admin",
        email: admin.email
    });

    return {
        token,
        admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            mobile: admin.mobile,
            isActive: admin.is_active
        }
    };
}

async function getProfile(adminId) {
    const admin = await repository.findById(adminId);

    if (!admin) {
        const error = new Error("Admin not found");
        error.statusCode = 404;
        throw error;
    }

    return {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        mobile: admin.mobile,
        isActive: admin.is_active,
        createdAt: admin.created_at,
        updatedAt: admin.updated_at
    };
}

async function updateProfile(adminId, { name, email, mobile = "" }) {
    const admin = await repository.findById(adminId);

    if (!admin) {
        const error = new Error("Admin not found");
        error.statusCode = 404;
        throw error;
    }

    const existingAdmin = await repository.findByEmail(email);

    if (existingAdmin && existingAdmin.id !== adminId) {
        const error = new Error("Admin email already exists");
        error.statusCode = 409;
        throw error;
    }

    const updatedAdmin = await repository.updateProfile({
        id: adminId,
        name,
        email,
        mobile,
        updatedAt: Date.now()
    });

    return {
        id: updatedAdmin.id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        mobile: updatedAdmin.mobile,
        isActive: updatedAdmin.is_active,
        createdAt: updatedAdmin.created_at,
        updatedAt: updatedAdmin.updated_at
    };
}

async function changePassword(adminId, currentPassword, newPassword) {
    const admin = await repository.findById(adminId);

    if (!admin) {
        const error = new Error("Admin not found");
        error.statusCode = 404;
        throw error;
    }

    const validPassword = await comparePassword(
        currentPassword,
        admin.password_hash
    );

    if (!validPassword) {
        const error = new Error("Current password is incorrect");
        error.statusCode = 401;
        throw error;
    }

    const passwordHash = await hashPassword(newPassword);

    await repository.updatePassword({
        id: adminId,
        passwordHash,
        updatedAt: Date.now()
    });

    return {
        message: "Password changed successfully"
    };
}

module.exports = {
    createAdmin,
    login,
    getProfile,
    updateProfile,
    changePassword
};
