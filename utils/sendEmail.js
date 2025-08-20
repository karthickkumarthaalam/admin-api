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

const verificationEmail = async (toEmail, toName, otp) => {
    const htmlContent = `   
     <div style="font-family: Arial, sans-serif; color: #333;>
        <h2>Hello ${toName}, </h2>
        <p>Verify your account</p>
        <h1 style="color: #d63384;">${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
        <br>
        <p>Regard,<br>Thaalam Media Team</p>
        <img src="cid:logoimg" alt-"Thaalam Media Logo" style="width: 150px; margin-top: 20px;"+/> 
     </div>
    `;

    const attachments = [
        {
            filename: "thaalam-logo.png",
            path: path.join(__dirname, "../public/assets/thaalam-logo.png"),
            cid: "logoimage",
        }
    ];


    return await sendEmail({ toEmail, subject: "Verification OTP ", htmlContent, attachments });
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


const sendGracePeriodEmail = async (toEmail, toName, expiryDate) => {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Hello ${toName},</h2>
      <p>Your subscription expired on:</p>
      <h1 style="color: #dc3545;">${expiryDate}</h1>
      <p>You are now in a <strong>3-day grace period</strong>. During this time, you can still renew your subscription to avoid losing access to our services.</p>
      <p>If auto-renewal is enabled, your payment will be processed automatically.</p>
      <p>If not, please renew your package before the grace period ends to continue enjoying uninterrupted service.</p>
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

    return await sendEmail({
        toEmail,
        toName,
        subject: "Subscription Grace Period Notice",
        htmlContent,
        attachments,
    });
};

const sendPaymentReceiptEmail = async (toEmail, toName, packageName, amount, currency, receiptUrl) => {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Hello ${toName},</h2>
      <p>Thank you for your purchase! Your subscription is now active.</p>
      <p><strong>Package:</strong> ${packageName}</p>
      <p><strong>Amount Paid:</strong> ${amount} ${currency.toUpperCase()}</p>
      <p>You can download your payment receipt here:</p>
      <a href="${receiptUrl}" style="display:inline-block;padding:10px 20px;background-color:#d63384;color:white;border-radius:4px;text-decoration:none;">View Receipt</a>
      <br><br>
      <p>We appreciate your support!</p>
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

    return await sendEmail({
        toEmail,
        subject: "Your Payment Receipt - Thaalam Media",
        htmlContent,
        attachments,
    });
};

const sendRjPasswordEmail = async (toEmail, toName, plainPassword) => {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Hi ${toName},</h2>
      <p>Welcome to <strong>Thaalam Media</strong>!</p>
      <p>Your User profile has been successfully created. Here are your login credentials:</p>
      
      <p><strong>Email:</strong> ${toEmail}</p>
      <p><strong>Password:</strong> ${plainPassword}</p>

      <p>You can now log in to Admin dashboard and manage your profile and content.</p>

      <a href="https://thaalam.ch/A8J3K9Z5QW" style="display:inline-block;padding:10px 20px;background-color:#cc0000;color:white;border-radius:4px;text-decoration:none;">Login Now</a>

      <br><br>
      <p>Please keep this information safe and secure.</p>
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

    return await sendEmail({
        toEmail,
        subject: "Your User profile Credentials - Thaalam Media",
        htmlContent,
        attachments,
    });
};

const sendEnquiryEmail = async (toEmail, toName, subjectText, messageText) => {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Hello ${toName}, </h2>
        <p>Thank you for getting in touch with <strong>Thaalam Media</strong>!</p>
        <p>We have received your enquiry and our team will get back to you soon.</p>
      
        <h3 style="margin-top: 20px;">Your Enquiry Details:</h3>
        <p> ${subjectText}</p>
        <p> ${messageText}</p>

        <p style="margin-top: 20px;">We appreciate your interest and will respond as quickly as possible.</p>
        <p>Regards,<br>Thaalam Media Team</p>

        <img src="cid:logoimage" alt="Thaalam Media Logo" style="width: 150px; margin-top: 20px;" />
    </div>
    `;

    const attachments = [
        {
            filename: "thaalam-logo.png",
            path: path.join(__dirname, "../public/assets/thaalam-logo.png"),
            cid: "logoimage",
        }
    ];

    return await sendEmail({
        toEmail,
        subject: "We’ve Received Your Enquiry - Thaalam Media",
        htmlContent,
        attachments
    });
};

const sendCareerEmail = async (toEmail, toName, subjectText) => {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Hello ${toName},</h2>
        <p>Thank you for applying to <strong>Thaalam Media</strong>!</p>
        <p>We have successfully received your application. Our recruitment team will carefully review your profile and get back to you if your qualifications match our requirements.</p>
        
        <h3 style="margin-top: 20px;">Your Application Summary:</h3>
        <p><strong>Position Applied:</strong> ${subjectText}</p>

        <p style="margin-top: 20px;">Please note: If your profile is shortlisted, our HR team will contact you within the next few weeks.</p>
        <p>We appreciate the time and effort you put into your application, and we wish you the best of luck in the process.</p>

        <p style="margin-top: 20px;">Regards,<br>Thaalam Media HR Team</p>

        <img src="cid:logoimage" alt="Thaalam Media Logo" style="width: 150px; margin-top: 20px;" />
    </div>
    `;

    const attachments = [
        {
            filename: "thaalam-logo.png",
            path: path.join(__dirname, "../public/assets/thaalam-logo.png"),
            cid: "logoimage",
        }
    ];

    return await sendEmail({
        toEmail,
        subject: "Thank you for Applying - Thaalam Media",
        htmlContent,
        attachments
    });
};


module.exports = {
    sendEmail,
    sendOtpEmail,
    verificationEmail,
    sendExpiryEmail,
    sendPreExpiryEmail,
    sendGracePeriodEmail,
    sendPaymentReceiptEmail,
    generateOTP,
    sendRjPasswordEmail,
    sendEnquiryEmail,
    sendCareerEmail
};