const { Transaction, Members } = require("../models");
const { Op } = require("sequelize");
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
