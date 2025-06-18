const db = require("../models");
const pagination = require("../utils/pagination");
const { Op } = require("sequelize");

const { Coupon, Package, MemberPackage } = db;

exports.createCoupon = async (req, res) => {
    try {
        const { coupon_name, coupon_code, start_date, end_date, redirect_url, description, packages, status } = req.body;

        if (!coupon_name || !coupon_code || !start_date || !end_date) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const existingCoupon = await Coupon.findOne({ where: { coupon_code } });

        if (existingCoupon) {
            return res.status(400).json({ message: "Coupon code already exists" });
        }

        const newCoupon = await Coupon.create({
            coupon_code,
            coupon_name,
            start_date,
            end_date,
            redirect_url,
            description,
            status: status || "active"
        });

        if (packages && packages.length > 0) {
            await newCoupon.setPackages(packages);
        }

        return res.status(201).json({ message: "Coupon created successfully", data: newCoupon });

    } catch (error) {
        return res.status(500).json({ message: "Error creating coupon", error: error.message });
    }
};

exports.getCoupons = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const filterConditions = {};

        const today = new Date();

        await Coupon.update(
            { status: "expired" },
            {
                where: {
                    end_date: { [Op.lt]: today },
                    status: { [Op.not]: 'expired' }
                }
            }
        );

        if (req.query.status) {
            filterConditions.status = req.query.status;
        }

        if (req.query.search) {
            const searchQuery = `%${req.query.search}%`;
            filterConditions[Op.or] = [
                { coupon_name: { [Op.like]: searchQuery } },
                { coupon_code: { [Op.like]: searchQuery } }
            ];
        }

        const result = await pagination(Coupon, {
            page,
            limit,
            where: filterConditions,
            include: [
                {
                    association: "packages",
                    attributes: ["id"],
                    through: { attributes: [] }
                }
            ],
        });

        return res.status(200).json({
            message: "Coupons fetched successfully",
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching coupons", error: error.message });
    }
};

exports.getCouponById = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findOne({
            where: { id },
            include: [
                {
                    association: "packages",
                    attributes: ["id"],
                    through: { attributes: [] }
                }
            ]
        });

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        return res.status(200).json({ message: "Coupon fetched successfully", data: coupon });

    } catch (error) {
        return res.status(500).json({ message: "Error fetching coupon", error: error.message });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findOne({ where: { id } });

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        await coupon.setPackages([]);
        await coupon.destroy();

        return res.status(200).json({ message: "Coupon deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting Coupon", error: error.message });
    }
};

exports.updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const { coupon_name, coupon_code, start_date, end_date, redirect_url, description, packages, status } = req.body;

        const coupon = await Coupon.findOne({ where: { id } });

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        coupon.coupon_name = coupon_name || coupon.coupon_name;
        coupon.coupon_code = coupon_code || coupon.coupon_code;
        coupon.start_date = start_date || coupon.start_date;
        coupon.end_date = end_date || coupon.end_date;
        coupon.redirect_url = redirect_url || coupon.redirect_url;
        coupon.description = description || coupon.description;
        coupon.status = status || coupon.status;

        if (packages && Array.isArray(packages)) {
            await coupon.setPackages(packages);
        }

        await coupon.save();

        return res.status(200).json({ message: "Coupon updated successfully", data: coupon });

    } catch (error) {
        return res.status(500).json({ message: "Error updating coupon", error: error.message });
    }
};

exports.updateCouponStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const coupon = await Coupon.findOne({ where: { id } });

        if (!coupon) {
            return res.status(400).json({ message: "Coupon not found" });
        }

        coupon.status = status;

        await coupon.save();
        return res.status(200).json({ message: "Coupon status updated successfully", data: coupon });
    } catch (error) {
        return res.status(500).json({ message: "Error updating status", error: error.message });
    }
};


exports.getMemberCoupons = async (req, res) => {
    const memberId = req.user.id;
    try {
        const memberPackage = await MemberPackage.findOne({
            where: {
                member_id: memberId,
                status: {
                    [Op.in]: ["active", "grace_period"]
                }
            },
            include: [
                {
                    model: Package,
                    as: "package",
                    attributes: ["id", "package_name"],
                    include: [
                        {
                            model: Coupon,
                            as: "coupons",
                            through: { attributes: [] },
                            where: {
                                status: 1,
                                end_date: {
                                    [Op.gte]: new Date()
                                }
                            },
                            required: false
                        }
                    ]
                }
            ]
        });

        if (!memberPackage || !memberPackage.package) {
            return res.status(200).json({ status: "success", items: [] });
        }

        const coupons = memberPackage.package.coupons || [];
        res.status(200).json({
            status: "success",
            items: coupons
        });

    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to fetch coupons", error: error.message });
    }
};