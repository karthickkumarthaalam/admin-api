const fs = require("fs");
const db = require("../models");
const { Op, fn, col, where } = require("sequelize");
const {
  Expenses,
  ExpenseCategory,
  PaidThrough,
  PaymentMode,
  Currency,
  SystemUsers,
} = db;
const pagination = require("../utils/pagination");
const {
  uploadToCpanel,
  deleteFromCpanel,
} = require("../services/uploadToCpanel");

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
      completed_date,
      pending_amount,
      remarks,
    } = req.body;

    if (
      !merchant ||
      !date ||
      !Array.isArray(expenseCategories) ||
      expenseCategories.length === 0
    ) {
      await t.rollback();
      return res
        .status(400)
        .json({ status: "error", message: "Missing required fields" });
    }

    if (status === "completed" && (!payment_mode || !paid_through)) {
      await t.rollback();
      return res.status(400).json({
        status: "error",
        message: "payment mode and paid through are required",
      });
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
      pending_amount,
      remarks,
      created_by: req.user.id,
    };

    if (status === "completed") {
      const paymentMode = await PaymentMode.findOne({
        where: { name: payment_mode },
        transaction: t,
      });
      if (!paymentMode) throw new Error("Payment method not found");

      const paidThrough = await PaidThrough.findOne({
        where: { name: paid_through },
        transaction: t,
      });
      if (!paidThrough) throw new Error("Paid through not found");

      expensePayload.payment_mode = paymentMode.id;
      expensePayload.paid_through = paidThrough.id;
    }

    const newExpense = await Expenses.create(expensePayload, {
      transaction: t,
    });

    const categoryData = [];

    for (const category of expenseCategories) {
      const currency = await Currency.findOne({
        where: { currency_name: category.currency_name },
        transaction: t,
      });
      if (!currency)
        throw new Error(`Currency "${category.currency_name}" not found`);

      categoryData.push({
        expense_id: newExpense.id,
        category_name: category.category_name,
        description: category.description || null,
        amount: category.amount,
        actual_amount: category?.actual_amount || 0,
        paid_date: category?.paid_date || null,
        currency_id: currency.id,
        status: "pending",
      });
    }

    await ExpenseCategory.bulkCreate(categoryData, { transaction: t });

    await t.commit();
    return res.status(201).json({
      message: "Expense and categories created successfully",
      data: newExpense,
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      status: "error",
      message: "Failed to create expense",
      error: error.message,
    });
  }
};

exports.getAllExpenses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const month = req.query.month;
    const showDeleted = req.query.show_deleted === "true";

    const from_date = req.query.from_date;
    const to_date = req.query.to_date;

    const { role, id } = req.user;

    const whereCondition = {};

    if (role !== "admin") {
      whereCondition.created_by = id;
    }

    whereCondition.is_deleted = showDeleted;

    // Search condition
    if (search) {
      whereCondition[Op.or] = [
        { merchant: { [Op.like]: `%${search}%` } },
        { document_id: { [Op.like]: `%${search}%` } },
      ];
    }

    if (!showDeleted) {
      if (from_date && to_date) {
        whereCondition.date = {
          [Op.between]: [from_date, to_date],
        };
      } else if (from_date) {
        whereCondition.date = {
          [Op.gte]: from_date,
        };
      } else if (to_date) {
        whereCondition.date = {
          [Op.lte]: to_date,
        };
      } else if (month) {
        whereCondition[Op.and] = [where(fn("MONTH", col("date")), month)];
      }
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
        {
          model: SystemUsers,
          as: "creator",
          attributes: ["name", "email"],
          required: false,
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
          include: [{ model: Currency, as: "currency" }],
        },
        {
          model: PaidThrough,
          as: "paidThrough",
        },
        {
          model: PaymentMode,
          as: "paymentMode",
        },
      ],
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Expense Fetched Successfully",
      expense,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch Expense",
      error: error.message,
    });
  }
};

