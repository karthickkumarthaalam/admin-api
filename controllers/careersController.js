const fs = require("fs");
const db = require("../models");
const { Op } = require("sequelize");
const pagination = require("../utils/pagination");
const { Careers } = db;
const {
  deleteFromCpanel,
  uploadToCpanel,
} = require("../services/uploadToCpanel");
const { sendCareerEmail } = require("../utils/sendEmail");
const sendNotification = require("../services/sendNotification");

exports.createApplication = async (req, res) => {
  const resume = req.files?.["resume"]?.[0];

  try {
    const {
      name,
      gender,
      country,
      state,
      city,
      email,
      mobile,
      current_job,
      is_experienced,
      job_type,
      experience,
      application_reason,
    } = req.body;

    if (
      !name ||
      !gender ||
      !country ||
      !email ||
      !mobile ||
      !current_job ||
      !is_experienced ||
      !job_type ||
      !application_reason
    ) {
      return res
        .status(400)
        .json({ status: "error", message: "Please fill the required fields" });
    }

    if (!resume) {
      return res
        .status(400)
        .json({ status: "error", message: "document is required" });
    }

    const cutOffDate = new Date();
    cutOffDate.setDate(cutOffDate.getDate() - 180);

    const existingApplication = await Careers.findOne({
      where: {
        email,
        createdAt: {
          [Op.gte]: cutOffDate,
        },
      },
    });

    if (existingApplication) {
      return res.status(400).json({
        status: "error",
        message: "You have already applied within the last 6 months",
      });
    }

    const filePath = await uploadToCpanel(
      resume.path,
      "careers/documents",
      resume.originalname
    );

    if (resume && resume.path) {
      try {
        await fs.promises.unlink(resume.path);
      } catch (err) {
        console.warn("Failed to delete temp file:", err.message);
      }
    }

    await Careers.create({
      name,
      gender,
      country,
      state,
      city,
      email,
      mobile,
      current_job,
      is_experienced,
      job_type,
      experience,
      document: filePath,
      application_reason,
    });

    await sendCareerEmail(email, name, job_type);

    try {
      await sendNotification(req.app, {
        title: "New Career Application",
        message: `${name} applied for the "${job_type}" position.`,
        type: "career",
        created_by: name,
      });
    } catch (notifyErr) {
      console.error("Notification emit failed:", notifyErr.message);
    }

    return res.status(201).json({
      status: "success",
      message: "Your application has been submitted successfully",
    });
  } catch (error) {
    if (resume && fs.existsSync(resume.path)) fs.unlinkSync(resume.path);
    return res.status(500).json({
      status: "error",
      message: "Failed to apply",
      error: error.message,
    });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const whereCondition = {};

    if (req.query.is_experienced) {
      whereCondition.is_experienced = req.query.is_experienced;
    }

    if (req.query.search) {
      const searchQuery = `%${req.query.search}%`;

      whereCondition[Op.or] = [
        { name: { [Op.like]: searchQuery } },
        { email: { [Op.like]: searchQuery } },
        { job_type: { [Op.like]: searchQuery } },
      ];
    }

    const result = await pagination(Careers, {
      page,
      limit,
      where: whereCondition,
    });

    return res.status(200).json({
      status: "success",
      message: "applications fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to list applications",
      error: error.message,
    });
  }
};
