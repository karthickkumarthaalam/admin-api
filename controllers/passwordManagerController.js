const { PasswordManager } = require("../models");
const { encrypt, decrypt } = require("../utils/cryptoUtils");
const pagination = require("../utils/pagination");

exports.createPassword = async (req, res) => {
    try {
        const { service_name, url, username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and Password are required." });
        }

        const encryptedPassword = encrypt(password);

        const newEntry = await PasswordManager.create({
            service_name,
            url,
            username,
            password: encryptedPassword,
        });

        res.status(201).json({ message: "Password entry created successfully.", data: newEntry });
    } catch (error) {
        res.status(500).json({ message: "Failed to create password entry.", error: error.message });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { service_name, url, username, password } = req.body;

        const passwordEntry = await PasswordManager.findByPk(id);
        if (!passwordEntry) {
            return res.status(404).json({ message: "Password entry not found." });
        }

        const updatedData = {
            service_name,
            url,
            username,
        };

        if (password) {
            updatedData.password = encrypt(password);
        }

        await passwordEntry.update(updatedData);

        res.status(200).json({ message: "Password entry updated successfully." });
    } catch (error) {
        res.status(500).json({ message: "Failed to update password entry.", error: error.message });
    }
};

exports.deletePassword = async (req, res) => {
    try {
        const { id } = req.params;

        const passwordEntry = await PasswordManager.findByPk(id);
        if (!passwordEntry) {
            return res.status(404).json({ message: "Password entry not found." });
        }

        await passwordEntry.destroy();

        res.status(200).json({ message: "Password entry deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete password entry.", error: error.message });
    }
};

exports.getAllPasswords = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;


        const result = await pagination(PasswordManager, {
            page,
            limit
        });

        const decryptedEntries = result.data.map((entry) => ({
            id: entry.id,
            service_name: entry.service_name,
            url: entry.url,
            username: entry.username,
            password: decrypt(entry.password),
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
        }));

        res.status(200).json({ data: decryptedEntries, pagination: result.pagination });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch password entries.", error: error.message });
    }
};

exports.getPasswordById = async (req, res) => {
    try {
        const { id } = req.params;

        const passwordEntry = await PasswordManager.findByPk(id);
        if (!passwordEntry) {
            return res.status(404).json({ message: "Password entry not found." });
        }

        const decryptedEntry = {
            id: passwordEntry.id,
            service_name: passwordEntry.service_name,
            url: passwordEntry.url,
            username: passwordEntry.username,
            password: decrypt(passwordEntry.password),
            createdAt: passwordEntry.createdAt,
            updatedAt: passwordEntry.updatedAt,
        };

        res.status(200).json({ data: decryptedEntry });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch password entry.", error: error.message });
    }
};

