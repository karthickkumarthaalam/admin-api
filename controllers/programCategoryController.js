const db = require("../models");
const pagination = require("../utils/pagination");
const { ProgramCategory } = db;

// Create Program Category
exports.createProgramCategory = async (req, res) => {
    try {
        const { category, start_time, end_time, country } = req.body;

        if (!category || !start_time || !end_time) {
            return res.status(400).json({ status: "error", message: "Category, Start Time and End Time are required." });
        }

        const programCategory = await ProgramCategory.create({
            category,
            start_time,
            end_time,
            country,
            status: "in-active"
        });

        res.status(201).json({ status: "success", message: "Program Category created successfully", data: programCategory });

    } catch (error) {
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
    try {
        const { id } = req.params;
        const { category, start_time, end_time, country } = req.body;

        const programCategory = await ProgramCategory.findByPk(id);

        if (!programCategory) {
            return res.status(404).json({ status: "error", message: "Program Category not found" });
        }

        programCategory.category = category || programCategory.category;
        programCategory.start_time = start_time || programCategory.start_time;
        programCategory.end_time = end_time || programCategory.end_time;
        programCategory.country = country || programCategory.country;

        await programCategory.save();

        return res.status(200).json({ status: "success", message: "Program Category updated successfully", data: programCategory });
    } catch (error) {
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
