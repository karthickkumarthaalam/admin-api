const db = require("../models");
const pagination = require("../utils/pagination");
const { Op } = require("sequelize");
const { Package, sequelize } = db;

exports.createPackage = async (req, res) => {
    try {
        const { package_name, currency_id, price, duration, features, description, status, coupons, language, yearly_price } = req.body;

        if (!package_name || !currency_id || !price || !duration) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        let isUnique = false;
        let generatedId;

        while (!isUnique) {
            generatedId = `THA${Math.floor(1000 + Math.random() * 9000)}`;
            const existingPackage = await Package.findOne({ where: { package_id: generatedId } });

            if (!existingPackage) {
                isUnique = true;
            }
        }

        const newPackage = await Package.create({
            package_name,
            package_id: generatedId,
            currency_id,
            price,
            duration,
            features,
            description,
            language,
            yearly_price,
            status: status || "active"
        });

        if (coupons && coupons.length > 0) {
            await newPackage.setCoupons(coupons);
        }

        return res.status(201).json({ message: "package created successfully", data: newPackage });
    } catch (error) {
        return res.status(500).json({ message: "Error creating package", error: error.message });
    }
};


exports.getPackages = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const whereConditions = [];

        if (req.query.status) {
            whereConditions.push({ status: req.query.status });
        }

        if (req.query.language) {
            const lang = req.query.language;
            whereConditions.push(sequelize.literal(`JSON_CONTAINS(language, '["${lang}"]')`));
        }

        if (req.query.search) {
            whereConditions.push({
                [Op.or]: [
                    { package_name: { [Op.like]: `%${req.query.search}%` } }
                ]
            });
        }

        const result = await pagination(Package, {
            page,
            limit,
            where: {
                [Op.and]: whereConditions
            }
        });
        return res.status(200).json({
            message: "Packages fetch successfully",
            data: result.data,
            pagination: result.pagination
        });

    } catch (error) {
        return res.status(500).json({ message: "Error fetching packages", error: error.message });
    }
};


exports.getPackageById = async (req, res) => {
    try {
        const { id } = req.params;

        const packageItem = await Package.findOne({
            where: { id }
        });

        if (!packageItem) {
            return res.status(404).json({ message: "Package not found" });
        }

        return res.status(200).json({ message: "Package fetched successfully", data: packageItem });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching package", error: error.message });
    }
};

exports.updatePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const { package_name, package_id, currency_id, price, duration, features, description, status, coupons, language, yearly_price } = req.body;

        const packageItem = await Package.findOne({ where: { id } });

        if (!packageItem) {
            return res.status(404).json({ message: "Package not found" });
        }

        packageItem.package_name = package_name || packageItem.package_name;
        packageItem.currency_id = currency_id || packageItem.currency_id;
        packageItem.price = price || packageItem.price;
        packageItem.duration = duration || packageItem.duration;
        packageItem.features = features || packageItem.features;
        packageItem.description = description || packageItem.description;
        packageItem.status = status || packageItem.status;
        packageItem.package_id = package_id || packageItem.package_id;
        packageItem.yearly_price = yearly_price || packageItem.yearly_price;

        if (language !== undefined) {
            packageItem.language = language;
        }

        if (coupons && Array.isArray(coupons)) {
            await packageItem.setCoupons(coupons);
        }

        await packageItem.save();

        return res.status(200).json({ message: "Package updated successfully", data: packageItem });

    } catch (error) {
        return res.status(500).json({ message: "Error updating package", error: error.message });
    }
};

exports.deletePackage = async (req, res) => {
    try {
        const { id } = req.params;

        const packageItem = await Package.findOne({ where: { id } });

        if (!packageItem) {
            return res.status(404).json({ message: "Package not found" });
        }
        if (packageItem.coupons && packageItem.coupons.length > 0)
            await packageItem.setCoupons([]);

        await packageItem.destroy();

        return res.status(200).json({ message: "Package deleted successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Error deleting package", error: error.message });
    }
};

exports.updatePackageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const packageItem = await Package.findOne({ where: { id } });

        if (!packageItem) {
            return res.status(404).json({ message: "Package not found" });
        }

        packageItem.status = status;

        await packageItem.save();

        return res.status(200).json({ message: "Package status updated successfully", data: packageItem });

    } catch (error) {
        return res.status(500).json({ message: "Error updating package status", error: error.message });
    }
};