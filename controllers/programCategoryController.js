const db = require("../models");
const fs = require("fs");
const pagination = require("../utils/pagination");
const { uploadToCpanel } = require("../services/uploadToCpanel");
const { ProgramCategory } = db;

// Create Program Category
exports.createProgramCategory = async (req, res) => {
    const image = req.files["image"] ? req.files["image"][0] : null;
    try {
        const { category, start_time, end_time, country } = req.body;

        if (!category || !start_time || !end_time) {
            return res.status(400).json({ status: "error", message: "Category, Start Time and End Time are required." });
        }

        let image_url = null;

        if (image && image.path) {
            image_url = await uploadToCpanel(
                image.path,
                "programBanner/images",
                image.originalname
            );
            fs.unlinkSync(image.path);
        }

        const programCategory = await ProgramCategory.create({
            category,
            start_time,
            end_time,
            country,
            image_url,
            status: "in-active"
        });

        res.status(201).json({ status: "success", message: "Program Category created successfully", data: programCategory });

    } catch (error) {
        if (image && fs.existsSync(image.path)) fs.unlinkSync(image.path);
        res.status(500).json({ status: "error", message: "Failed to create Program Category", error: error.message });
    }
};

// Get All Program Categories with Pagination
exports.getAllProgramCategories = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        let whereCondition = {};

        if (req.query.status) {
            whereCondition.status = req.query.status;
        }

        const result = await pagination(ProgramCategory, {
            page,
            limit,
            where: whereCondition,
            order: [["start_time", "ASC"]]
        });

        return res.status(200).json({ status: "success", message: "Program Categories fetched successfully", data: result.data, pagination: result.pagination });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to fetch Program Categories", error: error.message });
    }
};

// Get by ID
exports.getProgramCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const programCategory = await ProgramCategory.findByPk(id);

        if (!programCategory) {
            return res.status(404).json({ status: "error", message: "Program Category not found" });
        }

        return res.status(200).json({ status: "success", message: "Program Category fetched successfully", data: programCategory });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to fetch Program Category", error: error.message });
    }
};

// Update Status
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["active", "in-active"].includes(status)) {
            return res.status(400).json({ status: "error", message: "Invalid status value." });
        }

        const programCategory = await ProgramCategory.findByPk(id);

        if (!programCategory) {
            return res.status(404).json({ status: "error", message: "Program Category not found" });
        }

        programCategory.status = status;
        await programCategory.save();

        return res.status(200).json({ status: "success", message: "Program Category status updated successfully" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to update status", error: error.message });
    }
};

// Update Program Category
exports.updateProgramCategory = async (req, res) => {
    const image = req.files["image"] ? req.files["image"][0] : null;
    try {
        const { id } = req.params;
        const { category, start_time, end_time, country } = req.body;

        const programCategory = await ProgramCategory.findByPk(id);

        if (!programCategory) {
            return res.status(404).json({ status: "error", message: "Program Category not found" });
        }

        if (image && image.path) {
            let image_url = await uploadToCpanel(
                image.path,
                "programBanner/images",
                image.originalname
            );
            programCategory.image_url = image_url;
            fs.unlinkSync(image.path);
        } else if (image === null || image === "null") {
            programCategory.image_url = null;
        }

        programCategory.category = category || programCategory.category;
        programCategory.start_time = start_time || programCategory.start_time;
        programCategory.end_time = end_time || programCategory.end_time;
        programCategory.country = country || programCategory.country;

        await programCategory.save();

        return res.status(200).json({ status: "success", message: "Program Category updated successfully", data: programCategory });
    } catch (error) {
        if (image && fs.existsSync(image.path)) fs.unlinkSync(image.path);
        res.status(500).json({ status: "error", message: "Failed to update Program Category", error: error.message });
    }
};

// Delete Program Category
exports.deleteProgramCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const programCategory = await ProgramCategory.findByPk(id);

        if (!programCategory) {
            return res.status(404).json({ status: "error", message: "Program Category not found" });
        }

        await programCategory.destroy();
        return res.status(200).json({ status: "success", message: "Program Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to delete Program Category", error: error.message });
    }
};
