const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();


const sendOtpEmail = (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is ${otp}`
    };

    return transporter.sendMail(mailOptions);
};


const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};


module.exports = { sendOtpEmail, generateOTP };