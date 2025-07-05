const { RjProfile, User } = require("../models");
const { Op } = require("sequelize");
const pagination = require("../utils/pagination");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const fs = require("fs");
const { sendRjPasswordEmail } = require("../utils/sendEmail");

exports.createRjProfile = async (req, res) => {
    try {
        const {
            email, name, gender, date_of_birth,
            phone_number, whatsapp_number, address,
            country, state, city, description, status
        } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const plainPassword = crypto.randomBytes(6).toString("hex");
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const user = await User.create({
            email,
            password: hashedPassword,
            role: "rj"
        });

        const imageUrl = req.files["profile_image"]
            ? req.files["profile_image"][0].path
            : null;

        const profile = await RjProfile.create({
            user_id: user.id,
            email,
            name,
            gender,
            date_of_birth,
            image_url: imageUrl,
            phone_number,
            whatsapp_number,
            address,
            country,
            state,
            city,
            description,
            status
        });

        await sendRjPasswordEmail(email, name, plainPassword);

        res.status(201).json({ message: "RJ Profile created successfully", data: profile });

    } catch (error) {
        res.status(500).json({ message: "Failed to create RJ Profile", error: error.message });
    }
};

exports.updateRjProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const profile = await RjProfile.findByPk(id);
        if (!profile) {
            return res.status(404).json({ message: "RJ Profile not found" });
        }

        if (req.body.email && req.body.email !== profile.email) {
            const existingUser = await User.findOne({ where: { email: req.body.email } });
            if (existingUser) {
                return res.status(400).json({ message: "Another user with this email already exists" });
            }
            await User.update(
                { email: req.body.email },
                { where: { id: profile.user_id } }
            );
        }

        let imageUrl = profile.image_url;
        if (req.files["profile_image"]) {
            if (profile.image_url && fs.existsSync(profile.image_url)) {
                fs.unlinkSync(profile.image_url);
            }
            imageUrl = req.files["profile_image"][0].path;
        }

        await profile.update({
            ...req.body,
            image_url: imageUrl
        });

        res.status(200).json({ message: "RJ Profile updated successfully", data: profile });

    } catch (error) {
        res.status(500).json({ message: "Failed to update RJ Profile", error: error.message });
    }
};

exports.updateRjStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const profile = await RjProfile.findByPk(id);
        if (!profile) {
            return res.status(404).json({ message: "RJ Profile not found" });
        }

        await profile.update({ status });

        res.status(200).json({ message: "Status updated successfully", data: profile });

    } catch (error) {
        res.status(500).json({ message: "Failed to update status", error: error.message });
    }
};

exports.deleteRjProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const profile = await RjProfile.findByPk(id);
        if (!profile) {
            return res.status(404).json({ message: "RJ Profile not found" });
        }

        if (profile.image_url && fs.existsSync(profile.image_url)) {
            fs.unlinkSync(profile.image_url);
        }

        await User.destroy({ where: { id: profile.user_id } });
        await profile.destroy();

        res.status(200).json({ message: "RJ Profile deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Failed to delete RJ Profile", error: error.message });
    }
};

exports.getAllRjProfiles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const filterConditions = {};

        if (req.query.search) {
            const searchQuery = `%${req.query.search}%`;
            filterConditions[Op.or] = [
                { name: { [Op.like]: searchQuery } },
                { email: { [Op.like]: searchQuery } },
            ];
        }

        const result = await pagination(RjProfile, {
            page,
            limit,
            where: filterConditions,
            order: [["createdAt", "DESC"]],
        });

        res.status(200).json({
            message: "RJ Profiles fetched successfully",
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch RJ Profiles", error: error.message });
    }
};


exports.getRjProfileById = async (req, res) => {
    try {
        const { id } = req.params;

        const profile = await RjProfile.findByPk(id);

        if (!profile) {
            return res.status(404).json({ message: "RJ Profile not found" });
        }

        res.status(200).json({ message: "RJ Profile fetched successfully", data: profile });

    } catch (error) {
        res.status(500).json({ message: "Failed to fetch RJ Profile", error: error.message });
    }
};;
