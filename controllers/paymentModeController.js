const db = require("../models");
const { PaymentMode } = db;

exports.createPaymentMode = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ status: "error", message: "Name is required" });
        }

        const existingPaymentMode = await PaymentMode.findOne({
            where: {
                name: name,
                created_by: req.user.id
            }
        });

        if (existingPaymentMode) {
            return res.status(400).json({ status: "error", message: "Payment mode already exists" });
        }

        const paymentMode = await PaymentMode.create({ name, created_by: req.user.id });

        return res.status(201).json({ status: "success", message: "Payment Mode created", data: paymentMode });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to create payment Mode", error: error.message });
    }
};


exports.listPaymentMode = async (req, res) => {
    try {
        const { role, id } = req.user;

        const whereCondition = {};

        if (role !== "admin") {
            whereCondition.created_by = id;
        }

        const paymentModes = await PaymentMode.findAll({
            where: whereCondition,
            attributes: ['id', 'name'],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            status: "success",
            message: "Payment modes fetched successfully",
            data: paymentModes
        });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Failed to list payment Mode", error: error.message });
    }
};