exports.updateExpenseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const expense = await Expenses.findByPk(id);
    if (!expense) {
      return res
        .status(404)
        .json({ status: "error", message: "Expense not found" });
    }

    if (!["pending", "completed"].includes(status)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid status value" });
    }

    await expense.update({ status });

    return res
      .status(200)
      .json({ message: "Expense status updated", data: expense });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update status", error: error.message });
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
      completed_date,
      pending_amount,
      remarks,
    } = req.body;

    const { id } = req.params;

    if (
      !merchant ||
      !date ||
      !Array.isArray(expenseCategories) ||
      expenseCategories.length === 0
    ) {
      await t.rollback();
      return res
        .status(400)
        .json({ status: "error", message: "Missing required fields" });
    }

    const existingExpense = await Expenses.findByPk(id, { transaction: t });
    if (!existingExpense) {
      await t.rollback();
      return res
        .status(404)
        .json({ status: "error", message: "Expense not found" });
    }

    let paymentModeId = null;
    let paidThroughId = null;

    if (status === "completed") {
      const paymentMode = await PaymentMode.findOne({
        where: { name: payment_mode },
        transaction: t,
      });
      if (!paymentMode) throw new Error("Payment method not found");

      const paidThrough = await PaidThrough.findOne({
        where: { name: paid_through },
        transaction: t,
      });
      if (!paidThrough) throw new Error("Paid through not found");

      paymentModeId = paymentMode.id;
      paidThroughId = paidThrough.id;
    }

    const total_amount = expenseCategories.reduce((sum, item) => {
      return sum + parseInt(item.amount || 0);
    }, 0);

    await existingExpense.update(
      {
        merchant: merchant,
        date,
        total_amount,
        vendor_type,
        status,
        completed_date,
        payment_mode: paymentModeId,
        paid_through: paidThroughId,
        pending_amount,
        remarks,
      },
      { transaction: t }
    );

    await ExpenseCategory.destroy({
      where: { expense_id: id },
      transaction: t,
    });

    const newCategoryData = [];

    for (const category of expenseCategories) {
      const currency = await Currency.findOne({
        where: { currency_name: category.currency_name },
        transaction: t,
      });
      if (!currency)
        throw new Error(`Currency "${category.currency_name}" not found`);

      newCategoryData.push({
        expense_id: id,
        category_name: category.category_name,
        description: category.description || null,
        amount: category.amount,
        actual_amount: category?.actual_amount || 0,
        paid_date: category?.paid_date || null,
        currency_id: currency.id,
        status: "pending",
      });
    }

    await ExpenseCategory.bulkCreate(newCategoryData, { transaction: t });

    await t.commit();
    return res.status(200).json({
      status: "success",
      message: "Expense and categories updated successfully",
      data: existingExpense,
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      status: "error",
      message: "Failed to update expense",
      error: error.message,
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
      return res
        .status(404)
        .json({ status: "error", message: "Expense not found" });
    }

    expense.is_deleted = true;
    expense.deleted_at = new Date();
    await expense.save({ transaction });

    await transaction.commit();
    return res
      .status(200)
      .json({ message: "Expense soft-deleted successfully" });
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
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update expense category status",
      error: error.message,
    });
  }
};

exports.updateCategoryBill = async (req, res) => {
  const { id } = req.params;
  const bill = req.files["bill"] ? req.files["bill"][0] : null;

  try {
    const category = await ExpenseCategory.findByPk(id);
    if (!category) {
      return res
        .status(404)
        .json({ status: "error", message: "Category not found" });
    }

    if (!bill) {
      return res
        .status(400)
        .json({ status: "error", message: "Bill file is required" });
    }

    if (category.bill_drive_link) {
      const remoteFolder = "expense/bills";
      const existingFileName = category.bill_drive_link.split("/").pop();
      await deleteFromCpanel(remoteFolder, existingFileName);
    }

    const remoteFolder = "expense/bills";
    const billUrl = await uploadToCpanel(
      bill.path,
      remoteFolder,
      bill.originalname
    );

    await category.update({
      bill_drive_link: billUrl,
    });

    fs.unlinkSync(bill.path);

    return res.status(200).json({
      status: "success",
      message: "Bill uploaded successfully",
      data: category,
    });
  } catch (error) {
    if (bill && fs.existsSync(bill.path)) fs.unlinkSync(bill.path);
    return res.status(500).json({
      status: "error",
      message: "Failed to upload bill",
      error: error.message,
    });
  }
};

exports.deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await ExpenseCategory.findByPk(id);
    if (!category) {
      return res
        .status(404)
        .json({ status: "error", message: "Category not found" });
    }

    if (category.bill_drive_link) {
      const remoteFolder = "expense/bills";
      const fileName = category.bill_drive_link.split("/").pop();
      await deleteFromCpanel(remoteFolder, fileName);
    }

    await category.update({
      bill_drive_link: null,
    });

    return res.status(200).json({
      status: "success",
      message: "Bill deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete bill",
      error: error.message,
    });
  }
};

