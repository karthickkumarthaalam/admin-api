const db = require("../models");
const { Currency } = db;
const pagination = require("../utils/pagination");
const { Op } = require("sequelize");


exports.createCurrency = async (req, res) => {
    try {
        const { country_name, currency_name, code, symbol } = req.body;

        if (!country_name || !currency_name || !code || !symbol) {
            return res.status(400).json({ message: "Missing required field" });
        }

        const newCurrency = await Currency.create({
            country_name,
            currency_name,
            code,
            symbol
        });

        return res.status(201).json({ message: "Currency created successfully", data: newCurrency });
    } catch (error) {
        return res.status(500).json({ message: "Error creating currency", error: error.message });
    }
};

exports.getCurrencies = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        let filterConditions = {};

        if (req.query.search) {
            const searchQuery = `%${req.query.search}%`;

            filterConditions[Op.or] = [
                { country_name: { [Op.like]: searchQuery } },
                { currency_name: { [Op.like]: searchQuery } },
                { code: { [Op.like]: searchQuery } }
            ];
        }

        if (req.query.showDeleted === "true") {
            filterConditions.is_deleted = true;
        } else {
            filterConditions.is_deleted = false;
        }

        const result = await pagination(Currency, {
            page,
            limit,
            where: filterConditions
        });

        return res.status(200).json({
            message: "Currencies fetched successfully",
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching currencies", error: error.message });
    }
};


exports.updateCurrencies = async (req, res) => {
    try {
        const { id } = req.params;;
        const { country_name, currency_name, code, symbol } = req.body;

        const currency = await Currency.findOne({ where: { id } });

        if (!currency) {
            return res.status(404).json({ message: "Currency not found" });
        }

        currency.country_name = country_name || currency.country_name;
        currency.currency_name = currency_name || currency.currency_name;
        currency.code = code || currency.code;
        currency.symbol = symbol || currency.symbol;

        await currency.save();

        return res.status(200).json({ message: "Currency updated successfully", data: currency });
    } catch (error) {
        return res.status(500).json({ message: "Error updating currency", error: error.message });
    }
};

exports.deleteCurrency = async (req, res) => {
    try {
        const { id } = req.params;
        const currency = await Currency.findOne({ where: { id } });

        if (!currency) {
            return res.status(404).json({ message: "Currency not found" });
        }

        await currency.update({ is_deleted: true, deleted_at: new Date() });

        return res.status(200).json({ message: "Currency deleted successfully" });
    } catch (error) {
        return res.status(500).json({ messsage: "Error deleting currency", error: error.message });
    }
};

exports.restoreCurrency = async (req, res) => {
    try {
        const { id } = req.params;
        const currency = await Currency.findOne({ where: { id } });

        if (!currency) {
            return res.status(404).json({ message: "Currency not found" });
        }

        await currency.update({ is_deleted: false, deleted_at: null });

        return res.status(200).json({ message: "Currency restored successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error restoring currency", error: error.message });
    }
};
