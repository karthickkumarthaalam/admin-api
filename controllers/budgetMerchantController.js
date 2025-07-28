const db = require("../models");
const { BudgetMerchant, SystemUsers } = db;

exports.createMerchant = async (req, res) => {
    try {
        const { merchant_name } = req.body;

        if (!merchant_name) {
            return res.status(404).json({ status: "error", message: "Missing required Field" });
        }

        const existing = await BudgetMerchant.findOne({ where: { merchant_name, created_by: req.user.id } });

        if (existing) {
            return res.status(400).json({ status: "error", message: "Merchant Name already exists" });
        }

        const merchant = await BudgetMerchant.create({
            merchant_name,
            created_by: req.user.id
        });

        return res.status(200).json({ status: "success", message: "Merchant created successfully" });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to create Merchant", error: error.message });
    }
};

exports.updateBudgetMerchants = async (req, res) => {
    const { id } = req.params;
    try {
        const { merchant_name } = req.body;

        const merchant = await BudgetMerchant.findByPk(id);

        if (!merchant) {
            return res.status(404).json({ status: "error", message: "Merchant not found" });
        }

        merchant.merchant_name = merchant_name;

        await merchant.save();

        return res.status(201).json({ status: "success", message: "Merchant updated successfully" });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to update Merchant", error: error.message });
    }
};

exports.listBudgetMerchants = async (req, res) => {
    try {
        const { role, id } = req.user;

        const whereCondition = {};
        if (role !== "admin") {
            whereCondition.created_by = id;
        }

        const merchants = await BudgetMerchant.findAll({
            where: whereCondition,
            include: [
                {
                    model: SystemUsers,
                    as: "creator",
                    attributes: ["name", "email"]
                }
            ]
        });

        return res.status(200).json({ status: "success", message: "Merchants listing successfully", data: merchants });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to list Merchants", error: error.message });
    }
};

exports.deleteBudgetMerchant = async (req, res) => {
    const { id } = req.params;
    try {
        const merchant = await BudgetMerchant.findByPk(id);

        if (!merchant) {
            return res.status(404).json({ status: "error", message: "Merchant not found" });
        }

        await merchant.destroy();

        return res.status(200).json({ status: "success", message: "Merchant deleted successfully" });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to delete Merchant", error: error.message });
    }
};