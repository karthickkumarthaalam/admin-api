const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../models");
const { sendOtpEmail, generateOTP } = require("../utils/sendEmail");

const { Members } = db;


exports.signup = async (req, res) => {
    const { name, gender, country, state, city, email, phone, password } = req.body;

    try {
        if (!name || !gender || !country || !state || !city || !email || !phone || !password) {
            return res.status(400).json({ status: "error", message: "All fields as required" });
        }

        const existingMember = await Members.findOne({ where: { email } });

        if (existingMember) {
            return res.status(400).json({ status: "error", message: "Email already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let memberId;
        let isUnique = false;

        while (!isUnique) {
            memberId = Math.floor(100000 + Math.random() * 900000).toString();
            const existingId = await Members.findOne({ where: { member_id: memberId } });
            if (!existingId) isUnique = true;
        }

        const newMember = await Members.create({
            name,
            gender,
            country,
            state,
            city,
            email,
            member_id: memberId,
            phone,
            password: hashedPassword,
        });

        const token = jwt.sign({ id: newMember.id, email: newMember.email }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        res.status(201).json({ status: "success", message: "Signup successful", member: newMember, token, });


    } catch (error) {
        return res.status(500).json({ status: 'error', message: "Singup Failed", error: error.message });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ status: "error", message: "Mobile/email and password are required" });
        }

        const isEmail = username.includes("@");

        const member = await Members.findOne({
            where: isEmail ? { email: username } : { mobile: username },
        });

        if (!member) {
            return res.status(401).json({ status: "error", message: "Invalid mobile/email or password" });
        }

        const passwordMatch = await bcrypt.compare(password, member.password);
        if (!passwordMatch) {
            return res.status(401).json({ status: "error", message: "Invalid mobile/email or password" });
        }

        const token = jwt.sign(
            { id: member.id, email: member.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            status: "success",
            message: "Login successful",
            token: token,
            username: member.name,
            memberid: member.member_id,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Login failed", error: error.message });
    }
};

exports.getMemberById = async (req, res) => {
    const { id } = req.params;

    try {
        if (parseInt(req.user.id) !== parseInt(id)) {
            return res.status(403).json({ message: "Unauthorized access to member data" });
        }

        const member = await Members.findByPk(id, {
            attributes: { exclude: ["password", "otp"] }
        });

        if (!member) {
            return res.status(404).json({ message: "Member not found" });
        }
        res.status(200).json(member);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch member", error: error.message });
    }
};

exports.getAllMembers = async (req, res) => {
    try {
        const members = await Members.findAll();
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch members", error: error.message });
    }
};

exports.updateMember = async (req, res) => {
    const { id } = req.params;
    const { name, gender, country, state, city, phone } = req.body;

    try {

        const member = await Members.findOne({ where: { member_id: id } });
        if (!member) {
            return res.status(404).json({ message: "Member not found" });
        }

        const updatedData = {};

        if (name) updatedData.name = name;
        if (gender) updatedData.gender = gender;
        if (country) updatedData.country = country;
        if (state) updatedData.state = state;
        if (city) updatedData.city = city;
        if (phone) updatedData.phone = phone;

        await member.update(updatedData);

        res.status(200).json({ message: "Member updated successfully", member });

    } catch (error) {
        res.status(500).json({ message: "Failed to update member", error: error.message });
    }
};


exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const memberId = req.user.id;

    try {
        const member = await Members.findByPk(memberId);
        if (!member) {
            return res.status(404).json({ message: "Member not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, member.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New passwords do not match" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await member.update({ password: hashedPassword });

        res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        res.status(500).json({ message: "Failed to update password", error: error.message });
    }
};


exports.forgotPassword = async (req, res) => {
    const { email, phone } = req.body;

    try {
        if (!email && !phone) {
            return res.status(400).json({ status: "error", message: "Please provide email or phone" });
        }

        let member;
        if (email) {
            member = await Members.findOne({ where: { email } });
        } else if (phone) {
            member = await Members.findOne({ where: { phone } });
        }

        if (!member) {
            return res.status(404).json({ status: "error", message: "Member not found" });
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 1 * 60 * 1000);

        await member.update({ otp, otp_expires_at: expiresAt });


        if (email) {
            // await sendZeptoMail(email, member.name, otp);
            await sendOtpEmail(email, member.name, otp).catch(err => {
                console.error("Error sending email:", err);
                throw err;
            });
        } else if (phone) {
            console.log(`Send OTP ${otp} to phone ${phone}`);
        }
        res.status(200).json({ status: "success", message: "OTP sent successfully", memberid: member.member_id, email: member.email });

    } catch (error) {
        res.status(500).json({ status: "error", message: "Forgot password failed", error: error.message });
    }
};

exports.verifyOtp = async (req, res) => {
    const { email, phone, otp } = req.body;

    try {
        let member;
        if (email) {
            member = await Members.findOne({ where: { email, otp } });
        } else if (phone) {
            member = await Members.findOne({ where: { phone, otp } });
        }

        if (!member) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (new Date() > new Date(member.otp_expires_at)) {
            return res.status(400).json({ message: "OTP expired" });
        }

        res.status(200).json({ message: "OTP verified successfully" });

    } catch (error) {
        res.status(500).json({ message: "OTP verification failed", error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, phone, newPassword, confirmPassword } = req.body;

    try {
        if (!newPassword || !confirmPassword) {
            return res.status(400).json({ message: "Passwords are required" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        let member;
        if (email) {
            member = await Members.findOne({ where: { email } });
        } else if (phone) {
            member = await Members.findOne({ where: { phone } });
        }

        if (!member) {
            return res.status(404).json({ message: "Member not found" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await member.update({ password: hashedPassword, otp: null });

        res.status(200).json({ message: "Password reset successful" });

    } catch (error) {
        res.status(500).json({ message: "Password reset failed", error: error.message });
    }
};
