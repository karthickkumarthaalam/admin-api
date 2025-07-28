const db = require("../models");
const { Budget, BudgetItem } = db;

exports.createBudgetItems = async (req, res) => {
    try {
        const { budget_id, budget_items } = req.body;

        if (!budget_id || !Array.isArray(budget_items) || budget_items.length === 0) {
            return res.status(400).json({ status: "error", message: "Missing required fields" });
        }

        const budget = await Budget.findOne({
            where: {
                budget_id
            }
        });

        if (!budget) {
            return res.status(404).json({ status: "error", message: "Budget not found" });
        }

        const itemsToCreate = budget_items.map((item) => ({
            budget_id: budget.id,
            category: item.category,
            sub_category: item.sub_category,
            merchant: item.merchant,
            amount: item.amount,
            quantity: item.quantity || 1,
            units: item.units,
            total_amount: item.total_amount,
            actual_amount: item.actual_amount !== "" ? item.actual_amount : null,
            description: item.description,
            budget_type: item.budget_type
        }));

        await BudgetItem.bulkCreate(itemsToCreate);

        return res.status(200).json({ status: "success", message: "Budget Categories created" });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to create Budget Categories", error: error.message });
    }
};


exports.getBudgetItemsByBudgetId = async (req, res) => {
    const { budget_id } = req.params;
    const { budget_type } = req.query;

    try {
        const budget = await Budget.findOne({ where: { budget_id } });

        if (!budget) {
            return res.status(404).json({ status: "error", message: "Budget not found" });
        }

        const whereCondition = { budget_id: budget.id };

        if (budget_type) {
            whereCondition.budget_type = budget_type;
        }

        const items = await BudgetItem.findAll({
            where: whereCondition,
            order: [["id", "ASC"]],
        });

        return res.status(200).json({
            status: "success",
            message: "Budget items fetched successfully",
            data: items,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch budget items",
            error: error.message,
        });
    }
};


exports.updateBudgetItems = async (req, res) => {
    const t = await db.sequelize.transaction();
    const { budget_id } = req.params;
    try {
        const { budget_items } = req.body;

        if (!Array.isArray(budget_items) || budget_items.length === 0) {
            await t.rollback();
            return res.status(400).json({
                status: "error",
                message: "budget_items must be a non-empty array"
            });
        }

        const budget = await Budget.findOne({
            where: {
                budget_id
            },
            transaction: t
        });
        if (!budget) {
            await t.rollback();
            return res.status(404).json({ status: "error", message: "budget not found" });
        }
        await BudgetItem.destroy({
            where: {
                budget_id: budget.id,
                budget_type: budget_items[0].budget_type
            },
            transaction: t
        });
        const newItems = budget_items.map(item => ({
            budget_id: budget.id,
            category: item.category,
            sub_category: item.sub_category,
            merchant: item.merchant,
            amount: item.amount,
            quantity: item.quantity || null,
            units: item.units || null,
            total_amount: item.total_amount,
            actual_amount: item.actual_amount !== "" ? item.actual_amount : null,
            description: item.description || "",
            budget_type: item.budget_type || "expense"
        }));
        const createdItems = await BudgetItem.bulkCreate(newItems, { transaction: t });

        await t.commit();

        return res.status(200).json({
            status: "success",
            message: "Budget items updated successfully",
            data: createdItems
        });
    } catch (error) {
        await t.rollback();
        return res.status(500).json({
            status: "error",
            message: "Failed to updated budget items",
            error: error.message
        });
    }
};
