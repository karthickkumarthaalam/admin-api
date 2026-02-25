const { Op } = require("sequelize");
const { CrewMerchant } = require("../models");
const pagination = require("../utils/pagination");

exports.createCrewMerchant = async (req, res) => {
  try {
    const { merchant_type, merchant_name } = req.body;

    if (!merchant_type || !merchant_name) {
      return res.status(400).json({ message: "Bad request" });
    }

    const existing = await CrewMerchant.findOne({
      where: {
        merchant_name,
        merchant_type,
      },
    });
    if (existing) {
      return res.status(400).json({ message: "Merchant name already exists" });
    }

    const merchant = await CrewMerchant.create({
      merchant_type,
      merchant_name,
      created_by: req.user?.id,
    });

    res.status(201).json({
      message: "Crew merchant created successfully",
      data: merchant,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create crew merchant",
      error: error.message,
    });
  }
};

exports.getAllCrewMerchants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const whereCondition = {};

    if (req.query.merchant_type) {
      whereCondition.merchant_type = req.query.merchant_type;
    }

    if (req.query.search) {
      const searchQuery = `%${req.query.search}%`;

      whereCondition[Op.or] = [
        {
          merchant_name: {
            [Op.like]: searchQuery,
          },
        },
      ];
    }

    const result = await pagination(CrewMerchant, {
      page,
      limit,
      where: whereCondition,
    });

    res.status(200).json({
      message: "Crew merchants fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to list all crew merchants",
      error: error.message,
    });
  }
};

exports.getMerchantByType = async (req, res) => {
  try {
    const { type } = req.query;
    const merchants = await CrewMerchant.findAll({
      where: {
        merchant_type: type,
      },
    });

    res.status(200).json({
      message: "Merchants fetched successfully",
      data: merchants,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch merchants",
      error: error.message,
    });
  }
};

exports.updateCrewMerchant = async (req, res) => {
  const { id } = req.params;

  try {
    const merchant = await CrewMerchant.findByPk(id);

    if (!merchant) {
      return res.status(404).json({
        message: "merchant not found",
      });
    }

    const { merchant_type, merchant_name } = req.body;

    merchant.merchant_type = merchant_type || merchant.merchant_type;
    merchant.merchant_name = merchant_name || merchant.merchant_name;
    await merchant.save();

    res.status(200).json({
      message: "Crew merchant updated successfully",
      data: merchant,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update merchant",
      error: error.message,
    });
  }
};

exports.deleteCrewMerchant = async (req, res) => {
  const { id } = req.params;
  try {
    const merchant = await CrewMerchant.findByPk(id);
    if (!merchant) {
      return res.status(404).json({
        message: "merchant not found",
      });
    }

    await merchant.destroy();

    res.status(200).json({
      message: "Crew merchant deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete merchant",
      error: error.message,
    });
  }
};
