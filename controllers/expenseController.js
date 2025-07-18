const fs = require("fs");
const db = require("../models");
const { Op, fn, col, where } = require("sequelize");
const { Expenses, ExpenseCategory, PaidThrough, PaymentMode, Currency } = db;
const pagination = require("../utils/pagination");
const { deletePdfFile, uploadPdfFile } = require("../services/googleDriveService");

exports.getNextDocumentNumber = async (req, res) => {
    try {
        const lastExpense = await Expenses.findOne({
            order: [["createdAt", "DESC"]],
        });

        let lastId = 1;
        const year = new Date().getFullYear();

        if (lastExpense && lastExpense.document_id) {
            const match = lastExpense.document_id.match(/^TMA(\d{4})(\d{3})$/);
            if (match) {
                const lastNumber = parseInt(match[2], 10);
                lastId = lastNumber + 1;
            }
        }

        const padded = String(lastId).padStart(3, "0");
        const documentNumber = `TMA${year}${padded}`;

        return res.status(200).json({
            status: "success",
            document_no: documentNumber,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to generate document number",
            error: error.message,
        });
    }
};

exports.createExpenseWithCategories = async (req, res) => {
    const t = await db.sequelize.transaction();

    try {
        const {
            document_no,
            merchant,
            date,
            expenseCategories = [],
            status = "pending",
            vendor_type = "vendor",
            payment_mode,
            paid_through,
            completed_date
        } = req.body;

        if (!merchant || !date || !Array.isArray(expenseCategories) || expenseCategories.length === 0) {
            await t.rollback();
            return res.status(400).json({ status: "error", message: "Missing required fields" });
        }

        if (status === "completed" && (!payment_mode || !paid_through)) {
            await t.rollback();
            return res.status(400).json({ status: "error", message: "payment mode and paid through are required" });
        }


        const total_amount = expenseCategories.reduce((sum, item) => {
            return sum + parseInt(item.amount || 0);
        }, 0);

        const expensePayload = {
            merchant: merchant,
            document_id: document_no,
            date,
            total_amount,
            vendor_type,
            status,
            completed_date,
            pending_amount: status === "pending" ? total_amount : 0
        };

        if (status === "completed") {
            const paymentMode = await PaymentMode.findOne({ where: { name: payment_mode }, transaction: t });
            if (!paymentMode) throw new Error("Payment method not found");

            const paidThrough = await PaidThrough.findOne({ where: { name: paid_through }, transaction: t });
            if (!paidThrough) throw new Error("Paid through not found");

            expensePayload.payment_mode = paymentMode.id;
            expensePayload.paid_through = paidThrough.id;
        }

        const newExpense = await Expenses.create(expensePayload, { transaction: t });

        const categoryData = [];

        for (const category of expenseCategories) {
            const currency = await Currency.findOne({ where: { currency_name: category.currency_name }, transaction: t });
            if (!currency) throw new Error(`Currency "${category.currency_name}" not found`);

            categoryData.push({
                expense_id: newExpense.id,
                category_name: category.category_name,
                description: category.description || null,
                amount: category.amount,
                currency_id: currency.id,
                status: "pending"
            });
        }

        await ExpenseCategory.bulkCreate(categoryData, { transaction: t });

        await t.commit();
        return res.status(201).json({ message: "Expense and categories created successfully", data: newExpense });

    } catch (error) {
        await t.rollback();
        return res.status(500).json({ status: "error", message: "Failed to create expense", error: error.message });
    }
};

exports.getAllExpenses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || "";
        const month = req.query.month; // Expect "07"
        const year = req.query.year;   // Expect "2025"

        const whereCondition = {};

        // Search condition
        if (search) {
            whereCondition[Op.or] = [
                { merchant: { [Op.like]: `%${search}%` } },
                { document_id: { [Op.like]: `%${search}%` } },
            ];
        }

        if (month && year) {
            whereCondition[Op.and] = [
                where(fn("MONTH", col("date")), month),
                where(fn("YEAR", col("date")), year),
            ];
        }

        const result = await pagination(Expenses, {
            page,
            limit,
            where: whereCondition,
            include: [
                {
                    model: PaidThrough,
                    as: "paidThrough",
                    attributes: ["name"],
                },
                {
                    model: PaymentMode,
                    as: "paymentMode",
                    attributes: ["name"],
                },
                {
                    model: ExpenseCategory,
                    as: "categories",
                    include: [
                        {
                            model: Currency,
                            as: "currency",
                            attributes: ["currency_name", "symbol"],
                        },
                    ],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            message: "Expenses fetched successfully",
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch expenses",
            error: error.message,
        });
    }
};

exports.getExpenseById = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await Expenses.findByPk(id, {
            include: [
                {
                    model: ExpenseCategory,
                    as: "categories",
                    include: [{ model: Currency, as: "currency" }]
                },
                {
                    model: PaidThrough,
                    as: "paidThrough",
                },
                {
                    model: PaymentMode,
                    as: "paymentMode"
                }
            ]
        });

        if (!expense) {
            return res.status(404).json({ error: "Expense not found" });
        }

        res.status(200).json(expense);

    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to fetch Expense", error: error.message });
    }
};

exports.updateExpenseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const expense = await Expenses.findByPk(id);
        if (!expense) {
            return res.status(404).json({ status: "error", message: "Expense not found" });
        }

        if (!["pending", "completed"].includes(status)) {
            return res.status(400).json({ status: "error", message: "Invalid status value" });
        }

        await expense.update({ status });

        return res.status(200).json({ message: "Expense status updated", data: expense });
    } catch (error) {
        return res.status(500).json({ message: "Failed to update status", error: error.message });
    }
};


