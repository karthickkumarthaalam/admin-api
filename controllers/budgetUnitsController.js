const db = require("../models");
const { BudgetUnits, SystemUsers } = db;

exports.createBudgetUnits = async (req, res) => {
    try {
        const { units_name } = req.body;

        if (!units_name) {
            return res.status(404).json({ status: "error", message: "Missing required Field" });
        }

        const existing = await BudgetUnits.findOne({
            where: {
                units_name, created_by: req.user.id
            }
        });

        if (existing) {
            return res.status(400).json({ status: "error", message: "Units name already exists" });
        }

        const units = await BudgetUnits.create({
            units_name,
            created_by: req.user.id
        });

        return res.status(200).json({ status: "success", message: "Units created Successfully" });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to create Budget Units", error: error.message });
    }
};

exports.updateBudgetUnits = async (req, res) => {
    const { id } = req.params;
    try {
        const { units_name } = req.body;

        const units = await BudgetUnits.findByPk(id);

        if (!units) {
            return res.status(404).json({ status: "error", message: "units not found" });
        }

        units.units_name = units_name;

        await units.save();

        return res.status(201).json({ status: "success", message: "units updated successfully" });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to update units", error: error.message });
    }
};


exports.listBudgetUnits = async (req, res) => {
    try {
        const { role, id } = req.user;
        const whereCondition = {};

        if (role !== "admin") {
            whereCondition.created_by = id;
        }

        const units = await BudgetUnits.findAll({
            where: whereCondition,
            include: [
                {
                    model: SystemUsers,
                    as: "creator",
                    attributes: ["name", "email"]
                }
            ]
        });
        return res.status(200).json({ status: "success", message: "Units listing successfully", data: units });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to list units", error: error.message });
    }
};

exports.deleteBudgetUnits = async (req, res) => {
    const { id } = req.params;
    try {
        const units = await BudgetUnits.findByPk(id);

        if (!units) {
            return res.status(404).json({ status: "error", message: "Units not found" });
        }

        await units.destroy();

        return res.status(200).json({ status: "success", message: "Units deleted successfully" });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to delete units", error: error.message });
    }
};