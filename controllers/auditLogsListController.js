const db = require("../models");
const pagination = require("../utils/pagination");
const { AuditLogs, SystemUsers } = db;

exports.getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;

    const { entity_type, action, changed_by } = req.query;

    const where = {};

    if (entity_type) where.entity_type = entity_type;
    if (action) where.action = action;
    if (changed_by) where.changed_by = changed_by;

    const result = await pagination(AuditLogs, {
      page,
      limit,
      where,
      include: [
        {
          model: SystemUsers,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.status(200).json({
      status: "success",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch audit logs",
    });
  }
};