exports.restoreExpense = async (req, res) => {
  const { id } = req.params;
  try {
    const expense = await Expenses.findByPk(id);

    if (!expense || !expense.is_deleted) {
      return res
        .status(404)
        .json({ status: "error", message: "Expense not found" });
    }

    expense.is_deleted = false;
    expense.deleted_at = null;

    await expense.save();

    return res.status(200).json({
      status: "success",
      message: "Expense Restored Successfully",
      expense,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to restore Expenses",
      error: error.message,
    });
  }
};

exports.expensesReport = async (req, res) => {
  try {
    const { role, id } = req.user;
    const { year, merchant } = req.query;

    const selectedYear = year || new Date().getFullYear();

    const whereClause = {
      is_deleted: false,
      date: {
        [Op.between]: [`${selectedYear}-01-01`, `${selectedYear}-12-31`],
      },
    };

    if (role !== "admin") {
      whereClause.created_by = id;
    }

    if (merchant) {
      whereClause.merchant = {
        [Op.like]: `%${merchant}%`,
      };
    }

    // Step 1️⃣: Fetch expense + category totals
    const expenses = await Expenses.findAll({
      attributes: [
        [fn("MONTH", col("date")), "month"],
        [col("categories.currency_id"), "currency_id"],
        [col("categories.currency.symbol"), "currency_symbol"],
        [col("categories.currency.currency_name"), "currency_name"],
        [fn("SUM", col("categories.amount")), "total_amount"],
      ],
      include: [
        {
          model: ExpenseCategory,
          as: "categories",
          attributes: [],
          include: [
            {
              model: Currency,
              as: "currency",
              attributes: [],
            },
          ],
        },
      ],
      where: whereClause,
      group: [
        fn("MONTH", col("date")),
        col("categories.currency_id"),
        col("categories.currency.symbol"),
        col("categories.currency.currency_name"),
      ],
      order: [
        [col("categories.currency_id"), "ASC"],
        [fn("MONTH", col("date")), "ASC"],
      ],
      raw: true,
    });

    const pendingRaw = await Expenses.findAll({
      attributes: [[fn("MONTH", col("date")), "month"], "id", "pending_amount"],
      where: whereClause,
      include: [
        {
          model: ExpenseCategory,
          as: "categories",
          attributes: ["currency_id"],
        },
      ],
      raw: true,
    });

    const pendingMap = {};
    const seen = new Set();

    for (const row of pendingRaw) {
      const month = row.month;
      const cid = row["categories.currency_id"];
      const expenseId = row.id;

      if (!cid) continue;

      const uniqueKey = `${expenseId}-${month}-${cid}`;
      if (seen.has(uniqueKey)) continue;

      seen.add(uniqueKey);

      const monthCurrencyKey = `${month}-${cid}`;
      pendingMap[monthCurrencyKey] =
        (pendingMap[monthCurrencyKey] || 0) + Number(row.pending_amount || 0);
    }

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const currencies = [...new Set(expenses.map((e) => e.currency_id))];

    const report = currencies.map((cid) => {
      const currencyData = expenses.filter((e) => e.currency_id === cid);
      const symbol = currencyData[0]?.currency_symbol || "";
      const currency_name = currencyData[0]?.currency_name || "";

      const monthData = months.map((month, index) => {
        const match = currencyData.find((m) => Number(m.month) === index + 1);
        const pendingAmt = pendingMap[`${index + 1}-${cid}`] || 0;

        return {
          month,
          total_amount: match ? Number(match.total_amount) : 0,
          pending_amount: pendingAmt,
        };
      });

      const year_total = monthData.reduce((a, b) => a + b.total_amount, 0);
      const pending_total = monthData.reduce((a, b) => a + b.pending_amount, 0);

      return {
        currency_id: cid,
        currency_symbol: symbol,
        currency_name,
        months: monthData,
        year_total,
        pending_total,
      };
    });

    return res.status(200).json({
      status: "success",
      year: selectedYear,
      data: report,
    });
  } catch (error) {
    console.error("❌ Expense report error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch report",
      error: error.message,
    });
  }
};
