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

const sendEmail = async ({
  toEmail,
  subject,
  htmlContent,
  attachments = [],
}) => {
  try {
    const mailOptions = {
      from: '"Thaalam Media" <noreply@thaalam.ch>',
      to: toEmail,
      subject,
      html: htmlContent,
      attachments,
    };
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("ZeptoMail sending error:", error);
    throw new Error("Failed to send email via ZeptoMail");
  }
};

const logoAttachment = {
  filename: "thaalam-logo.png",
  path: path.join(__dirname, "../public/assets/thaalam-logo.png"),
  cid: "logoimage",
};

const emailLayout = (bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    @media only screen and (max-width: 600px) {
      .email-wrapper { width: 100% !important; padding: 16px 0 !important; }
      .email-card { width: 100% !important; border-radius: 0 !important; }
      .email-body { padding: 28px 24px 0 24px !important; }
      .email-logo { padding: 16px 24px 24px 24px !important; }
      .email-footer { padding: 20px 24px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f2f2f2;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" class="email-wrapper" style="background-color:#f2f2f2;padding:40px 0;">
    <tr>
      <td align="center" style="padding:0 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" class="email-card" style="max-width:560px;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e2e2e2;">

          <!-- Red top accent bar -->
          <tr>
            <td style="background-color:#cc0000;height:4px;"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="email-body" style="padding:40px 48px 0 48px;color:#1a1a1a;font-size:15px;line-height:1.8;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Logo bottom left -->
          <tr>
            <td class="email-logo" style="padding:16px 48px 32px 48px;">
              <img src="cid:logoimage" alt="Thaalam Media" style="width:110px;display:block;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="email-footer" style="background-color:#1a1a1a;padding:22px 48px;border-radius:0 0 10px 10px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 3px 0;font-size:13px;font-weight:600;color:#ffffff;letter-spacing:0.4px;">Thaalam media GmbH</p>
                    <p style="margin:0;font-size:11px;color:#777777;">&copy; ${new Date().getFullYear()} All rights reserved &nbsp;|&nbsp; Do not reply to this email</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const sendOtpEmail = async (toEmail, toName, otp) => {
  const htmlContent = emailLayout(`
    <h2 style="margin:0 0 16px 0;color:#111111;">Hello ${toName},</h2>
    <p>Your OTP for password reset is:</p>
    <div style="text-align:center;background:#fff7f7;padding:20px;border-radius:6px;    margin:20px 0;">
      <h1 style="color:#cc0000;letter-spacing:4px;font-size:32px;margin:0;">${otp}</h1>
      <p style="font-size:13px;color:#666;margin:8px 0 0 0;">This OTP is valid for <strong>5 minutes</strong></p>
    </div>
    <p>Regards,<br/><strong>Thaalam media GmbH</strong></p>
  `);

  return await sendEmail({
    toEmail,
    subject: "Your Password Reset OTP",
    htmlContent,
    attachments: [logoAttachment],
  });
};

const verificationEmail = async (toEmail, toName, otp) => {
  const htmlContent = emailLayout(`
    <h2 style="margin:0 0 16px 0;color:#111111;">Hello ${toName},</h2>
    <p>Verify your account using the OTP below:</p>
    <div style="text-align:center;background:#fff7f7;padding:20px;border-radius:6px;    margin:20px 0;">
      <h1 style="color:#cc0000;letter-spacing:4px;font-size:32px;margin:0;">${otp}</h1>
      <p style="font-size:13px;color:#666;margin:8px 0 0 0;">This OTP is valid for <strong>5 minutes</strong></p>
    </div>
    <p>Regards,<br/><strong>Thaalam media GmbH</strong></p>
  `);

  return await sendEmail({
    toEmail,
    subject: "Verification OTP",
    htmlContent,
    attachments: [logoAttachment],
  });
};

const sendExpiryEmail = async (toEmail, toName, expiryDate) => {
  const htmlContent = emailLayout(`
    <h2 style="margin:0 0 16px 0;color:#111111;">Hello ${toName},</h2>
    <p>Your subscription is expired!!!</p>
    <p>Please renew to continue enjoying our services.</p>
    <p style="margin-top:24px;">Regards,<br/><strong>Thaalam media GmbH</strong></p>
  `);

  return await sendEmail({
    toEmail,
    subject: "Subscription Expiry Notice",
    htmlContent,
    attachments: [logoAttachment],
  });
};

const sendPreExpiryEmail = async (toEmail, toName, expiryDate) => {
  const htmlContent = emailLayout(`
    <h2 style="margin:0 0 16px 0;color:#111111;">Hello ${toName},</h2>
    <p>Your subscription is expiring on:</p>
    <div style="text-align:center;background:#fff7f7;padding:16px;border-radius:6px;    margin:20px 0;">
      <h2 style="color:#cc0000;margin:0;">${expiryDate}</h2>
    </div>
    <p>Please renew to continue enjoying our services.</p>
    <p style="margin-top:24px;">Regards,<br/><strong>Thaalam media GmbH</strong></p>
  `);

  return await sendEmail({
    toEmail,
    subject: "Subscription Pre Expiry Notice",
    htmlContent,
    attachments: [logoAttachment],
  });
};

const sendGracePeriodEmail = async (toEmail, toName, expiryDate) => {
  const htmlContent = emailLayout(`
    <h2 style="margin:0 0 16px 0;color:#111111;">Hello ${toName},</h2>
    <p>Your subscription expired on:</p>
    <div style="text-align:center;background:#fff7f7;padding:16px;border-radius:6px;    margin:20px 0;">
      <h2 style="color:#cc0000;margin:0;">${expiryDate}</h2>
    </div>
    <p>You are now in a <strong>3-day grace period</strong>. During this time, you can still renew your subscription to avoid losing access to our services.</p>
    <p>If auto-renewal is enabled, your payment will be processed automatically.</p>
    <p>If not, please renew your package before the grace period ends to continue enjoying uninterrupted service.</p>
    <p style="margin-top:24px;">Regards,<br/><strong>Thaalam media GmbH</strong></p>
  `);

  return await sendEmail({
    toEmail,
    subject: "Subscription Grace Period Notice",
    htmlContent,
    attachments: [logoAttachment],
  });
};

const sendPaymentReceiptEmail = async (
  toEmail,
  toName,
  packageName,
  amount,
  currency,
  receiptUrl,
) => {
  const htmlContent = emailLayout(`
    <h2 style="margin:0 0 16px 0;color:#111111;">Hello ${toName},</h2>
    <p>Thank you for your purchase! Your subscription is now active.</p>
    <div style="background:#f9f9f9;border-radius:6px;padding:16px;margin:20px 0;  solid #111111;">
      <p style="margin:0 0 8px 0;"><strong>Package:</strong> ${packageName}</p>
      <p style="margin:0;"><strong>Amount Paid:</strong> ${amount} ${currency.toUpperCase()}</p>
    </div>
    <p>You can download your payment receipt here:</p>
    <a href="${receiptUrl}" style="display:inline-block;padding:12px 24px;background-color:#cc0000;color:#ffffff;border-radius:4px;text-decoration:none;font-weight:bold;">View Receipt</a>
    <p style="margin-top:24px;">We appreciate your support!</p>
    <p>Regards,<br/><strong>Thaalam media GmbH</strong></p>
  `);

  return await sendEmail({
    toEmail,
    subject: "Your Payment Receipt - Thaalam Media",
    htmlContent,
    attachments: [logoAttachment],
  });
};

const sendRjPasswordEmail = async (toEmail, toName, plainPassword) => {
  const htmlContent = emailLayout(`
    <h2 style="margin:0 0 16px 0;color:#111111;">Hi ${toName},</h2>
    <p>Welcome to <strong>Thaalam Media</strong>!</p>
    <p>Your User profile has been successfully created. Here are your login credentials:</p>
    <div style="background:#fff7f7;border-radius:6px;padding:16px;margin:20px 0;    ">
      <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${toEmail}</p>
      <p style="margin:0;"><strong>Password:</strong> ${plainPassword}</p>
    </div>
    <p>You can now log in to Admin dashboard and manage your profile and content.</p>
    <a href="https://thaalam.ch/A8J3K9Z5QW" style="display:inline-block;padding:12px 24px;background-color:#cc0000;color:#ffffff;border-radius:4px;text-decoration:none;font-weight:bold;">Login Now</a>
    <p style="margin-top:24px;">Please keep this information safe and secure.</p>
    <p>Regards,<br/><strong>Thaalam media GmbH</strong></p>
  `);

  return await sendEmail({
    toEmail,
    subject: "Your User profile Credentials - Thaalam Media",
    htmlContent,
    attachments: [logoAttachment],
  });
};

const sendEnquiryEmail = async (toEmail, toName, subjectText, messageText) => {
  const htmlContent = emailLayout(`
    <h2 style="margin:0 0 16px 0;color:#111111;">Hello ${toName},</h2>
    <p>Thank you for getting in touch with <strong>Thaalam Media</strong>!</p>
    <p>We have received your enquiry and our team will get back to you soon.</p>
    <div style="background:#f9f9f9;border-radius:6px;padding:16px;margin:20px 0;  solid #111111;">
      <h3 style="margin:0 0 10px 0;font-size:15px;">Your Enquiry Details:</h3>
      <p style="margin:0 0 6px 0;">${subjectText}</p>
      <p style="margin:0;">${messageText}</p>
    </div>
    <p>We appreciate your interest and will respond as quickly as possible.</p>
    <p style="margin-top:24px;">Regards,<br/><strong>Thaalam media GmbH</strong></p>
  `);

  return await sendEmail({
    toEmail,
    subject: "We've Received Your Enquiry - Thaalam Media",
    htmlContent,
    attachments: [logoAttachment],
  });
};

const sendCareerEmail = async (toEmail, toName, subjectText) => {
  const htmlContent = emailLayout(`
    <h2 style="margin:0 0 16px 0;color:#111111;">Hello ${toName},</h2>
    <p>Thank you for applying to <strong>Thaalam Media</strong>!</p>
    <p>We have successfully received your application. Our recruitment team will carefully review your profile and get back to you if your qualifications match our requirements.</p>
    <div style="background:#f9f9f9;border-radius:6px;padding:16px;margin:20px 0;  solid #111111;">
      <h3 style="margin:0 0 10px 0;font-size:15px;">Your Application Summary:</h3>
      <p style="margin:0;"><strong>Position Applied:</strong> ${subjectText}</p>
    </div>
    <p>Please note: If your profile is shortlisted, our HR team will contact you within the next few weeks.</p>
    <p>We appreciate the time and effort you put into your application, and we wish you the best of luck in the process.</p>
    <p style="margin-top:24px;">Regards,<br/><strong>Thaalam Media HR Team</strong></p>
  `);

  return await sendEmail({
    toEmail,
    subject: "Thank you for Applying - Thaalam Media",
    htmlContent,
    attachments: [logoAttachment],
  });
};

const sendPodcastCreatorEmail = async (toEmail, toName) => {
  const htmlContent = emailLayout(`
    <h2 style="margin:0 0 16px 0;color:#111111;">Hello ${toName},</h2>
    <p>Thank you for applying to become a <strong>Podcast Creator</strong> with <strong>Thaalam Media</strong>.</p>
    <p>We've received your application and our <strong>Admin Team</strong> will review your details shortly.</p>
    <div style="background:#fff7f7;border-radius:6px;padding:16px;margin:20px 0;    ">
      <p style="margin:0 0 6px 0;"><strong>Current Status:</strong> <span style="color:#cc0000;">Pending Verification</span></p>
      <p style="margin:0;font-size:13px;color:#666;">Once your profile is verified, you will receive a separate email with your podcast creator <strong>login credentials</strong> (username and temporary password).</p>
    </div>
    <p>After your account is activated, you'll be able to:</p>
    <ul style="margin:8px 0 16px 18px;padding:0;font-size:14px;">
      <li>Upload and manage your podcast episodes</li>
      <li>Submit podcasts for admin review</li>
      <li>Get your approved podcasts published on the main Thaalam application</li>
    </ul>
    <p>If you have any questions in the meantime, feel free to reply to this email.</p>
    <p style="margin-top:24px;">Warm regards,<br/><strong>Thaalam media GmbH</strong></p>
  `);

  return await sendEmail({
    toEmail,
    subject: "Thank you for Applying as Podcast Creator - Thaalam",
    htmlContent,
    attachments: [logoAttachment],
  });
};

const creatorCredentialSharing = async (toName, toEmail, password) => {
  const htmlContent = emailLayout(`
    <h2 style="margin:0 0 16px 0;color:#cc0000;">🎙 Podcast Creator Access Approved</h2>
    <p>Hello <strong>${toName}</strong>,</p>
    <p>Congratulations! Your Podcast Creator profile is verified and approved by Thaalam.</p>
    <p>You can now log in to your <strong>Podcast Publishing Dashboard</strong> using these credentials:</p>
    <div style="background:#fff7f7;border-radius:6px;padding:16px;margin:20px 0;    ">
      <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${toEmail}</p>
      <p style="margin:0;"><strong>Temporary Password:</strong> ${password}</p>
    </div>
    <p>This account is authorization-controlled. Any podcasts you publish will go to admin review before it becomes public on the main podcast page.</p>
    <p>Please change your password after your first login (optional but recommended).</p>
    <p style="margin-top:24px;">Warm Regards,<br/><strong>Thaalam Media</strong></p>
  `);

  return await sendEmail({
    toEmail,
    subject: "Podcast Creator Portal Access - Approved",
    htmlContent,
    attachments: [logoAttachment],
  });
};

const creatorRejectionTemplate = async (toName, toEmail, reason) => {
  const htmlContent = emailLayout(`
    <h2 style="margin:0 0 16px 0;color:#111111;">Podcast Creator Request Update</h2>
    <p>Hello ${toName},</p>
    <p>Your Podcast Creator request was reviewed, but unfortunately it was not approved at this time.</p>
    <div style="background:#f9f9f9;border-radius:6px;padding:16px;margin:20px 0;    ">
      <p style="margin:0 0 8px 0;"><strong>Status:</strong> <span style="color:#cc0000;">Rejected</span></p>
      <p style="margin:0;"><strong>Reason:</strong> ${reason}</p>
    </div>
    <p>You may correct and reapply anytime. If you need help, just reply to this mail.</p>
    <p style="margin-top:24px;">Regards,<br/><strong>Thaalam Media</strong></p>
  `);

  return await sendEmail({
    toEmail,
    subject: "Podcast Creator Request - Reviewed",
    htmlContent,
    attachments: [logoAttachment],
  });
};

const sendCreatorOTP = async (toName, toEmail, otp) => {
  const htmlContent = emailLayout(`
    <h2 style="margin:0 0 16px 0;color:#111111;">Hello ${toName},</h2>
    <p>We received a request to reset your password for your Podcast Creator account.</p>
    <div style="text-align:center;background:#fff7f7;padding:20px;border-radius:6px;    margin:20px 0;">
      <h1 style="color:#cc0000;letter-spacing:4px;font-size:32px;margin:0;">${otp}</h1>
      <p style="font-size:13px;color:#666;margin:8px 0 0 0;">This OTP is valid for <strong>5 minutes</strong></p>
    </div>
    <p style="font-size:14px;color:#444;">If you did not request this, you can safely ignore this email — your account is still secure.</p>
    <p style="margin-top:24px;">Warm Regards,<br/><strong>Thaalam Media</strong></p>
  `);

  return await sendEmail({
    toEmail,
    subject: "Your Password Reset OTP",
    htmlContent,
    attachments: [logoAttachment],
  });
};

const sendCrewAccessEmail = async (toEmail, plainPassword) => {
  const htmlContent = emailLayout(`
    <h2 style="margin:0 0 16px 0;color:#cc0000;">Crew Portal Access Activated</h2>
    <p>Your crew access for <strong>Thaalam Media</strong> has been activated.</p>
    <div style="background:#fff7f7;border-radius:6px;padding:16px;margin:20px 0;    ">
      <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${toEmail}</p>
      <p style="margin:0;"><strong>Temporary Password:</strong> ${plainPassword}</p>
    </div>
    <p>Please login using the link below:</p>
    <a href="https://thaalam.ch/crew-portal" style="display:inline-block;padding:12px 24px;background-color:#cc0000;color:#ffffff;border-radius:4px;text-decoration:none;font-weight:bold;">Login to Crew Portal</a>
    <p style="margin-top:16px;">⚠ We recommend changing your password after first login.</p>
    <p style="margin-top:24px;">Regards,<br/><strong>Thaalam media GmbH</strong></p>
  `);

  return await sendEmail({
    toEmail,
    subject: "Crew Portal Access - Thaalam Media",
    htmlContent,
    attachments: [logoAttachment],
  });
};

const sendCrewOtpEmail = async (toEmail, otp) => {
  const htmlContent = emailLayout(`
    <h2 style="margin:0 0 16px 0;color:#111111;">Hello,</h2>
    <p>We received a request to reset your crew portal password.</p>
    <div style="text-align:center;background:#fff7f7;padding:20px;border-radius:6px;    margin:20px 0;">
      <p style="margin:0;font-size:13px;color:#666;">Your OTP Code</p>
      <h1 style="color:#cc0000;letter-spacing:6px;font-size:34px;margin:8px 0 0 0;">${otp}</h1>
      <p style="font-size:13px;color:#888;margin:8px 0 0 0;">Valid for 5 minutes</p>
    </div>
    <p style="font-size:14px;color:#444;">Enter this OTP in the password reset screen to create a new password.</p>
    <p style="font-size:14px;color:#777;">If you did not request a password reset, you can safely ignore this email.</p>
    <p style="margin-top:24px;">Regards,<br/><strong>Thaalam media GmbH</strong></p>
  `);

  return await sendEmail({
    toEmail,
    subject: "Your OTP for Password Reset - Thaalam Crew Access",
    htmlContent,
    attachments: [logoAttachment],
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
  sendCareerEmail,
  sendPodcastCreatorEmail,
  creatorCredentialSharing,
  creatorRejectionTemplate,
  sendCreatorOTP,
  sendCrewOtpEmail,
  sendCrewAccessEmail,
};
