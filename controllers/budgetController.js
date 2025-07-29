const { Op } = require("sequelize");
const db = require("../models");
const pagination = require("../utils/pagination");
const { Budget, Currency, BudgetTaxes, BudgetTaxApplication, SystemUsers, BudgetItem } = db;

exports.getNextBudgetId = async (req, res) => {
    try {
        const lastBudget = await Budget.findOne({
            order: [["createdAt", "DESC"]]
        });

        let lastId = 1;
        const year = new Date().getFullYear();

        if (lastBudget && lastBudget.budget_id) {
            const match = lastBudget.budget_id.match(/^TMA(\d{4})(\d{3})$/);

            if (match) {
                const lastNumber = parseInt(match[2], 10);
                lastId = lastNumber + 1;
            }
        }

        const padded = String(lastId).padStart(3, "0");
        const budgetNumber = `TMA${year}${padded}`;

        return res.status(200).json({
            status: "success",
            budget_id: budgetNumber
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to generate Budget Id",
            error: error.message
        });
    }
};

exports.createBudget = async (req, res) => {
    try {
        const {
            budget_id,
            title,
            date,
            from_date,
            to_date,
            currency_id,
            description,
            multiple_date
        } = req.body;

        if (!budget_id || !title || !currency_id) {
            return res.status(400).json({
                status: "error",
                message: "Budget ID, title, and currency are required.",
            });
        }

        if (multiple_date) {
            if (!from_date || !to_date) {
                return res.status(400).json({
                    status: "error",
                    message: "From date and To date are required when multiple date is enabled.",
                });
            }
        } else {
            if (!date) {
                return res.status(400).json({
                    status: "error",
                    message: "Date is required when multiple date is disabled.",
                });
            }
        }

        const existing = await Budget.findOne({ where: { budget_id, created_by: req.user.id } });
        if (existing) {
            return res.status(409).json({
                status: "error",
                message: "Budget ID already exists.",
            });
        }

        const currency = await Currency.findByPk(currency_id);
        if (!currency) {
            return res.status(404).json({
                status: "error",
                message: "Currency not found.",
            });
        }

        const newBudget = await Budget.create({
            budget_id,
            title,
            date: multiple_date ? null : date,
            from_date: multiple_date ? from_date : null,
            to_date: multiple_date ? to_date : null,
            currency_id,
            description,
            created_by: req.user.id,
        });

        return res.status(201).json({
            status: "success",
            message: "Budget created successfully",
            data: newBudget,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to create budget",
            error: error.message,
        });
    }
};


