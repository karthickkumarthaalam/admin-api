const db = require("../models");
const { PaidThrough } = db;

// Create PaidThrough
exports.createPaidThrough = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ status: "error", message: "Name is required" });
        }

        const existing = await PaidThrough.findOne({ where: { name } });

        if (existing) {
            return res.status(400).json({ status: "error", message: "Paid through already exists" });
        }

        const newPaidThrough = await PaidThrough.create({ name });

        return res.status(201).json({
            status: "success",
            message: "Paid through created successfully",
            data: newPaidThrough
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to create paid through",
            error: error.message
        });
    }
};

// List PaidThrough
exports.listPaidThrough = async (req, res) => {
    try {
        const list = await PaidThrough.findAll({
            attributes: ["id", "name"],
            order: [["createdAt", "DESC"]]
        });

        return res.status(200).json({
            status: "success",
            message: "Paid through list fetched successfully",
            data: list
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch paid through list",
            error: error.message
        });
    }
};
