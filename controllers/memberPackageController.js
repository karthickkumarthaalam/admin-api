const db = require("../models");
const pagination = require("../utils/pagination");
const { Op } = require("sequelize");

const { Members, Package, MemberPackage } = db;

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
                attributes: ["id", "package_id"]
            }
        ];

        const filterConditions = {};

        if (req.query.searchQuery) {
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