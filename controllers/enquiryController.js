const db = require("../models");
const { Op } = require("sequelize");
const { Enquiry } = db;
const pagination = require("../utils/pagination");
const { sendEnquiryEmail } = require("../utils/sendEmail");

exports.createEnquiry = async (req, res) => {
  try {
    const { name, phone, email, subject, purpose, message } = req.body;

    if (!name || !phone || !email || !subject || !purpose || !message) {
      return res
        .status(400)
        .json({ status: "error", message: "All fields are required." });
    }

    const newEnquiry = await Enquiry.create({
      name,
      phone,
      email,
      subject,
      purpose,
      message,
      status: "pending",
    });

    await sendEnquiryEmail(email, name, subject, message);

    return res.status(201).json({
      status: "success",
      message: "Enquiry created successfully",
      data: newEnquiry,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to create enquiry",
      error: error.message,
    });
  }
};

exports.getAllEnquiries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    let whereCondition = {};

    if (req.query.status) {
      whereCondition.status = req.query.status;
    }

    if (req.query.search) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${req.query.search}%` } },
        { email: { [Op.like]: `%${req.query.search}%` } },
        { subject: { [Op.like]: `%${req.query.search}%` } },
        { purpose: { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    const result = await pagination(Enquiry, {
      page,
      limit,
      where: whereCondition,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      status: "success",
      message: "Enquiries fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch enquiries",
      error: error.message,
    });
  }
};

exports.updateEnqiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "resolved", "closed"].includes(status)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid status." });
    }

    const enquiry = await Enquiry.findByPk(id);
    if (!enquiry) {
      return res
        .status(404)
        .json({ status: "error", message: "Enquiry not found." });
    }

    enquiry.status = status;
    await enquiry.save();

    return res.status(200).json({
      status: "success",
      message: "Enquiry status updated successfully",
      data: enquiry,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to update enquiry status",
      error: error.message,
    });
  }
};

exports.updateComment = async (req, res) => {
  const { id } = req.params;
  try {
    const { comment } = req.body;

    if (!comment) {
      return res
        .status(400)
        .json({ status: "error", message: "comment is required" });
    }

    const enquiry = await Enquiry.findByPk(id);
    if (!enquiry) {
      return res
        .status(404)
        .json({ status: "error", message: "Enquiry not found" });
    }

    enquiry.comment = comment;

    await enquiry.save();

    return res.status(200).json({
      status: "success",
      message: "comment posted",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to comment",
      error: error.message,
    });
  }
};
