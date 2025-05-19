const nodemailer = require("nodemailer");
const crypto = require("crypto");
const path = require("path");
require("dotenv").config();

const sendOtpEmail = async (toEmail, toName, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.zeptomail.in",
            port: 587,
            secure: false,
            auth: {
                user: "emailapikey",
                pass: process.env.ZEPTO_API_KEY,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: '"Thaalam Media" <noreply@thaalam.ch>',
            to: toEmail,
            subject: "Your Password Reset OTP",
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                  <h2>Hello ${toName},</h2>
                  <p>Your OTP for password reset is:</p>
                  <h1 style="color: #d63384;">${otp}</h1>
                  <p>This OTP is valid for 5 minutes.</p>
                  <br>
                  <p>Regards,<br>Thaalam Media Team</p>
                  <img src="cid:logoimage" alt="Thaalam Media Logo" style="width: 150px; margin-top: 20px;" />
                </div>
              `,
            attachments: [
                {
                    filename: "thaalam-logo.png",
                    path: path.join(__dirname, "../public/assets/thaalam-logo.png"),
                    cid: "logoimage"
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("ZeptoMail sending error:", error);
        throw new Error("Failed to send email via ZeptoMail");
    }
};


const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};


module.exports = { sendOtpEmail, generateOTP };