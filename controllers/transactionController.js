const { MemberPackage, Package, Transaction, Members, Currency } = require("../models");
const { Op } = require("sequelize");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const pagination = require("../utils/pagination");

exports.getAllTransactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const filterConditions = {};

        if (req.query.search) {
            const searchQuery = `%${req.query.search}%`;

            filterConditions[Op.or] = [
                { "$member.name$": { [Op.like]: searchQuery } },
                { transaction_id: { [Op.like]: searchQuery } },
            ];
        }

        if (req.query.payment_status) {
            filterConditions.payment_status = req.query.payment_status;
        }

        const include = [
            {
                model: Members,
                as: "member",
                attributes: ["id", "name", "email", "member_id", "phone"],
            },
        ];

        const result = await pagination(Transaction, {
            page,
            limit,
            where: filterConditions,
            include,
        });

        return res.status(200).json({
            message: "Transactions fetched successfully",
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Error fetching transactions", error: error.message });
    }
};


exports.getMemberPackageTransactions = async (req, res) => {
    try {
        const memberId = req.user.id;

        const transactions = await Transaction.findAll({
            where: { member_id: memberId },
            include: [
                {
                    model: Package,
                    as: "package",
                    include: [
                        {
                            model: Currency,
                            as: "currency"
                        }
                    ]
                }
            ],
            order: [["transaction_date", "DESC"]],
            raw: true,
            nest: true,
        });

        let items = [];

        if (transactions.length > 0) {
            items = transactions.map(transaction => {
                return {
                    package_id: transaction.package_id,
                    package_name: transaction.package.package_name,
                    start_date: transaction.transaction_date,
                    end_date: null,
                    price: transaction.amount,
                    symbol: transaction.package.currency ? transaction.package.currency.symbol : "CHF",
                    transaction_id: transaction.transaction_id,
                    refund_status: transaction.refund_status,
                    payment_status: transaction.payment_status === "completed" ? "1" : "0"
                };
            });
        }

        return res.status(200).json({
            status: "success",
            items
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch package purchase report",
            error: error.message
        });
    }
};

exports.requestRefund = async (req, res) => {
    const { transaction_id, refund_reason } = req.body;
    try {
        if (!transaction_id || !refund_reason) {
            return res.status(400).json({ status: "error", message: "Transaction Id and reason are required." });
        }

        const transaction = await Transaction.findOne({ where: { transaction_id } });

        if (!transaction) {
            return res.status(404).json({ status: "error", message: "Transaction not found." });
        }

        if (transaction.payment_status !== "completed") {
            return res.status(400).json({ status: "error", message: "Refund can only be requested for completed payments." });
        }

        if (transaction.refund_status !== "not_requested") {
            return res.status(400).json({ status: "error", message: "Refund has already been requested or processed." });
        }

        transaction.refund_status = "pending";
        transaction.refund_reason = refund_reason;
        transaction.refund_requested_at = new Date();

        await transaction.save();

        return res.status(200).json({
            status: "success",
            message: "Refund request submitted successfully. Our team will review it shortly."
        });

    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to submit refund request.", error: error.message });
    }
};

exports.refundPayment = async (req, res) => {
    const { transaction_id, refund_reason } = req.body;

    try {
        if (!transaction_id || !refund_reason) {
            return res.status(400).json({ status: "error", message: "Transaction Id and reason are required." });
        }
        const transaction = await Transaction.findOne({ where: { transaction_id } });

        if (!transaction) {
            return res.status(404).json({ status: "error", message: "Transaction not found" });
        }
        if (transaction.payment_status !== "completed") {
            return res.status(400).json({ statusL: "error", message: "Only succeeded payments can be refunded." });
        }
        const refund = await stripe.refunds.create({
            payment_intent: transaction_id,
            reason: 'requested_by_customer',
            metadata: { refund_reason }
        });
        transaction.refund_status = 'refunded';
        transaction.refund_reason = refund_reason;
        transaction.payment_status = 'refunded';
        await transaction.save();

        await MemberPackage.destroy({ where: { member_id: transaction.member_id } });

        return res.status(200).json({
            status: "success",
            message: "Refund processed successfully.",
            refund
        });

    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to process refund.", error: error.message });
    }
};

exports.rejectRefund = async (req, res) => {
    const { transaction_id } = req.body;
    try {
        if (!transaction_id) {
            return res.status(400).json({
                status: "error",
                message: "Transaction Id is required.",
            });
        }

        const transaction = await Transaction.findOne({ where: { transaction_id } });

        if (!transaction) {
            return res.status(404).json({
                status: "error",
                message: "Transaction not found.",
            });
        }

        if (transaction.refund_status !== "pending") {
            return res.status(400).json({
                status: "error",
                message: "No pending refund request for this transaction.",
            });
        }

        transaction.refund_status = "rejected";
        await transaction.save();

        return res.status(200).json({
            status: "success",
            message: "Refund request rejected successfully.",
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to reject refund request.",
            error: error.message,
        });
    }
};
