const nodemailer = require("nodemailer");
const crypto = require("crypto");
const path = require("path");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: "smtp.zeptomail.in",
    port: 587,
    secure: false,
    auth: {
        user: "emailapikey",
        pass: process.env.ZEPTO_API_KEY,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

const sendEmail = async ({ toEmail, subject, htmlContent, attachments = [] }) => {
    try {
        const mailOptions = {
            from: '"Thaalam Media" <noreply@thaalam.ch>',
            to: toEmail,
            subject,
            html: htmlContent,
            attachments,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("ZeptoMail sending error:", error);
        throw new Error("Failed to send email via ZeptoMail");
    }
};

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const sendOtpEmail = async (toEmail, toName, otp) => {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Hello ${toName},</h2>
      <p>Your OTP for password reset is:</p>
      <h1 style="color: #d63384;">${otp}</h1>
      <p>This OTP is valid for 5 minutes.</p>
      <br>
      <p>Regards,<br>Thaalam Media Team</p>
      <img src="cid:logoimage" alt="Thaalam Media Logo" style="width: 150px; margin-top: 20px;" />
    </div>
  `;

    const attachments = [
        {
            filename: "thaalam-logo.png",
            path: path.join(__dirname, "../public/assets/thaalam-logo.png"),
            cid: "logoimage",
        },
    ];

    return await sendEmail({ toEmail, toName, subject: "Your Password Reset OTP", htmlContent, attachments });
};

const sendExpiryEmail = async (toEmail, toName, expiryDate) => {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Hello ${toName},</h2>
      <p>Your subscription is expired!!!</p>
      <p>Please renew to continue enjoying our services.</p>
      <br>
      <p>Regards,<br>Thaalam Media Team</p>
      <img src="cid:logoimage" alt="Thaalam Media Logo" style="width: 150px; margin-top: 20px;" />
    </div>
  `;

    const attachments = [
        {
            filename: "thaalam-logo.png",
            path: path.join(__dirname, "../public/assets/thaalam-logo.png"),
            cid: "logoimage",
        },
    ];

    return await sendEmail({ toEmail, toName, subject: "Subscription Expiry Notice", htmlContent, attachments });
};

const sendPreExpiryEmail = async (toEmail, toName, expiryDate) => {
    const htmlContent = `
     <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Hello ${toName}</h2>
        <p>Your subscription is expiring on:</p>
        <h1 style="color: #d63384;">${expiryDate}</h1>
        <p>Please renew to continue enjoying our services.</p>
        <br>
        <p>Regards,<br>Thaalam Media Team</p>
        <img src="cid:logoimage" alt="Thaalam Media Logo" style="width: 150px; margin-top: 20px;" />
    </div>
  `;

    const attachments = [
        {
            filename: "thaalam-logo.png",
            path: path.join(__dirname, "../public/assets/thaalam-logo.png"),
            cid: "logoimage",
        },
    ];

    return await sendEmail({ toEmail, toName, subject: "Subscription Pre Expiry Notice", htmlContent, attachments });
};

module.exports = {
    sendEmail,
    sendOtpEmail,
    sendExpiryEmail,
    sendPreExpiryEmail,
    generateOTP,
};