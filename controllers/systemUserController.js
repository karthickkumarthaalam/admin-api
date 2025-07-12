const { SystemUsers, Department, User } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const pagination = require("../utils/pagination");
const fs = require("fs");
const { sendRjPasswordEmail } = require("../utils/sendEmail");


// Create System User
exports.createSystemUser = async (req, res) => {
    try {
        const {
            name, email, gender, date_of_birth,
            phone_number, whatsapp_number, address,
            country, state, city, description, department_id, status
        } = req.body;

        const existingUser = await SystemUsers.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const plainPassword = crypto.randomBytes(6).toString("hex");
        const hashedPassword = await bcrypt.hash(plainPassword, 10);


        const user = await User.create({
            email,
            password: hashedPassword,
        });


        const imageUrl = req.files["profile_image"]
            ? req.files["profile_image"][0].path
            : null;

        const systemUser = await SystemUsers.create({
            name, email, gender, date_of_birth, phone_number, whatsapp_number,
            address, country, state, city, description, department_id, status, image_url: imageUrl, user_id: user.id
        });

        await sendRjPasswordEmail(email, name, plainPassword);

        res.status(201).json({ message: "System user created successfully", data: systemUser });

    } catch (error) {
        res.status(500).json({ message: "Failed to create system user", error: error.message });
    }
};

// Update System User
exports.updateSystemUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await SystemUsers.findByPk(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (req.body.email && req.body.email !== user.email) {
            const existingUser = await User.findOne({ where: { email: req.body.email } });
            if (existingUser) {
                return res.status(400).json({ message: "Another user with this email already exists" });
            }
            await User.update(
                { email: req.body.email },
                { where: { id: user.user_id } }
            );
        }

        let imageUrl = user.image_url;
        if (req.files["profile_image"]) {
            if (user.image_url && fs.existsSync(user.image_url)) {
                fs.unlinkSync(user.image_url);
            }
            imageUrl = req.files["profile_image"][0].path;
        }

        await user.update({
            ...req.body,
            image_url: imageUrl
        });

        res.status(200).json({ message: "User updated successfully", data: user });
    } catch (error) {
        res.status(500).json({ message: "Failed to update user", error: error.message });
    }
};

// Update Status
exports.updateSystemUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user = await SystemUsers.findByPk(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        await user.update({ status });

        res.status(200).json({ message: "Status updated successfully", data: user });
    } catch (error) {
        res.status(500).json({ message: "Failed to update status", error: error.message });
    }
};

// Delete User
exports.deleteSystemUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await SystemUsers.findByPk(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.image_url && fs.existsSync(user.image_url)) {
            fs.unlinkSync(user.image_url);
        }

        await User.destroy({ where: { id: user.user_id } });
        await user.destroy();
        res.status(200).json({ message: "User deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Failed to delete user", error: error.message });
    }
};

// Get All Users
exports.getAllSystemUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const filterConditions = {};
        const includeConditions = [{ model: Department, as: "department" }];


        if (req.query.search) {
            const searchQuery = `%${req.query.search}%`;
            filterConditions[Op.or] = [
                { name: { [Op.like]: searchQuery } },
                { email: { [Op.like]: searchQuery } },
            ];
        }


        if (req.query.department) {
            const departmentNameQuery = `%${req.query.department}%`;
            includeConditions[0].where = {
                department_name: { [Op.like]: departmentNameQuery },
            };
        }

        const result = await pagination(SystemUsers, {
            page,
            limit,
            where: filterConditions,
            order: [["createdAt", "DESC"]],
            include: includeConditions
        });

        res.status(200).json({
            message: "Users fetched successfully",
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
};

// Get User by ID
exports.getSystemUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await SystemUsers.findByPk(id, {
            include: [{ model: Department, as: "department" }]
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ message: "User fetched successfully", data: user });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user", error: error.message });
    }
};
