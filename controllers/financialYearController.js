const { FinancialYear, SystemUsers } = require("../models");

exports.createFinancialYear = async (req, res) => {
  try {
    const { start_year, end_year } = req.body;

    if (!start_year || !end_year) {
      return res
        .status(400)
        .json({ message: "Start year and end year are required" });
    }

    if (parseInt(start_year) >= parseInt(end_year)) {
      return res
        .status(400)
        .json({ message: "End year must be greater than start year" });
    }

    const existing = await FinancialYear.findOne({
      where: { start_year, end_year },
    });

    if (existing) {
      return res.status(409).json({
        message: `Financial Year ${start_year} - ${end_year} already exists`,
      });
    }

    const financialYear = FinancialYear.create({
      start_year,
      end_year,
      created_by: req.user?.id,
    });

    res.status(201).json(financialYear);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create", error: error.message });
  }
};

exports.getFinancialYears = async (req, res) => {
  try {
    const financialYears = await FinancialYear.findAll({
      where: {},
      include: [
        {
          model: SystemUsers,
          as: "creator",
          attributes: ["name"],
        },
      ],
      order: [["id", "ASC"]],
    });

    res.json({ message: "Data Fetched successfully", data: financialYears });
  } catch (error) {
    console.error("Error fetching financial years:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getFinancialYearById = async (req, res) => {
  try {
    const { id } = req.params;
    const financialYear = await FinancialYear.findByPk(id);

    if (!financialYear) {
      return res.status(404).json({ message: "Financial Year not found" });
    }

    res.json(financialYear);
  } catch (error) {
    console.error("Error fetching financial year:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateFinancialYear = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_year, end_year } = req.body;

    const financialYear = await FinancialYear.findByPk(id);
    if (!financialYear) {
      return res.status(404).json({ message: "Financial Year not found" });
    }

    await financialYear.update({ start_year, end_year });

    res.json({ message: "Financial Year updated", financialYear });
  } catch (error) {
    console.error("Error updating financial year:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteFinancialYear = async (req, res) => {
  try {
    const { id } = req.params;
    const financialYear = await FinancialYear.findByPk(id);
    if (!financialYear) {
      return res.status(404).json({ message: "Financial Year not found" });
    }

    await financialYear.destroy();

    res.json({ message: "Financial Year deleted (soft)" });
  } catch (error) {
    console.error("Error deleting financial year:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.restoreFinancialYear = async (req, res) => {
  try {
    const { id } = req.params;

    const financialYear = await FinancialYear.findOne({
      where: { id },
      paranoid: false,
    });

    if (!financialYear) {
      return res.status(404).json({ message: "Financial Year not found" });
    }

    await financialYear.restore();
    res.json({ message: "Financial Year restored", financialYear });
  } catch (error) {
    console.error("Error restoring financial year:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
