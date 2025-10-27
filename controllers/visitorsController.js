const db = require("../models");
const geoip = require("geoip-lite");
const { Op } = require("sequelize");
const pagination = require("../utils/pagination");
const { Visitors } = db;

exports.trackVisit = async (req, res) => {
  try {
    const data = req.body;
    const { visitor_id, page, ip, country, region, city } = data;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const exists = await Visitors.findOne({
      where: {
        visitor_id: visitor_id,
        page,
        created_at: { [Op.gte]: today },
      },
    });

    if (!exists) {
      await Visitors.create({
        visitor_id: visitor_id,
        ip,
        country,
        city,
        region,
        page,
      });
    }

    res.status(200).json({ status: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Tracking failed" });
  }
};

exports.getAllVisitors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;

    const where = {};

    if (req.query.country) {
      where.country = req.query.country;
    }

    const result = await pagination(Visitors, {
      page,
      order: [["created_at", "DESC"]],
      limit,
      where,
    });

    res.status(200).json({
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "failed to fetch visitors", error: error.message });
  }
};

exports.getVisitorReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // ✅ 1️⃣ Daily total visitors (not unique)
    const dailyStats = await Visitors.findAll({
      attributes: [
        [db.sequelize.fn("DATE", db.sequelize.col("created_at")), "date"],
        [
          db.sequelize.fn("COUNT", db.sequelize.col("visitor_id")),
          "total_visits",
        ],
      ],
      where: {
        created_at: { [Op.between]: [start, end] },
      },
      group: ["date"],
      order: [["date", "ASC"]],
      raw: true,
    });

    // ✅ 2️⃣ Country-wise total visitors
    const countryStats = await Visitors.findAll({
      attributes: [
        "country",
        [
          db.sequelize.fn("COUNT", db.sequelize.col("visitor_id")),
          "total_visits",
        ],
      ],
      where: {
        created_at: { [Op.between]: [start, end] },
      },
      group: ["country"],
      order: [[db.sequelize.literal("total_visits"), "DESC"]],
      raw: true,
    });

    const daily = dailyStats.map((d) => ({
      date: d.date,
      total_visits: parseInt(d.total_visits) || 0,
    }));

    const byCountry = countryStats.map((c) => ({
      country: c.country || "Unknown",
      total_visits: parseInt(c.total_visits) || 0,
    }));

    // ✅ 4️⃣ Send formatted response
    res.json({
      daily,
      byCountry,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch visitor report" });
  }
};
