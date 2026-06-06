const db = require("../models");
const fs = require("fs");
const { SummerFestivalRefund, Attendee } = db;
const pagination = require("../utils/pagination");
const { uploadToCpanel } = require("../services/uploadToCpanel");
const { Op } = require("sequelize");

exports.createRefundEnquiry = async (req, res) => {
  const billFile = req.file || null;
  const billsPath = billFile ? billFile.path : null;

  try {
    const {
      ORDER_ID,
      NAME,
      EMAIL_ID,
      PHONE_NUMBER,
      REFUND_OR_CONTINUE,
      PAYMENT_MODE,
      TWINT_ACCOUNT,
      BANK_NAME,
      IBAN_NUMBER,
      BIC_SWIFT_CODE,
      FULL_NAME,
      TICKET_DESCRIPTION,
      USER_IP,
      USER_CITY,
    } = req.body;

    if (
      !ORDER_ID ||
      !NAME ||
      !EMAIL_ID ||
      !PHONE_NUMBER ||
      !REFUND_OR_CONTINUE
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "ORDER_ID, NAME, EMAIL_ID, PHONE_NUMBER, and REFUND_OR_CONTINUE are required",
      });
    }

    const existingEnquiry = await SummerFestivalRefund.findOne({
      where: { ORDER_ID },
    });

    if (existingEnquiry) {
      return res.status(400).json({
        status: "error",
        message: "Refund enquiry already exists for this Order ID",
      });
    }

    let uploadedUrl = null;

    if (billFile) {
      uploadedUrl = await uploadToCpanel(
        billsPath,
        "summerfestival/bills",
        billFile.originalname,
      );
    }

    const refundEnquiry = await SummerFestivalRefund.create({
      ORDER_ID,
      NAME,
      EMAIL_ID,
      PHONE_NUMBER,
      REFUND_OR_CONTINUE,
      PAYMENT_MODE,
      TWINT_ACCOUNT,
      BANK_NAME,
      IBAN_NUMBER,
      BIC_SWIFT_CODE,
      FULL_NAME,
      TICKET_DESCRIPTION,
      REFUNDED_STATUS: "pending",
      BILL_ATTACHMENT: uploadedUrl,
      USER_IP,
      USER_CITY,
    });

    if (billsPath) await fs.unlink(billsPath).catch(() => {});

    return res.status(201).json({
      status: "success",
      message: "Refund enquiry created successfully",
      refundEnquiry,
    });
  } catch (error) {
    if (billsPath) {
      await fs.unlink(billsPath).catch(() => {});
    }
    return res.status(500).json({
      status: "error",
      message: "Failed to create refund enquiry",
      error: error.message,
    });
  }
};

exports.checkAttendeesOrderId = async (req, res) => {
  const { ORDER_ID } = req.params;

  try {
    if (!ORDER_ID) {
      return res
        .status(400)
        .json({ status: "error", message: "ORDER ID is required" });
    }

    const attendee = await Attendee.findOne({
      where: {
        ORDER_ID,
      },
    });

    if (!attendee) {
      return res
        .status(404)
        .json({ status: "error", message: "Invalid Order ID" });
    }

    const existingEnquiry = await SummerFestivalRefund.findOne({
      where: {
        ORDER_ID,
      },
    });

    if (existingEnquiry) {
      return res.status(400).json({
        status: "error",
        message: "Refund enquiry already exists for this Order ID",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "Valid Order Id",
      attendee,
      valid: true,
    });
  } catch (error) {
    return res.status(500).json({
      Status: "error",
      message: "Failed to check attendee order ID",
      error: error.message,
    });
  }
};

exports.getAllRefundEnquiries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;

    let whereCondition = {};
    let attendeeWhere = {};

    if (req.query.search) {
      const searchValue = `%${req.query.search}%`;
      whereCondition = {
        [Op.or]: [
          { ORDER_ID: { [Op.like]: searchValue } },
          { NAME: { [Op.like]: searchValue } },
          { EMAIL_ID: { [Op.like]: searchValue } },
        ],
      };
    }

    if (req.query.status) {
      whereCondition.REFUNDED_STATUS = req.query.status;
    }

    if (req.query.ticket_class) {
      const classValue = `%${req.query.ticket_class}%`;
      attendeeWhere = {
        [Op.or]: [{ TICKET_CLASS: { [Op.like]: classValue } }],
      };
    }

    const { count, rows } = await SummerFestivalRefund.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Attendee,
          attributes: [
            "ORDER_ID",
            "TICKET_ID",
            "TICKET_CLASS",
            "AMOUNT_COLLECTED",
            "COUNTRY",
          ],
          where: attendeeWhere,
          required: !!req.query.ticket_class,
        },
      ],
      distinct: true,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      status: "success",
      message: "Refund enquiries fetched successfully",
      data: rows,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.log(error, "showing error");
    return res
      .status(500)
      .json({ status: "error", message: "Failed to fetch refund enquiry" });
  }
};

