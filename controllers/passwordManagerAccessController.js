const bcrypt = require("bcrypt");
const { PasswordManagerAccess } = require("../models");

exports.verifyPassword = async (req, res) => {
    try {
        const { password } = req.body;

        const accessRecord = await PasswordManagerAccess.findOne({
            order: [["id", "DESC"]]
        });

        if (!accessRecord) {
            return res.status(404).json({ message: "Access password not set." });
        }

        const isMatch = await bcrypt.compare(password, accessRecord.access_password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        return res.status(200).json({ message: "Access granted" });

    } catch (error) {
        return res.status(500).json({ status: "error", message: "Internal server errorr", error: error.message });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current and new password are required." });
        }

        const accessRecord = await PasswordManagerAccess.findOne({
            order: [["id", "DESC"]],
        });

        if (!accessRecord) {
            return res.status(404).json({ message: "No existing password set." });
        }

        const isMatch = await bcrypt.compare(currentPassword, accessRecord.access_password);

        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await accessRecord.update({
            access_password: hashedPassword,
        });

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Password update error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

