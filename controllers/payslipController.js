const { Op } = require("sequelize");
const db = require("../models");
const pagination = require("../utils/pagination");
const {
  Payslip,
  PayslipItem,
  PayslipComponent,
  SystemUsers,
  Currency,
  Department,
} = db;

// CREATE Payslip
exports.createPayslip = async (req, res) => {
  try {
    const {
      user_id,
      currency_id,
      month,
      items,
      payment_mode,
      paid_date,
      paid_days,
      lop_days,
      total_earnings,
      total_deductions,
      net_salary,
      conversion_currency_id,
      converted_net_salary,
    } = req.body;
    const created_by = req.user?.id || null;

    if (!user_id || !currency_id || !month) {
      return res
        .status(400)
        .json({ message: "user_id, currency_id, and month are required" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one payslip item is required" });
    }

    const payslip = await Payslip.create({
      user_id,
      currency_id,
      month,
      payment_mode,
      paid_date,
      paid_days,
      lop_days,
      total_earnings: total_earnings || 0,
      total_deductions: total_deductions || 0,
      net_salary: net_salary || 0,
      created_by,
      conversion_currency_id,
      converted_net_salary,
    });

    if (items && Array.isArray(items)) {
      for (const item of items) {
        await PayslipItem.create({
          payslip_id: payslip.id,
          component_id: item.component_id,
          type: item.type,
          name: item.name,
          amount: item.amount,
        });
      }
    }

    return res.status(201).json({
      message: "Payslip created successfully",
      data: payslip,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create payslip",
      error: error.message,
    });
  }
};

// GET all Payslips with pagination
exports.getAllPayslips = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const { role, id } = req.user;
    const { search, month } = req.query;

    const whereCondition = {};

    // Non-admin users see only their payslips
    if (role !== "admin") {
      whereCondition.created_by = id;
    }

    // Month filter
    if (month) {
      whereCondition.month = month; // expects format "YYYY-MM"
    }

    // Search filter: employee name, email, department name
    const searchCondition = search
      ? {
          [Op.or]: [
            { "$user.name$": { [Op.iLike]: `%${search}%` } },
            { "$user.email$": { [Op.iLike]: `%${search}%` } },
            {
              "$user.department.department_name$": {
                [Op.iLike]: `%${search}%`,
              },
            },
          ],
        }
      : {};

    const result = await pagination(Payslip, {
      page,
      limit,
      where: { ...whereCondition, ...searchCondition },
      include: [
        {
          model: SystemUsers,
          as: "user",
          attributes: [
            "id",
            "employee_id",
            "name",
            "email",
            "bank_name",
            "account_number",
            "pan_number",
            "ifsc_code",
          ],
          include: [
            {
              model: Department,
              as: "department",
              attributes: ["id", "department_name"],
            },
          ],
        },
        {
          model: Currency,
          as: "currency",
          attributes: ["id", "code", "symbol"],
        },
        {
          model: Currency,
          as: "conversionCurrency",
          attributes: ["id", "code", "symbol"],
        },
        {
          model: PayslipItem,
          as: "items",
          include: [{ model: PayslipComponent, as: "component" }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Payslips fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch payslips",
      error: error.message,
    });
  }
};
// GET Payslip by ID
exports.getPayslipById = async (req, res) => {
  try {
    const { id } = req.params;

    const payslip = await Payslip.findByPk(id, {
      include: [
        {
          model: SystemUsers,
          as: "user",
          include: [
            {
              model: Department,
              as: "department",
              attributes: ["id", "department_name"],
            },
          ],
        },
        {
          model: Currency,
          as: "currency",
          attributes: ["id", "code", "symbol"],
        },
        {
          model: PayslipItem,
          as: "items",
          include: [{ model: PayslipComponent, as: "component" }],
        },
      ],
    });

    if (!payslip)
      return res
        .status(404)
        .json({ success: false, message: "Payslip not found" });

    res.status(200).json({ success: true, data: payslip });
  } catch (error) {
    console.error("Error fetching payslip:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching payslip", error });
  }
};

// UPDATE Payslip
exports.updatePayslip = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      month,
      currency_id,
      items,
      payment_mode,
      paid_date,
      paid_days,
      lop_days,
      total_earnings,
      total_deductions,
      net_salary,
      converted_net_salary,
      conversion_currency_id,
    } = req.body;

    // Fetch payslip with items
    const payslip = await Payslip.findByPk(id, {
      include: [{ model: PayslipItem, as: "items" }],
    });
    if (!payslip) return res.status(404).json({ message: "Payslip not found" });

    // Update main payslip fields
    payslip.month = month ?? payslip.month;
    payslip.payment_mode = payment_mode ?? payslip.payment_mode;
    payslip.paid_date = paid_date ?? payslip.paid_date;
    payslip.currency_id = currency_id ?? payslip.currency_id;
    payslip.paid_days = paid_days ?? payslip.paid_days;
    payslip.lop_days = lop_days ?? payslip.lop_days;
    payslip.total_earnings = total_earnings ?? payslip.total_earnings;
    payslip.total_deductions = total_deductions ?? payslip.total_deductions;
    payslip.net_salary = net_salary ?? payslip.net_salary;
    payslip.conversion_currency_id =
      conversion_currency_id ?? payslip.conversion_currency_id;
    payslip.converted_net_salary =
      converted_net_salary ?? payslip.converted_net_salary;

    await payslip.save();

    if (items && Array.isArray(items)) {
      const existingItems = payslip.items || [];

      // Map existing items by id for easy lookup
      const existingMap = new Map(existingItems.map((i) => [i.id, i]));

      const itemsToUpdate = [];
      const itemsToCreate = [];
      const incomingIds = new Set();

      for (const item of items) {
        if (item.id && existingMap.has(item.id)) {
          // Existing item -> check if any field changed
          const oldItem = existingMap.get(item.id);
          if (
            oldItem.component_id !== item.component_id ||
            oldItem.name !== item.name ||
            oldItem.type !== item.type ||
            Number(oldItem.amount) !== Number(item.amount)
          ) {
            itemsToUpdate.push({ ...item });
          }
          incomingIds.add(item.id);
        } else {
          // New item
          itemsToCreate.push({ ...item });
        }
      }

      // Items to delete = existing items that are not in incoming items
      const itemsToDelete = existingItems.filter((i) => !incomingIds.has(i.id));

      // Perform updates
      for (const item of itemsToUpdate) {
        await PayslipItem.update(
          {
            component_id: item.component_id,
            name: item.name,
            type: item.type,
            amount: item.amount,
          },
          { where: { id: item.id } }
        );
      }

      // Perform deletions
      for (const item of itemsToDelete) {
        await PayslipItem.destroy({ where: { id: item.id } });
      }

      // Perform inserts
      for (const item of itemsToCreate) {
        await PayslipItem.create({
          payslip_id: id,
          component_id: item.component_id,
          name: item.name,
          type: item.type,
          amount: item.amount,
        });
      }
    }

    res.status(200).json({
      message: "Payslip updated successfully",
      data: payslip,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update payslip", error: error.message });
  }
};

// DELETE Payslip
exports.deletePaySlip = async (req, res) => {
  try {
    const { id } = req.params;
    const payslip = await Payslip.findByPk(id);

    if (!payslip)
      return res
        .status(404)
        .json({ success: false, message: "Payslip not found" });

    await payslip.destroy();
    res
      .status(200)
      .json({ success: true, message: "Payslip deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error deleting payslip", error });
  }
};

// RESTORE Payslip
exports.restorePaySlip = async (req, res) => {
  try {
    const { id } = req.params;

    const payslip = await Payslip.findOne({ where: { id }, paranoid: false });
    if (!payslip)
      return res
        .status(404)
        .json({ success: false, message: "Payslip not found" });

    if (!payslip.deletedAt)
      return res
        .status(400)
        .json({ success: false, message: "Payslip is not deleted" });

    await payslip.restore();
    res.status(200).json({
      success: true,
      message: "Payslip restored successfully",
      data: payslip,
    });
  } catch (error) {
    console.error("Error restoring payslip:", error);
    res
      .status(500)
      .json({ success: false, message: "Error restoring payslip", error });
  }
};

exports.verifyData = async (req, res) => {
  try {
    const id = parseInt(req.query.id, 10);

    const payslip = await Payslip.findByPk(id, {
      include: [
        {
          model: SystemUsers,
          as: "user",
          attributes: ["name", "employee_id"],
          include: [
            {
              model: Department,
              as: "department",
              attributes: ["department_name"],
            },
          ],
        },
        {
          model: Currency,
          as: "currency",
          attributes: ["symbol"],
        },
        {
          model: Currency,
          as: "conversionCurrency",
          attributes: ["code", "symbol"],
        },
      ],
    });

    if (!payslip) {
      return res
        .status(404)
        .json({ success: false, message: "payslip not found" });
    }

    res.status(200).json({ success: true, payslip });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error showing verify" });
  }
};
