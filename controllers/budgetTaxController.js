const db = require("../models");
const pagination = require("../utils/pagination");
const { BudgetTaxes, SystemUsers } = db;

exports.createTax = async (req, res) => {
    try {
        const { tax_name, tax_percentage, description } = req.body;

        const existing = await BudgetTaxes.findOne({
            where: {
                tax_name,
                created_by: req.user.id
            }
        });

        if (existing) {
            return res.status(400).json({ status: "error", message: "Tax already exists" });
        }

        const tax = await BudgetTaxes.create({
            tax_name,
            tax_percentage,
            description,
            created_by: req.user.id
        });

        return res.status(201).json({ status: "success", message: "Tax created successfully", tax });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to create tax", error: error.message });
    }
};

exports.getAllTaxes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { role, id } = req.user;

        const whereCondition = role === "admin" ? {} : { created_by: id };

        if (req.query.is_active !== undefined) {
            whereCondition.is_active = req.query.is_active === "true";
        }

        const results = await pagination(BudgetTaxes, {
            page,
            limit,
            where: whereCondition,
            include: [
                {
                    model: SystemUsers,
                    as: "creator",
                    attributes: ["name", "email"]
                }
            ],
            order: [["id", "DESC"]]
        });

        return res.status(200).json({
            status: "success",
            message: "Taxes fetched successfully",
            data: results.data,
            pagination: results.pagination
        });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to list taxes", error: error.message });
    }
};

exports.getTaxById = async (req, res) => {
    try {
        const tax = await BudgetTaxes.findByPk(req.params.id);

        if (!tax) {
            return res.status(404).json({ status: "error", message: "Tax not found" });
        }

        return res.status(200).json({ status: "success", tax });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to fetch tax", error: error.message });
    }
};

exports.updateTax = async (req, res) => {
    try {
        const { id } = req.params;
        const { tax_name, tax_percentage, description } = req.body;

        const tax = await BudgetTaxes.findByPk(id);
        if (!tax) {
            return res.status(404).json({ status: "error", message: "Tax not found" });
        }

        await tax.update({ tax_name, tax_percentage, description });

        return res.status(200).json({ status: "success", message: "Tax updated successfully", tax });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to update tax", error: error.message });
    }
};

exports.deleteTax = async (req, res) => {
    try {
        const tax = await BudgetTaxes.findByPk(req.params.id);

        if (!tax) {
            return res.status(404).json({ status: "error", message: "Tax not found" });
        }

        await tax.destroy();

        return res.status(200).json({ status: "success", message: "Tax deleted successfully" });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to delete tax", error: error.message });
    }
};

exports.toggleTaxStatus = async (req, res) => {
    try {
        const tax = await BudgetTaxes.findByPk(req.params.id);

        if (!tax) {
            return res.status(404).json({ status: "error", message: "Tax not found" });
        }

        tax.is_active = !tax.is_active;
        await tax.save();

        return res.status(200).json({ status: "success", message: `Tax ${tax.is_active ? 'activated' : 'deactivated'} successfully`, tax });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to toggle tax status", error: error.message });
    }
};
