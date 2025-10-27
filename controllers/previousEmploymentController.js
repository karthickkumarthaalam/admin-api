// controllers/previousEmploymentController.js
const db = require("../models");
const { PreviousEmployment } = db;

exports.createPreviousEmployment = async (req, res) => {
  try {
    const {
      system_user_id,
      company_name,
      designation,
      from_date,
      to_date,
      responsibilities,
      reason_for_leaving,
      reference_name,
      reference_contact,
    } = req.body;

    if (!system_user_id || !company_name || !designation || !from_date) {
      return res.status(400).json({
        message:
          "system_user_id, company_name, designation, and from_date are required",
      });
    }

    const employment = await PreviousEmployment.create({
      system_user_id,
      company_name,
      designation,
      from_date,
      to_date,
      responsibilities,
      reason_for_leaving,
      reference_name,
      reference_contact,
    });

    res.status(201).json({
      message: "Previous employment added successfully",
      data: employment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create previous employment",
      error: error.message,
    });
  }
};

exports.getPreviousEmployments = async (req, res) => {
  try {
    const { system_user_id } = req.query;

    const whereClause = system_user_id ? { system_user_id } : {};

    const employments = await PreviousEmployment.findAll({
      where: whereClause,
      order: [["from_date", "DESC"]],
    });

    res.status(200).json({ data: employments });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch previous employments",
      error: error.message,
    });
  }
};

exports.updatePreviousEmployment = async (req, res) => {
  try {
    const { id } = req.params;

    const employment = await PreviousEmployment.findByPk(id);
    if (!employment) {
      return res.status(404).json({ message: "Record not found" });
    }

    await employment.update(req.body);

    res.status(200).json({
      message: "Previous employment updated successfully",
      data: employment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update previous employment",
      error: error.message,
    });
  }
};

exports.deletePreviousEmployment = async (req, res) => {
  try {
    const { id } = req.params;

    const employment = await PreviousEmployment.findByPk(id);
    if (!employment) {
      return res.status(404).json({ message: "Record not found" });
    }

    await employment.destroy();

    res
      .status(200)
      .json({ message: "Previous employment deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete previous employment",
      error: error.message,
    });
  }
};