exports.updateRefundStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const { REFUNDED_STATUS } = req.body;

    const refundEnquiry = await SummerFestivalRefund.findByPk(id);

    if (!refundEnquiry) {
      return res
        .status(404)
        .json({ status: "error", message: "Refund enquiry not found" });
    }

    if (!["pending", "verified", "refunded"].includes(REFUNDED_STATUS)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid REFUNDED_STATUS value" });
    }

    refundEnquiry.REFUNDED_STATUS = REFUNDED_STATUS;
    await refundEnquiry.save();

    return res.status(200).json({
      status: "success",
      message: "Refund status updated successfully",
      refundEnquiry,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to update refund status",
      error: error.message,
    });
  }
};

exports.getAttendeeByOrderId = async (req, res) => {
  const { ORDER_ID } = req.params;

  try {
    const attendees = await Attendee.findAll({
      where: {
        ORDER_ID,
      },
    });

    if (!attendees) {
      return res.status(404).json({
        status: "error",
        message: "Attendee not found with the provided ORDER_ID",
      });
    }

    return res
      .status(200)
      .json({ status: "success", message: "Attendee found", attendees });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch attendee by ORDER_ID",
      error: error.message,
    });
  }
};

exports.getRefundSummary = async (req, res) => {
  try {
    const refunds = await SummerFestivalRefund.findAll({
      attributes: ["ORDER_ID", "REFUNDED_STATUS"],
    });

    const orderIds = refunds.map((r) => r.ORDER_ID);

    const attendees = await Attendee.findAll({
      where: {
        ORDER_ID: orderIds,
      },
      attributes: ["ORDER_ID", "AMOUNT_COLLECTED"],
    });

    const amountMap = {};

    attendees.forEach((attendee) => {
      const orderId = attendee.ORDER_ID;

      if (!amountMap[orderId]) {
        amountMap[orderId] = 0;
      }

      amountMap[orderId] += parseFloat(attendee.AMOUNT_COLLECTED || 0);
    });

    let totalAmountCollected = 0;
    let pendingAmount = 0;
    let refundedAmount = 0;
    let verifiedAmount = 0;

    refunds.forEach((refund) => {
      const amount = amountMap[refund.ORDER_ID] || 0;

      totalAmountCollected += amount;

      if (refund.REFUNDED_STATUS === "pending") {
        pendingAmount += amount;
      }

      if (refund.REFUNDED_STATUS === "verified") {
        verifiedAmount += amount;
      }

      if (refund.REFUNDED_STATUS === "refunded") {
        refundedAmount += amount;
      }
    });

    return res.status(200).json({
      status: "success",

      summary: {
        TOTAL_ENQUIRIES: refunds.length,

        TOTAL_AMOUNT_COLLECTED: totalAmountCollected,

        PENDING_AMOUNT: pendingAmount,

        VERIFIED_AMOUNT: verifiedAmount,

        REFUNDED_AMOUNT: refundedAmount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch refund summary",
      error: error.message,
    });
  }
};
