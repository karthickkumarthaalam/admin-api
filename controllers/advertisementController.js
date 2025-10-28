const { Op } = require("sequelize");
const db = require("../models");
const pagination = require("../utils/pagination");
const { Advertisement } = db;

exports.createAdvertisement = async (req, res) => {
  try {
    const {
      company_name,
      contact_person,
      email,
      phone,
      site_address,
      requirement,
    } = req.body;

    if (!company_name || !contact_person || !email) {
      return res
        .status(400)
        .json({ status: "error", message: "Please fill required fields" });
    }

    const advertisement = await Advertisement.create({
      company_name,
      contact_person,
      email,
      phone,
      site_address,
      requirement,
      status: "pending",
    });

    res.status(201).json({
      status: "success",
      message: "Advertisement query created Successfully",
      advertisement,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to create advertisement query",
      error: error.message,
    });
  }
};

exports.getAllAdvertisement = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    let whereCondition = {};

    if (req.query.status) {
      whereCondition.status = req.query.status;
    }

    if (req.query.search) {
      whereCondition[Op.or] = [
        { company_name: { [Op.like]: `%${req.query.search}%` } },
        { contact_person: { [Op.like]: `%${req.query.search}%` } },
        { email: { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    const result = await pagination(Advertisement, {
      page,
      limit,
      where: whereCondition,
    });

    res.status(200).json({
      status: "success",
      message: "Advertisement queries fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to list advertisement queries",
      error: error.message,
    });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const { status } = req.body;

    if (
      !status ||
      !["pending", "intimated", "in-progress", "closed"].includes(status)
    ) {
      return res
        .status(400)
        .json({ status: "error", message: "Advertisement status required" });
    }

    const adv = await Advertisement.findByPk(id);

    if (!adv) {
      return res
        .status(404)
        .json({ status: "error", message: "Advertisment not found" });
    }

    adv.status = status;

    await adv.save();

    res
      .status(200)
      .json({ status: "success", message: "Status updated successfully" });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to update status",
      error: error.message,
    });
  }
};
