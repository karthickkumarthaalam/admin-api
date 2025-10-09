const { Op } = require("sequelize");
const db = require("../models");
const pagination = require("../utils/pagination");
const { PayslipComponent, User } = db;

exports.createPayslipComponent = async (req, res) => {
  try {
    const { type, name, default_amount, description } = req.body;

    if (!type || !name) {
      return res.status(400).json({ message: "Type and name are required" });
    }

    const component = await PayslipComponent.create({
      type,
      name,
      default_amount: default_amount || 0,
      description: description || null,
      created_by: req.user?.id || null,
    });

    return res
      .status(201)
      .json({ message: "Component create", data: component });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create payslip component",
      error: error.message,
    });
  }
};

exports.getAllPayslipComponents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const { role, id } = req.user;

    const whereCondition = {};

    if (role !== "admin") {
      whereCondition.created_by = id;
    }

    if (req.query.search) {
      const searchQuery = `%${req.query.search}%`;
      whereCondition[Op.or] = [{ name: { [Op.like]: searchQuery } }];
    }

    const result = await pagination(PayslipComponent, {
      page,
      limit,
      where: whereCondition,
      order: [
        ["type", "ASC"],
        ["name", "ASC"],
      ],
    });

    res.status(200).json({
      message: "Payslip components listed successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to list components", error: error.message });
  }
};

exports.getPayslipComponentById = async (req, res) => {
  try {
    const { id } = req.params;

    const component = await PayslipComponent.findByPk(id, {
      include: {
        model: User,
        as: "creator",
        attributes: ["id", "name", "email"],
      },
    });

    if (!component) {
      return res.status(404).json({ message: "component not found" });
    }

    return res.status(200).json({ data: component });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch component", error: error.message });
  }
};

exports.updateComponent = async (req, res) => {
  const { id } = req.params;
  try {
    const { type, name, default_amount, description } = req.body;
    const component = await PayslipComponent.findByPk(id);

    if (!component) {
      return res.status(404).json({ message: "Pay slip component not found" });
    }

    await component.update({
      type: type || component.type,
      name: name || component.name,
      default_amount: default_amount || component.default_amount,
      description: description || component.description,
    });

    return res
      .status(200)
      .json({ message: "Component Updated", data: component });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update component", error: error.message });
  }
};

exports.deleteComponent = async (req, res) => {
  try {
    const { id } = req.params;
    const component = await PayslipComponent.findByPk(id);

    if (!component) {
      return res.status(404).json({ message: "Component Not found" });
    }

    await component.destroy();

    return res.status(200).json({ message: "Component deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete component", error: error.message });
  }
};
