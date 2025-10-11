const fs = require("fs");
const {
  sequelize,
  ExpenseBill,
  ExpenseBillItem,
  SystemUsers,
  Currency,
} = require("../models");
const {
  uploadToCpanel,
  deleteFromCpanel,
} = require("../services/uploadToCpanel");

const pagination = require("../utils/pagination");
const { Op } = require("sequelize");

exports.createExpenseBill = async (req, res) => {
  const t = await sequelize.transaction();
  const uploadedFiles = [];

  try {
    const {
      financial_year_id,
      title,
      vendor,
      start_date,
      end_date,
      type,
      currency_id,
      amount,
    } = req.body;

    const expenseBill = await ExpenseBill.create(
      {
        financial_year_id,
        title,
        vendor,
        start_date,
        end_date,
        type,
        currency_id,
        amount,
        created_by: req.user?.id || null,
      },
      { transaction: t }
    );

    const uploadedBillItems = [];

    if (req.files?.length > 0) {
      for (const file of req.files) {
        const remoteFolder = "expense/bills";
        const remoteFileName = `${expenseBill.id}_${file.originalname}`;

        try {
          const remoteUrl = await uploadToCpanel(
            file.path,
            remoteFolder,
            remoteFileName
          );

          const billItem = await ExpenseBillItem.create(
            {
              expense_bill_id: expenseBill.id,
              bill_address: remoteUrl,
              created_by: req?.user.id || null,
            },
            { transaction: t }
          );

          uploadedBillItems.push(billItem);
          uploadedFiles.push({
            folder: remoteFolder,
            fileName: remoteFileName,
          });

          fs.unlinkSync(file.path);
        } catch (err) {
          console.error("❌ Upload failed:", err.message);
          throw err;
        }
      }
    }

    await t.commit();

    res.status(201).json({
      message: "Expense Bill created successfully",
      expenseBill,
      bills: uploadedBillItems,
    });
  } catch (error) {
    console.error("❌ Error creating Expense Bill:", error.message);
    await t.rollback();

    for (const file of uploadedFiles) {
      try {
        await deleteFromCpanel(file.folder, file.fileName);
      } catch (delErr) {
        console.error("⚠️ Failed to delete uploaded file:", delErr.message);
      }
    }

    if (req.files?.length > 0) {
      for (const file of req.files) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllExpenseBills = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 200;

    // Build where condition dynamically
    const whereCondition = {};

    if (req.query.type) {
      whereCondition.type = req.query.type;
    }

    if (req.query.financial_year_id) {
      whereCondition.financial_year_id = req.query.financial_year_id;
    }

    if (req.query.month) {
      const [year, month] = req.query.month.split("-");
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);

      whereCondition.start_date = {
        [Op.between]: [startOfMonth, endOfMonth],
      };
    }

    // Apply pagination
    const result = await pagination(ExpenseBill, {
      page,
      limit,
      where: whereCondition,
      include: [
        {
          model: SystemUsers,
          as: "creator",
          attributes: ["id", "name"],
        },
        {
          model: ExpenseBillItem,
          as: "bills",
          attributes: ["id", "bill_address"],
          required: false,
        },
        {
          model: Currency,
          as: "currency",
          attributes: ["id", "symbol", "code"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json({
      message: "Expense bills fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching expense bills:", error);
    res.status(500).json({
      message: "Failed to fetch expense bills",
      error: error.message,
    });
  }
};

exports.getExpenseBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const expenseBill = await ExpenseBill.findByPk(id, {
      include: [
        { model: ExpenseBillItem, as: "bills" },
        {
          model: Currency,
          as: "currency",
          attributes: ["id", "symbol", "code"],
        },
      ],
    });

    if (!expenseBill)
      return res.status(404).json({ message: "Expense bill not found" });

    res.status(200).json(expenseBill);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch expense bill", error: error.message });
  }
};

exports.updateExpenseBill = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      financial_year_id,
      title,
      vendor,
      start_date,
      end_date,
      type,
      currency_id,
      amount,
    } = req.body;

    const expenseBill = await ExpenseBill.findByPk(id, { transaction: t });

    if (!expenseBill) {
      await t.rollback();
      return res.status(404).json({ message: "Expense bill not found" });
    }

    await expenseBill.update(
      {
        financial_year_id,
        title,
        vendor,
        start_date,
        end_date,
        type,
        currency_id,
        amount,
      },
      { transaction: t }
    );

    if (req.files?.length > 0) {
      for (const oldFile of expenseBill.bills || []) {
        try {
          const fileName = oldFile.bill_address.split("/").pop();
          await deleteFromCpanel("expense/bills", fileName);
          await oldFile.destroy({ transaction: t });
        } catch (err) {
          console.error("⚠️ Failed to delete old file:", err.message);
        }
      }

      for (const file of req.files) {
        const remoteFolder = "expense/bills";
        const remoteFileName = `${expenseBill.id}_${file.originalname}`;

        const remoteUrl = await uploadToCpanel(
          file.path,
          remoteFolder,
          remoteFileName
        );

        await ExpenseBillItem.create(
          {
            expense_bill_id: expenseBill.id,
            bill_address: remoteUrl,
            created_by: req?.user.id || null,
          },
          { transaction: t }
        );

        fs.unlinkSync(file.path);
      }
    }

    await t.commit();
    res
      .status(200)
      .json({ message: "Expense bill updated successfully", expenseBill });
  } catch (error) {
    console.error("❌ Update failed:", error.message);
    await t.rollback();
    res
      .status(500)
      .json({ message: "Failed to update expense bill", error: error.message });
  }
};

exports.deleteExpenseBill = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const expenseBill = await ExpenseBill.findByPk(id, { transaction: t });

    if (!expenseBill) {
      await t.rollback();
      return res.status(404).json({ message: "Expense bill not found" });
    }

    await ExpenseBillItem.destroy({
      where: { expense_bill_id: id },
      transaction: t,
    });

    await expenseBill.destroy({ transaction: t });
    await t.commit();

    res.status(200).json({ message: "Expense bill deleted successfully" });
  } catch (error) {
    console.error("❌ Delete failed:", error.message);
    await t.rollback();
    res
      .status(500)
      .json({ message: "Failed to delete expense bill", error: error.message });
  }
};

exports.deleteBillItem = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { billId } = req.params;
    const billItem = await ExpenseBillItem.findByPk(billId);

    if (!billItem) {
      await t.rollback();
      return res.status(404).json({ message: "Bill item not found" });
    }

    const fileName = billItem.bill_address.split("/").pop();
    await deleteFromCpanel("expense/bills", fileName);

    await billItem.destroy({ transaction: t });
    await t.commit();

    res.status(200).json({ message: "Bill item deleted successfully" });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to delete bill item", error: err.message });
  }
};
