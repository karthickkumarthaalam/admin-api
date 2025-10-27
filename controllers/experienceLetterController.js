const db = require("../models");
const fs = require("fs");
const path = require("path");
const { Experience, SystemUsers, Department } = db;
const { Op } = require("sequelize");
const pagination = require("../utils/pagination");
const { sendEmail } = require("../utils/sendEmail");

exports.createExperience = async (req, res) => {
  try {
    const {
      user_id,
      joining_date,
      relieving_date,
      employment_type,
      performance_summary,
      issued_date,
      remarks,
    } = req.body;

    if (!user_id || !joining_date || !relieving_date || !employment_type) {
      return res
        .status(400)
        .json({ status: "error", message: "Missing required fields" });
    }

    const experience = await Experience.create({
      user_id,
      joining_date,
      relieving_date,
      employment_type,
      performance_summary,
      issued_date,
      remarks,
      created_by: req.user?.id || null,
    });

    res.status(201).json({
      message: "Experience record created successfully",
      data: experience,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to create Experience Letter",
      error: error.message,
    });
  }
};

exports.updateExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      joining_date,
      relieving_date,
      employment_type,
      performance_summary,
      issued_date,
      remarks,
    } = req.body;

    const experience = await Experience.findByPk(id);
    if (!experience) {
      return res
        .status(404)
        .json({ status: "error", message: "Experience record not found" });
    }

    await experience.update({
      joining_date,
      relieving_date,
      employment_type,
      performance_summary,
      issued_date,
      remarks,
    });

    res.status(200).json({
      message: "Experience record updated successfully.",
      data: experience,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to updated Experience Letter",
      error: error.message,
    });
  }
};

exports.getAllExperience = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const { role, id } = req.user;
    const { search } = req.query;

    const whereCondition = {};

    if (role !== "admin") {
      whereCondition.created_by = id;
    }

    const searchCondition = search
      ? {
          [Op.or]: [
            { "$user.name$": { [Op.like]: `%${search}%` } },
            { "$user.email$": { [Op.like]: `%${search}%` } },
            {
              "$user.department.department_name$": {
                [Op.like]: `%${search}%`,
              },
            },
          ],
        }
      : {};

    const result = await pagination(Experience, {
      page,
      limit,
      where: { ...whereCondition, ...searchCondition },
      include: [
        {
          model: SystemUsers,
          as: "user",
          attributes: ["id", "employee_id", "name", "email", "date_of_joining"],
          include: [
            {
              model: Department,
              as: "department",
              attributes: ["id", "department_name"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      message: "Experience letter fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to list experiences",
      error: error.message,
    });
  }
};

exports.getExperiencById = async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await Experience.findByPk(id, {
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
      ],
    });

    if (!experience) {
      return res
        .status(404)
        .json({ status: "error", message: "Experience record not found" });
    }

    res.status(200).json({ status: "success", data: experience });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

exports.deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await Experience.findByPk(id);
    if (!experience) {
      return res
        .status(404)
        .json({ status: "error", message: "Experience record not found" });
    }

    await experience.destroy();

    res.status(200).json({ message: "Experience record deleted successfully" });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.restoreExperience = async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await Experience.findOne({
      where: { id },
      paranoid: false,
    });

    if (!experience) {
      return res
        .status(404)
        .json({ status: "error", message: "Experience not found" });
    }

    if (!experience.deletedAt) {
      return res
        .status(400)
        .json({ status: "error", message: "Experience is not deleted" });
    }

    await experience.restore();
    res.status(200).json({
      status: "success",
      message: "Experience restored successfully",
      data: experience,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error restoring experience letter",
      error: error.message,
    });
  }
};

exports.sendExperienceEmail = async (req, res) => {
  try {
    const { email, filename, employeeName } = req.body;
    const file = req.file;

    if (!email || !file) {
      return res.status(400).json({
        status: "error",
        message: "Email and experience letter file are required",
      });
    }

    const attachments = [
      {
        filename: filename || file.originalname,
        path: path.resolve(file.path),
      },
      {
        filename: "thaalam-logo.png",
        path: path.join(__dirname, "../public/assets/thaalam-logo.png"),
        cid: "logoimage",
      },
    ];

    const htmlContent = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
  <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-bottom: 2px solid #d63384;">
    <img src="cid:logoimage" alt="Thaalam Media Logo" style="width: 160px;" />
    <h1 style="color: #d63384; margin: 10px 0;">Experience Certificate</h1>
  </div>

  <div style="padding: 20px;">
    <p>Dear ${employeeName || "Employee"},</p>
    <p>We are pleased to share your <b>Experience Letter</b> for your tenure with Thaalam Media. Please find the attached certificate for your reference.</p>

    <p style="margin-top: 20px;">We thank you for your contributions and wish you continued success in your career.</p>

    <p style="margin-top: 30px;">Best wishes,</p>
    <p style="margin-top: 10px; font-weight: bold;">Thaalam Media HR Department</p>
  </div>

  <div style="text-align: center; padding: 15px; background-color: #f8f9fa; border-top: 2px solid #d63384; font-size: 12px; color: #555;">
    © ${new Date().getFullYear()} Thaalam Media. All rights reserved.
  </div>
</div>
`;

    await sendEmail({
      toEmail: email,
      subject: "Your Experience Letter - Thaalam Media",
      htmlContent,
      attachments,
    });

    res.json({
      status: "success",
      message: "Experience letter email sent successfully",
    });

    fs.unlink(file.path, (err) => {
      if (err) console.error("Failed to delete file:", err);
    });
  } catch (error) {
    console.error("Error sending experience letter email:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to send experience letter email",
      error: error.message,
    });
  }
};

exports.verifyData = async (req, res) => {
  try {
    const id = parseInt(req.query.id, 10);

    const experience = await Experience.findByPk(id, {
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
      ],
    });

    if (!experience) {
      return res
        .status(404)
        .json({ status: "error", message: "Experience not found" });
    }

    res.status(200).json({ status: "success", experience });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error showing verify" });
  }
};
