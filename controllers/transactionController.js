const { MemberPackage, Package, Transaction, Members, Currency } = require("../models");
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


exports.getMemberPackageTransactions = async (req, res) => {
    try {
        const memberId = req.user.id;

        const packages = await MemberPackage.findAll({
            where: { member_id: memberId },
            include: [
                {
                    model: Package,
                    as: "package",
                    include: [{ model: Currency, as: "currency" }]
                },
                {
                    model: Transaction,
                    as: "transactions",
                    where: { member_id: memberId },
                    required: false
                }
            ],
            order: [["purchase_date", "DESC"]]
        });

        const items = packages.map((pkg) => {
            const transaction = pkg.transactions[0] || null;

            return {
                packageid: pkg.package_id,
                package_name: pkg.package.package_name,
                start_date: pkg.start_date,
                end_date: pkg.end_date,
                price: pkg.package.price,
                symbol: pkg.package.currency ? pkg.package.currency.symbol : "$",
                transaction_id: transaction ? transaction.transaction_id : "-",
                payment_status: transaction
                    ? transaction.payment_status === "completed"
                        ? "1"
                        : "0"
                    : "0"
            };
        });

        return res.status(200).json({
            status: "success",
            items
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch package purchase report",
            error: error.message
        });
    }
};