exports.updateExpenseWithCategories = async (req, res) => {
    const t = await db.sequelize.transaction();

    try {
        const {
            merchant,
            date,
            expenseCategories = [],
            status,
            vendor_type,
            payment_mode,
            paid_through,
            completed_date
        } = req.body;

        const { id } = req.params;

        if (!merchant || !date || !Array.isArray(expenseCategories) || expenseCategories.length === 0) {
            await t.rollback();
            return res.status(400).json({ status: "error", message: "Missing required fields" });
        }

        const existingExpense = await Expenses.findByPk(id, { transaction: t });
        if (!existingExpense) {
            await t.rollback();
            return res.status(404).json({ status: "error", message: "Expense not found" });
        }

        let paymentModeId = null;
        let paidThroughId = null;

        if (status === "completed") {
            const paymentMode = await PaymentMode.findOne({ where: { name: payment_mode }, transaction: t });
            if (!paymentMode) throw new Error("Payment method not found");

            const paidThrough = await PaidThrough.findOne({ where: { name: paid_through }, transaction: t });
            if (!paidThrough) throw new Error("Paid through not found");

            paymentModeId = paymentMode.id;
            paidThroughId = paidThrough.id;
        }

        const total_amount = expenseCategories.reduce((sum, item) => {
            return sum + parseInt(item.amount || 0);
        }, 0);

        await existingExpense.update({
            merchant: merchant,
            date,
            total_amount,
            vendor_type,
            status,
            completed_date,
            payment_mode: paymentModeId,
            paid_through: paidThroughId,
            pending_amount: status === "pending" ? total_amount : 0
        }, { transaction: t });

        await ExpenseCategory.destroy({ where: { expense_id: id }, transaction: t });

        const newCategoryData = [];

        for (const category of expenseCategories) {
            const currency = await Currency.findOne({ where: { currency_name: category.currency_name }, transaction: t });
            if (!currency) throw new Error(`Currency "${category.currency_name}" not found`);

            newCategoryData.push({
                expense_id: id,
                category_name: category.category_name,
                description: category.description || null,
                amount: category.amount,
                currency_id: currency.id,
                status: "pending"
            });
        }

        await ExpenseCategory.bulkCreate(newCategoryData, { transaction: t });

        await t.commit();
        return res.status(200).json({
            status: "success",
            message: "Expense and categories updated successfully",
            data: existingExpense
        });

    } catch (error) {
        await t.rollback();
        return res.status(500).json({
            status: "error",
            message: "Failed to update expense",
            error: error.message
        });
    }
};

exports.deleteExpense = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { id } = req.params;

        const expense = await Expenses.findByPk(id, { transaction });
        if (!expense) {
            await transaction.rollback();
            return res.status(404).json({ status: "error", message: "Expense not found" });
        }

        const categories = await ExpenseCategory.findAll({
            where: { expense_id: id },
            transaction,
        });

        await Promise.all(
            categories.map(async (category) => {
                if (category.bill_drive_file_id) {
                    try {
                        await deletePdfFile(category.bill_drive_file_id);
                    } catch (err) {
                        console.error(`Failed to delete Drive file for category ${category.id}: ${err.message}`);
                    }
                }
            })
        );

        await ExpenseCategory.destroy({ where: { expense_id: id }, transaction });
        await expense.destroy({ transaction });

        await transaction.commit();

        return res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({
            status: "error",
            message: "Failed to delete expense",
            error: error.message,
        });
    }
};


exports.updateExpenseCategoryStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const category = await ExpenseCategory.findByPk(id);

        if (!category) {
            return res.status(404).json({ message: "Expense category not found" });
        }

        await category.update({ status });

        return res.status(200).json({
            message: "Expense category status updated successfully",
            data: category
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to update expense category status",
            error: error.message
        });
    }
};

exports.updateCategoryBill = async (req, res) => {
    const { id } = req.params;
    const bill = req.files["bill"] ? req.files["bill"][0] : null;
    try {
        const category = await ExpenseCategory.findByPk(id);
        if (!category) {
            return res.status(404).json({ status: "error", message: "category not found" });
        }

        if (!bill) {
            return res.status(404).json({ status: "error", message: "Bill not found" });
        }

        if (category.bill_drive_file_id) {
            await deletePdfFile(category.bill_drive_file_id);
        }

        const billBuffer = fs.readFileSync(bill.path);
        const billUpload = await uploadPdfFile(
            billBuffer,
            bill.originalname,
            process.env.GOOGLE_DRIVE_EXPENSE_FOLDER_ID
        );

        await category.update({
            bill_drive_file_id: billUpload.id,
            bill_drive_link: billUpload.webViewLink
        });

        fs.unlinkSync(bill.path);

        return res.status(200).json({ status: "success", message: "Bill updated successfully" });

    } catch (error) {
        if (bill && fs.existsSync(bill.path)) fs.unlinkSync(bill.path);
        return res.status(500).json({ status: "error", message: "Failed to Add Category Bill", error: error.message });
    }
};


exports.deleteBill = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await ExpenseCategory.findByPk(id);
        if (!category) return res.status(404).json({ status: "error", message: "category not found" });

        await deletePdfFile(category.bill_drive_file_id);

        await category.update({
            bill_drive_file_id: null,
            bill_drive_link: null
        });
        return res.json({ status: "success", message: "File deleted successfully" });

    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to delete bill", error: error.message });
    }
};