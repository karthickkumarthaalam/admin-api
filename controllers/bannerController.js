const fs = require('fs');
const db = require("../models");
const pagination = require("../utils/pagination");
const { Op, literal } = require("sequelize");

const { Banner } = db;

exports.createBanner = async (req, res) => {
    try {

        const { banner_name, status, language } = req.body;

        if (!banner_name) {
            return res.status(400).json({
                status: "error",
                message: "Banner name is required"
            });
        }

        const websiteImage = req.files["website_image"] ? req.files["website_image"][0].path : null;
        const mobileImage = req.files["mobile_image"] ? req.files["mobile_image"][0].path : null;

        if (!websiteImage && !mobileImage) {
            return res.status(400).json({
                status: "error",
                message: "At least one image (website or mobile) is required"
            });
        }

        const parsedLanguage = language ? JSON.parse(language) : ["All"];

        const banner = await Banner.create({
            banner_name,
            website_image: websiteImage,
            mobile_image: mobileImage,
            status,
            language: parsedLanguage
        });


        res.status(200).json({
            status: "success",
            message: "Banner created successfully",
            banner
        });


    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to create banner",
            error: error.message
        });
    }
};


exports.getAllBanner = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        let where = {};

        if (req.query.status) {
            where.status = req.query.status;
        }
        if (req.query.search) {
            where.banner_name = {
                [Op.like]: `%${req.query.search}%`
            };
        }

        if (req.query.language) {
            where = {
                ...where,
                [Op.and]: literal(`JSON_CONTAINS(language, '["${req.query.language}"]')`)
            };
        }

        const result = await pagination(Banner, { page, limit, where });

        return res.status(200).json({
            status: "success",
            message: "Banners fetched successfully.",
            data: result
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to fetch banners",
            error: error.message
        });
    }
};

exports.getBannerById = async (req, res) => {
    const { id } = req.params;
    try {
        const banner = await Banner.findByPk(id);

        if (!banner) {
            return res.status(404).json({ status: "error", message: "Banner not found." });
        }

        return res.status(200).json({ status: "success", message: "Banner fetched successfully.", banner });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to fetch banner.", error: error.message });
    }
};

exports.updateBannerStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const banner = await Banner.findByPk(id);

        if (!banner) {
            return res.status(404).json({ status: "error", message: "Banner not found." });
        }

        if (!status) {
            return res.status(400).json({ status: "error", message: "Status is required." });
        }

        banner.status = status;
        await banner.save();

        return res.status(200).json({ status: "success", message: "Banner status updated successfully.", banner });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to update banner status.", error: error.message });
    }
};


exports.updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { banner_name, status, language } = req.body;

        const banner = await Banner.findByPk(id);
        if (!banner) {
            return res.status(404).json({ status: "error", message: "Banner not found." });
        }

        let parsedLanguage = banner.language;
        if (language) {
            try {
                parsedLanguage = JSON.parse(language);
            } catch (e) {
                return res.status(400).json({ status: "error", message: "Invalid language format. Must be a JSON array string." });
            }
        }

        const websiteImage = req.files["website_image"] ? req.files["website_image"][0].path : null;
        const mobileImage = req.files["mobile_image"] ? req.files["mobile_image"][0].path : null;

        if (websiteImage && banner.website_image) {
            fs.unlinkSync(banner.website_image);
        }

        if (mobileImage && banner.mobile_image) {
            fs.unlinkSync(banner.mobile_image);
        }

        // Update banner fields
        banner.banner_name = banner_name || banner.banner_name;
        banner.status = status || banner.status;
        banner.language = parsedLanguage;
        if (websiteImage) banner.website_image = websiteImage;
        if (mobileImage) banner.mobile_image = mobileImage;

        await banner.save();

        return res.status(200).json({
            status: "success",
            message: "Banner updated successfully.",
            banner
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to update banner.",
            error: error.message
        });
    }

};


exports.deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const banner = await Banner.findByPk(id);
        if (!banner) {
            return res.status(404).json({ status: "error", message: "Banner not found." });
        }

        if (banner.website_image && fs.existsSync(banner.website_image)) {
            try {
                fs.unlinkSync(banner.website_image);
            } catch (err) {
                console.warn("Failed to delete website image:", err.message);
            }
        }

        if (banner.mobile_image && fs.existsSync(banner.mobile_image)) {
            try {
                fs.unlinkSync(banner.mobile_image);
            } catch (err) {
                console.warn("Failed to delete mobile image:", err.message);
            }
        }

        await banner.destroy();

        return res.status(200).json({
            status: "success",
            message: "Banner deleted successfully."
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to delete banner.",
            error: error.message
        });
    }
};
