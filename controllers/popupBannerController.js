const fs = require("fs");
const path = require("path");
const db = require("../models");
const { PopupBanner } = db;

const deleteFileIfExists = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

exports.createOrUpdateBanner = async (req, res) => {
    try {
        const { language } = req.body;
        const websiteImage = req.files["website_image"] ? req.files["website_image"][0].path : null;
        const mobileImage = req.files["mobile_image"] ? req.files["mobile_image"][0].path : null;

        const parsedLanguage = language ? JSON.parse(language) : ["All"];

        let popupBanner = await PopupBanner.findOne();

        if (popupBanner) {
            if (websiteImage) {
                deleteFileIfExists(popupBanner.website_image);
                popupBanner.website_image = websiteImage;
            }
            if (mobileImage) {
                deleteFileIfExists(popupBanner.mobile_image);
                popupBanner.mobile_image = mobileImage;
            }
            popupBanner.language = parsedLanguage;

            await popupBanner.save();

            return res.status(200).json({
                status: "success",
                message: "Popup banner updated successfully.",
                popupBanner,
            });
        } else {
            if (!websiteImage && !mobileImage) {
                return res.status(400).json({
                    status: "error",
                    message: "At least one image (website or mobile) is required.",
                });
            }

            popupBanner = await PopupBanner.create({
                website_image: websiteImage,
                mobile_image: mobileImage,
                status: "active",
                language: parsedLanguage,
            });

            return res.status(201).json({
                status: "success",
                message: "Popup banner created successfully.",
                popupBanner,
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to create or update popup banner.",
            error: error.message,
        });
    }
};

exports.deleteBanner = async (req, res) => {
    const { id } = req.params;

    try {
        const popupBanner = await PopupBanner.findByPk(id);

        if (!popupBanner) {
            return res.status(404).json({ status: "error", message: "Banner not found." });
        }

        deleteFileIfExists(popupBanner.website_image);
        deleteFileIfExists(popupBanner.mobile_image);

        await popupBanner.destroy();

        return res.status(200).json({
            status: "success",
            message: "Banner deleted successfully.",
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to delete banner.",
            error: error.message,
        });
    }
};

exports.listBanners = async (req, res) => {
    try {
        const banners = await PopupBanner.findAll();
        return res.status(200).json({
            status: "success",
            data: banners,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to fetch banners.",
            error: error.message,
        });
    }
};

exports.updateBannerStatus = async (req, res) => {
    const { status } = req.body;

    try {
        if (!status || !["active", "in-active"].includes(status)) {
            return res.status(400).json({
                status: "error",
                message: "Valid status is required. Allowed values: 'active' or 'in-active'."
            });
        }

        const banner = await PopupBanner.findOne();

        if (!banner) {
            return res.status(404).json({
                status: "error",
                message: "No popup banner found to update."
            });
        }

        banner.status = status;
        await banner.save();

        return res.status(200).json({
            status: "success",
            message: `Banner status updated to '${status}'.`,
            banner
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to update popup banner status.",
            error: error.message
        });
    }
};
