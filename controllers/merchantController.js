const db = require("../models");
const { Merchant } = db;

exports.createMerchant = async (req, res) => {
    try {
        const { merchant_name } = req.body;

        if (!merchant_name) {
            return res.status(404).json({ status: "error", message: "Merchant Name is required" });
        }

        const existingMerchant = await Merchant.findOne({
            where: {
                merchant_name: merchant_name,
                created_by: req.user.id
            }
        });

        if (existingMerchant) {
            return res.status(400).json({ status: "error", message: "Merchant Name already present" });
        }

        const merchant = await Merchant.create({
            merchant_name,
            created_by: req.user.id
        });

        return res.status(201).json({ status: "success", message: "Merchant created successfully", data: merchant });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to create Merchant", error: error.message });
    }
};


exports.listMerchantName = async (req, res) => {
    try {
        const { role, id } = req.user;

        const whereCondition = {};

        if (role !== "admin") {
            whereCondition.created_by = id;
        }

        const list = await Merchant.findAll({
            where: whereCondition
        });

        return res.status(200).json({
            status: "success",
            message: "Merchant list fetched successfully",
            data: list
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch Merchant Name",
            error: error.message
        });
    }
};

exports.updateMerchant = async (req, res) => {
    const { id } = req.params;
    try {
        const { merchant_name } = req.body;
        const merchant = await Merchant.findByPk(id);

        if (!merchant) {
            return res.status(404).json({ status: "error", message: "Merchant not found" });
        }

        const existingMerchant = await Merchant.findOne({
            where: { merchant_name, created_by: req.user.id },
        });

        if (existingMerchant && existingMerchant.id !== merchant.id) {
            return res.status(400).json({ status: "error", message: "Merchant Name already present" });
        }

        merchant.merchant_name = merchant_name;
        await merchant.save();

        return res.status(200).json({ status: "success", message: "merchant updated successfully" });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to update Merchant",
            error: error.message,
        });
    }
};



exports.deleteMerchant = async (req, res) => {
    const { id } = req.params;
    try {
        const merchant = await Merchant.findByPk(id);

        if (!merchant) {
            return res.status(404).json({ status: "error", message: "Merchant not found" });
        }

        await merchant.destroy();
        return res.status(200).json({ status: "success", message: "merchant deleted successfully" });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to delete Merchant",
            error: error.message
        });
    }
};
