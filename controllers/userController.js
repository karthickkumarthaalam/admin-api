const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models");
const { generateOTP, sendOtpEmail } = require("../utils/sendEmail");
const permissions = require("../utils/permissions");

const { User } = db;

exports.signup = async (req, res) => {
    const { email, password, confirmPassword, acl } = req.body;

    try {

        if (!email || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Password do not match" });
        }

        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            email,
            password: hashedPassword,
            acl: Array.isArray(acl) ? acl : []
        });

        res.status(201).json({ message: "User Created Successfully", userId: newUser.id, acl: newUser.acl });

    } catch (error) {
        res.status(500).json({ message: "signup failed", error: error.message });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        let userAcl = user.acl;
        if (email === "admin") {
            userAcl = permissions;
        }
        const token = jwt.sign({ id: user.id, email: user.email, acl: userAcl }, process.env.JWT_SECRET, { expiresIn: '30m' });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 60 * 1000
        });

        res.status(200).json({
            message: "Login successful", user: {
                id: user.id, email: user.email, role: user.role, acl: userAcl
            }
        });

    } catch (error) {
        res.status(500).json({ mesaage: "Login failed", error: error.message });
    }
};


exports.logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });
    res.status(200).json({ message: "Logged out successfully" });
};


exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await user.save();

        await sendOtpEmail(email, "admin", otp).catch(err => {
            throw err;
        });

        res.status(200).json({ message: "OTP sent to email" });

    } catch (error) {
        res.status(500).json({ message: "Failed to send OTP", error: error.message });
    }
};


exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword, confirmPassword } = req.body;

    try {
        if (!email || !otp || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "password do not match" });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (new Date() > new Date(user.otpExpiresAt)) {
            return res.status(400).json({ message: "OTP expired" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.otp = null;
        user.otpExpiresAt = null;

        await user.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ message: "Password reset failed", error: error.message });
    }
};

exports.resetPassword2 = async (req, res) => {
    const { email, currentPassword, newPassword, confirmPassword } = req.body;

    try {
        if (!email || !currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        await user.save();

        res.status(200).json({ message: "Password reset successfully" });

    } catch (error) {
        res.status(500).json({ message: "Failed to reset password", error: error.message });
    }
};
