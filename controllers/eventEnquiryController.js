const db = require("../models");
const { Event, EventEnquiry } = db;
const pagination = require("../utils/pagination");
const { Op } = require("sequelize");

exports.createEnquiry = async (req, res) => {
  try {
    const { event_id, name, email, phone, subject, message } = req.body;

    if (!event_id || !name || !email || !phone || !message) {
      return res.status(400).json({
        status: "error",
        message: "all required fields are needed",
      });
    }

    const event = await Event.findByPk(event_id);

    if (!event) {
      return res.status(404).json({
        status: "error",
        message: "Event not found",
      });
    }

    await EventEnquiry.create({
      event_id,
      name,
      email,
      phone,
      subject,
      message,
      status: "pending",
    });

    res.status(201).json({
      status: "success",
      message: "Enquiry submitted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to create enquiry",
      error: error.message,
    });
  }
};

exports.getAllEnquiries = async (req, res) => {
  try {
    const { event_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const where = {};

    if (event_id) {
      where.event_id = event_id;
    }

    if (req.query.status) {
      where.status = req.query.status;
    }

    if (req.query.search) {
      const searchValue = `%${req.query.search}%`;
      where = {
        ...where,
        [Op.or]: [
          { name: { [Op.like]: searchValue } },
          { email: { [Op.like]: searchValue } },
          { phone: { [Op.like]: searchValue } },
          { subject: { [Op.like]: searchValue } },
        ],
      };
    }

    const result = await pagination(EventEnquiry, {
      page,
      limit,
      where,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      status: "success",
      message: "Event enquirires fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "failed to fetch enquiries",
      error: error.message,
    });
  }
};

exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const statusList = ["pending", "resolved", "closed"];

    if (!statusList.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "invalid status",
      });
    }

    const enquiry = await EventEnquiry.findByPk(id);

    if (!enquiry) {
      return res.status(404).json({
        status: "error",
        message: "event enquiry not found",
      });
    }

    enquiry.status = status;

    await enquiry.save();

    res.status(200).json({
      status: "success",
      message: "enquiry updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to update enquiry status",
      error: error.message,
    });
  }
};

exports.getSingleEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const enquiry = await EventEnquiry.findByPk(id);

    if (!enquiry) {
      return res.status(404).json({
        status: "error",
        message: "Enquiry not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: enquiry,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch enquiry",
      error: error.message,
    });
  }
};

exports.deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const enquiry = await EventEnquiry.findByPk(id);

    if (!enquiry) {
      return res.status(404).json({
        status: "error",
        message: "Enquiry not found",
      });
    }

    await enquiry.destroy();

    res.status(200).json({
      status: "success",
      message: "Enquiry deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete enquiry",
      error: error.message,
    });
  }
};
