const db = require("../models");
const pagination = require("../utils/pagination");
const { Op } = require("sequelize");

const { Members, Package, MemberPackage, Currency, Coupon } = db;

exports.getAllMemberPackages = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const include = [
            {
                model: Members,
                as: "member",
                attributes: ["id", "name", "email", "member_id", "phone"]
            }, {
                model: Package,
                as: "package",
                attributes: ["id", "package_id", "package_name", "price", "duration"]
            }
        ];

        const filterConditions = {};

        if (req.query.search) {
            const searchQuery = `%${req.query.search}%`;

            filterConditions[Op.or] = [
                { "$member.name$": { [Op.like]: searchQuery } },
                { "$member.email$": { [Op.like]: searchQuery } },
                { "$member.phone$": { [Op.like]: searchQuery } },
                { "$member.member_id$": { [Op.like]: searchQuery } },
                { "$package.package_id$": { [Op.like]: searchQuery } },
            ];
        }


        const result = await pagination(MemberPackage, {
            page,
            limit,
            where: filterConditions,
            include
        });

        return res.status(200).json({
            message: "Member packages fetched successfully",
            data: result.data,
            pagination: result.pagination
        });

    } catch (error) {
        return res.status(500).json({ message: "Error fetching member packages", error: error.message });
    }
};


exports.getMemberDetails = async (req, res) => {
    const { memberid } = req.body;
    try {
        const member = await Members.findOne({
            where: { member_id: memberid },
            attributes: { exclude: ["password", "otp"] },
        });

        if (!member) {
            return res.status(404).json({ status: "error", message: "Member not found" });
        }

        const memberPackage = await MemberPackage.findOne({
            where: { member_id: member.id },
            include: [
                {
                    model: Package,
                    as: "package",
                    attributes: ["id", "package_name", "price", "duration"],
                    include: [
                        {
                            model: Currency,
                            as: "currency",
                            attributes: ["symbol"],
                        },
                        {
                            model: Coupon,
                            as: "coupons",
                            through: { attributes: [] },
                            where: {
                                status: "active",
                            },
                            required: false
                        },
                    ],
                },
            ],
        });

        let response = {
            id: member.id,
            name: member.name,
            email: member.email,
            mobile: member.phone,
        };

        if (memberPackage && memberPackage.package) {
            response.package_name = memberPackage.package.package_name;
            response.price = memberPackage.package.price;
            response.duration = memberPackage.package.duration;
            response.symbol = memberPackage.package.currency ? memberPackage.package.currency.symbol : null;

            response.coupons = memberPackage.package.coupons || [];
        }

        res.status(200).json({ status: "success", items: [response] });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Failed to fetch member details", error: error.message });
    }
};


exports.getPackagesByMemberId = async (req, res) => {
    const { id } = req.params;

    try {
        const memberPackages = await MemberPackage.findAll({
            where: { member_id: id },
            include: [
                {
                    model: Package,
                    as: "package",
                    attributes: ["id", "package_name", "price", "duration", "description"],
                }
            ],
        });

        if (!memberPackages || memberPackages.length === 0) {
            return res.status(404).json({ message: "No packages found for this member." });
        }

        res.status(200).json(memberPackages);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch packages", error: error.message });
    }
};