exports.getAllBudgets = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { role, id } = req.user;

        let whereCondition = {};

        if (role !== "admin") {
            whereCondition.created_by = id;
        }

        if (req.query.search) {
            const searchQuery = req.query.search.trim();
            whereCondition[Op.or] = [
                { budget_id: { [Op.like]: `%${searchQuery}%` } },
                { title: { [Op.like]: `%${searchQuery}%` } },
            ];
        }

        const result = await pagination(Budget, {
            page,
            limit,
            where: whereCondition,
            include: [
                {
                    model: Currency,
                    as: "currency",
                },
                {
                    model: SystemUsers,
                    as: "creator",
                    attributes: ["name", "email"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            status: "success",
            message: "Budgets fetched successfully",
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch Budgets",
            error: error.message,
        });
    }
};


exports.getBudgetById = async (req, res) => {
    const { id } = req.params;
    try {
        const budget = await Budget.findByPk(id);

        if (!budget) {
            return res.status(404).json({ status: "error", message: "Budget not found" });
        }

        return res.status(200).json({ status: "success", message: "Budget fetched successfully", budget });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to fetch budget", error: error.message });
    }
};

exports.updateBudget = async (req, res) => {
    const { id } = req.params;
    try {

        const { title, description, date, from_date, to_date, multiple_date, currency_id } = req.body;

        const budget = await Budget.findByPk(id);

        if (!budget) {
            return res.status(404).json({ status: "error", message: "Budget not found" });
        }

        const currency = await Currency.findByPk(currency_id);

        if (!currency) {
            return res.status(404).json({ status: "error", message: "Currency Not found" });
        }

        if (multiple_date) {
            budget.from_date = from_date || budget.from_date;
            budget.to_date = to_date || budget.to_date;
            budget.date = null;
        } else {
            budget.date = date || budget.date;
            budget.from_date = null;
            budget.to_date = null;
        }


        budget.title = title || budget.title;
        budget.description = description || budget.description;
        budget.currency_id = currency_id || budget.currency_id;

        await budget.save();

        return res.status(200).json({ status: "success", message: "Budget updated successfully", budget });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to update Budget", error: error.message });
    }
};

exports.deleteBudget = async (req, res) => {
    const { id } = req.params;
    try {
        const budget = await Budget.findByPk(id);
        if (!budget) {
            return res.status(404).json({ status: "error", message: "budget not found" });
        }

        await BudgetTaxApplication.destroy({
            where: {
                budget_id: budget.id
            }
        });

        await budget.destroy();



        return res.status(200).json({ status: "success", message: "Budget deleted successfully" });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to delete budget", error: error.message });
    }
};

exports.applyBudgetTax = async (req, res) => {
    try {
        const { budget_id, taxes, base_amount } = req.body;

        if (!budget_id || !Array.isArray(taxes) || taxes.length === 0 || !base_amount) {
            return res.status(400).json({ status: "error", message: "Missing required fields" });
        }

        const budget = await Budget.findOne({ where: { budget_id } });

        if (!budget) {
            return res.status(404).json({ status: "error", message: "Budget not found" });
        }

        await BudgetTaxApplication.destroy({
            where: { budget_id: budget.id }
        });

        const budget_taxes = taxes.map(tax => ({
            budget_id: budget.id,
            tax_id: tax.tax_id,
            base_amount: base_amount,
            tax_amount: tax.amount
        }));

        await BudgetTaxApplication.bulkCreate(budget_taxes);

        return res.status(200).json({ status: "success", message: "Taxes updated successfully" });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to update budget tax", error: error.message });
    }
};


exports.getBudgetTax = async (req, res) => {
    const { budget_id } = req.params;

    try {
        const budget = await Budget.findByPk(budget_id);

        if (!budget) {
            return res.status(404).json({ status: "error", message: "Budget not found" });
        }

        const appliedTaxes = await BudgetTaxApplication.findAll({
            where: { budget_id },
            include: [
                {
                    model: BudgetTaxes,
                    as: "tax",
                    attributes: ['id', 'tax_name', 'tax_percentage']
                }
            ]
        });

        return res.status(200).json({
            status: "success",
            data: appliedTaxes
        });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to get budget tax", error: error.message });
    }
};

exports.duplicateBudget = async (req, res) => {
    const { budgetId } = req.params;
    const userId = req.user.id;

    const t = await db.sequelize.transaction();

    try {
        const originalBudget = await Budget.findOne({
            where: { id: budgetId },
            include: [
                { model: BudgetItem, as: "items" },
                { model: BudgetTaxApplication, as: "taxes" }
            ],
            transaction: t
        });

        if (!originalBudget) {
            await t.rollback();
            return res.status(404).json({ status: "error", message: "Original budget not found" });
        }

        const lastBudget = await Budget.findOne({ order: [["createdAt", "DESC"]], transaction: t });
        const year = new Date().getFullYear();
        let nextId = 1;

        if (lastBudget?.budget_id) {
            const match = lastBudget.budget_id.match(/^TMA(\d{4})(\d{3})$/);
            if (match) {
                const lastNum = parseInt(match[2], 10);
                nextId = lastNum + 1;
            }
        }

        const padded = String(nextId).padStart(3, "0");
        const newBudgetId = `TMA${year}${padded}`;

        const duplicatedBudget = await Budget.create({
            budget_id: newBudgetId,
            title: originalBudget.title,
            date: originalBudget.date,
            from_date: originalBudget.from_date,
            to_date: originalBudget.to_date,
            currency_id: originalBudget.currency_id,
            description: originalBudget.description,
            created_by: userId,
        }, { transaction: t });

        const clonedItems = originalBudget.items.map((item) => {
            const { id, budget_id, createdAt, updatedAt, ...rest } = item.toJSON();
            return { ...rest, budget_id: duplicatedBudget.id };
        });

        if (clonedItems.length > 0) {
            await BudgetItem.bulkCreate(clonedItems, { transaction: t });
        }

        const clonedTaxes = originalBudget.taxes.map((tax) => {
            const { id, budget_id, createdAt, updatedAt, ...rest } = tax.toJSON();
            return { ...rest, budget_id: duplicatedBudget.id };
        });

        if (clonedTaxes.length > 0) {
            await BudgetTaxApplication.bulkCreate(clonedTaxes, { transaction: t });
        }

        await t.commit();

        return res.status(201).json({
            status: "success",
            message: "Budget duplicated successfully",
            data: duplicatedBudget
        });

    } catch (error) {
        await t.rollback();
        return res.status(500).json({
            status: "error",
            message: "Failed to duplicate budget",
            error: error.message
        });
    }
};
