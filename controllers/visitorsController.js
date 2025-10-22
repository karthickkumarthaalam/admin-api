const db = require("../models");
const geoip = require("geoip-lite");
const { Op } = require("sequelize");
const pagination = require("../utils/pagination");
const { Visitors } = db;

exports.trackVisit = async (req, res) => {
  try {
    const data = req.body;
    const { visitor_id, page, clientIp } = data;

    const geo = geoip.lookup(clientIp);

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
        ip: clientIp,
        country: geo?.country || "unknown",
        city: geo?.city || "unknown",
        page,
      });
    }

    res.status(200).end();
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
    const { startDate, endDate, page = 1, limit = 100 } = req.query;

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Step 1: Get distinct dates within range
    const datesResult = await Visitors.findAll({
      attributes: [
        [db.sequelize.fn("DATE", db.sequelize.col("created_at")), "date"],
      ],
      where: {
        created_at: { [Op.between]: [start, end] },
      },
      group: ["date"],
      order: [["date", "DESC"]],
      limit: parseInt(limit),
      offset,
      raw: true,
    });

    const dates = datesResult.map((r) => r.date);

    if (dates.length === 0) {
      return res.json({
        data: [],
        pagination: {
          totalRecords: 0,
          totalPages: 0,
          currentPage: parseInt(page),
          pageSize: parseInt(limit),
        },
      });
    }

    // Step 2: Fetch stats for the selected dates
    const stats = await Visitors.findAll({
      attributes: [
        [db.sequelize.fn("DATE", db.sequelize.col("created_at")), "date"],
        "country",
        [
          db.sequelize.fn("COUNT", db.sequelize.col("visitor_id")),
          "total_visits",
        ],
        [
          db.sequelize.fn(
            "COUNT",
            db.sequelize.fn("DISTINCT", db.sequelize.col("visitor_id"))
          ),
          "unique_visitors",
        ],
      ],
      where: {
        created_at: { [Op.between]: [start, end] },
        [Op.or]: dates.map((d) => ({
          created_at: {
            [Op.between]: [
              new Date(`${d}T00:00:00`),
              new Date(`${d}T23:59:59`),
            ],
          },
        })),
      },
      group: ["date", "country"],
      order: [["date", "DESC"]],
      raw: true,
    });

    // Step 3: Transform stats into grouped structure
    const resultMap = {};
    stats.forEach((row) => {
      const dateStr = row.date;
      if (!resultMap[dateStr]) {
        resultMap[dateStr] = {
          date: dateStr,
          total_visits: 0,
          unique_visitors: 0,
          countries: [],
        };
      }

      const totalVisits = parseInt(row.total_visits);
      const uniqueVisitors = parseInt(row.unique_visitors);

      resultMap[dateStr].total_visits += totalVisits;
      resultMap[dateStr].unique_visitors += uniqueVisitors;

      resultMap[dateStr].countries.push({
        country: row.country,
        total_visits: totalVisits,
        unique_visitors: uniqueVisitors,
      });
    });

    const data = Object.values(resultMap);

    // Step 4: Get total distinct date count for pagination
    const totalDatesResult = await Visitors.findAll({
      attributes: [
        [
          db.sequelize.fn(
            "DISTINCT",
            db.sequelize.fn("DATE", db.sequelize.col("created_at"))
          ),
          "date",
        ],
      ],
      where: {
        created_at: { [Op.between]: [start, end] },
      },
      raw: true,
    });

    const totalRecords = totalDatesResult.length;

    res.json({
      data,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: parseInt(page),
        pageSize: parseInt(limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch visitor report" });
  }
};
