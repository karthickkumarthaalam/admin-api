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

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const sendOtpEmail = async (toEmail, toName, otp) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Hello ${toName},</h2>
      <p>Your OTP for password reset is:</p>
      <h1 style="color: #d63384;">${otp}</h1>
      <p>This OTP is valid for 5 minutes.</p>
      <br>
      <p>Regards,<br>Thaalam media GmbH</p>
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
    subject: "Your Password Reset OTP",
    htmlContent,
    attachments,
  });
};

const verificationEmail = async (toEmail, toName, otp) => {
  const htmlContent = `   
     <div style="font-family: Arial, sans-serif; color: #333;>
        <h2>Hello ${toName}, </h2>
        <p>Verify your account</p>
        <h1 style="color: #d63384;">${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
        <br>
        <p>Regard,<br>Thaalam media GmbH</p>
        <img src="cid:logoimg" alt-"Thaalam Media Logo" style="width: 150px; margin-top: 20px;"+/> 
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
    subject: "Verification OTP ",
    htmlContent,
    attachments,
  });
};

const sendExpiryEmail = async (toEmail, toName, expiryDate) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Hello ${toName},</h2>
      <p>Your subscription is expired!!!</p>
      <p>Please renew to continue enjoying our services.</p>
      <br>
      <p>Regards,<br>Thaalam media GmbH</p>
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
    subject: "Subscription Expiry Notice",
    htmlContent,
    attachments,
  });
};

const sendPreExpiryEmail = async (toEmail, toName, expiryDate) => {
  const htmlContent = `
     <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Hello ${toName}</h2>
        <p>Your subscription is expiring on:</p>
        <h1 style="color: #d63384;">${expiryDate}</h1>
        <p>Please renew to continue enjoying our services.</p>
        <br>
        <p>Regards,<br>Thaalam media GmbH</p>
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
    subject: "Subscription Pre Expiry Notice",
    htmlContent,
    attachments,
  });
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
      <p>Regards,<br>Thaalam media GmbH</p>
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

const sendPaymentReceiptEmail = async (
  toEmail,
  toName,
  packageName,
  amount,
  currency,
  receiptUrl,
) => {
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
      <p>Regards,<br>Thaalam media GmbH</p>
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
      <p>Regards,<br>Thaalam media GmbH</p>

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
        <p>Regards,<br>Thaalam media GmbH</p>

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
    subject: "We’ve Received Your Enquiry - Thaalam Media",
    htmlContent,
    attachments,
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
    },
  ];

  return await sendEmail({
    toEmail,
    subject: "Thank you for Applying - Thaalam Media",
    htmlContent,
    attachments,
  });
};

const sendPodcastCreatorEmail = async (toEmail, toName) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #222; max-width: 600px; margin: 0 auto;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        <tr>
          <td style="padding: 16px 0;">
            <img src="cid:logoimage" alt="Thaalam Media" style="width: 160px;"/>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0 0 0;">
            <h2 style="font-size: 22px; margin: 0 0 10px 0;">Hello ${toName},</h2>
            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
              Thank you for applying to become a <strong>Podcast Creator</strong> with <strong>Thaalam Media</strong>
            </p>
            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
              We’ve received your application and our <strong>Admin Team</strong> will review your details shortly.
            </p>
          </td>
        </tr>
  
        <tr>
          <td>
            <div style="background:#f8f8f8; border-radius: 6px; padding: 12px 14px; border-left: 4px solid #cc0000; margin: 16px 0;">
              <p style="margin: 0; font-size: 14px;">
                <strong>Current Status:</strong> <span style="color:#cc0000;">Pending Verification</span>
              </p>
              <p style="margin: 6px 0 0 0; font-size: 13px; color:#666;">
                Once your profile is verified, you will receive a separate email with your podcast creator
                <strong>login credentials</strong> (username and temporary password).
              </p>
            </div>
          </td>
        </tr>
  
        <tr>
          <td>
            <p style="font-size: 14px; line-height: 1.6; margin: 10px 0;">
              After your account is activated, you’ll be able to:
            </p>
            <ul style="font-size: 14px; margin: 4px 0 12px 18px; padding: 0;">
              <li>Upload and manage your podcast episodes</li>
              <li>Submit podcasts for admin review</li>
              <li>Get your approved podcasts published on the main Thaalam application</li>
            </ul>
          </td>
        </tr>
  
        <tr>
          <td>
            <p style="font-size: 14px; line-height: 1.6; margin: 10px 0;">
              If you have any questions in the meantime, feel free to reply to this email.
            </p>
            <p style="font-size: 14px; margin: 16px 0 4px 0;">
              Warm regards,<br/>
              <strong>Thaalam media GmbH</strong>
            </p>
          </td>
        </tr>
      </table>
    </div>
    `;

  const attachments = [
    {
      filename: "thaalam-logo.png",
      path: path.join(__dirname, "../public/assets/thaalam-logo.png"),
      cid: "logoimage",
    },
  ];

  // Send acknowledgement mail
  await sendEmail({
    toEmail: toEmail,
    subject: "Thank you for Applying as Podcast Creator - Thaalam",
    htmlContent,
    attachments,
  });
};

const creatorCredentialSharing = async (toName, toEmail, password) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color:#222; max-width:600px; padding:8px;border-radius:8px;;>
          <h2 style="color:#cc0000;">🎙 Podcast Creator Access Approved</h2>
          <p>Hello <strong>${toName}</strong>,</p>
          <p>Congratulations! Your Podcast Creator profile is verified and approved by Thaalam</p>
          <p>You can now log in to your <strong>Podcast Publishing Dashboard</strong> using these credentials:</p>

          <div style="padding:12px 16px; margin:16px 0; background:#fff7f7; border-left:4px solid #cc0000;border-radius:6px;">
            <p><strong>Email:</strong> ${toEmail}</p>
            <p><strong>Temporary Password:</strong> ${password}</p>
          </div>

          <p>This account is authorization-controlled. Any podcasts you publish will go to admin review before it becomes public on the main podcast page.</p>
          <p>Please change your password after your first login (optional but recommended).</p>

          <br>
          <p>Warm Regards,<br><strong>Thaalam Media</strong></p>
          <img src="cid:logoimage" width="120" style="margin-top:16px;"/>
        </div>
  `;

  const attachments = [
    {
      filename: "thaalam-logo.png",
      path: path.join(__dirname, "../public/assets/thaalam-logo.png"),
      cid: "logoimage",
    },
  ];

  await sendEmail({
    toEmail: toEmail,
    subject: "Podcast Creator Portal Access - Approved ",
    htmlContent,
    attachments,
  });
};

const creatorRejectionTemplate = async (toName, toEmail, reason) => {
  const htmlContent = `
   <div style="font-family: Arial, sans-serif; color:#222; max-width:520px; padding:8px;">
          <h2 style="color:#cc0000;">Podcast Creator Request Update</h2>
          <p>Hello ${toName},</p>
          <p>Your Podcast Creator request was reviewed, but unfortunately it was not approved at this time.</p>

          <div style="padding:10px; margin:14px 0; background:#f8f8f8;border-left:4px solid #cc0000;border-radius:6px;">
            <p><strong>Status:</strong> Rejected</p>
            <p><strong>Reason:</strong> ${reason}</p>
          </div>

          <p>You may correct and reapply anytime. If you need help, just reply to this mail.</p>

          <br>
          <p>Regards,<br><strong>Thaalam Media</strong></p>
          <img src="cid:logoimage" width="120" style="margin-top:16px;"/>
        </div>
  `;

  const attachments = [
    {
      filename: "thaalam-logo.png",
      path: path.join(__dirname, "../public/assets/thaalam-logo.png"),
      cid: "logoimage",
    },
  ];

  await sendEmail({
    toEmail: toEmail,
    subject: "Podcast Creator Request - Reviewed",
    htmlContent,
    attachments,
  });
};

const sendCreatorOTP = async (toName, toEmail, otp) => {
  const htmlContent = `
  <div style="font-family: 'Inter', Arial, sans-serif; background: #ffffff; padding: 22px; border-radius: 12px; max-width: 480px; margin: auto; border: 1px solid #eaeaea;">
  <div style="text-align:center; margin-bottom:18px;">
    <img src="cid:logoimage" width="120" />
  </div>

  <h2 style="font-size: 20px; color:#111; margin-bottom:6px;">Hello ${toName},</h2>
  <p style="font-size: 15px; color:#555; margin-top:0;">We received a request to reset your password for your Podcast Creator account.</p>

  <div style="text-align:center; background:#fff7f7; padding:16px; border-radius:8px; margin:18px 0; border-left: 4px solid #cc0000;">
     <h1 style="color:#cc0000; letter-spacing:3px; font-size:28px; margin:4px 0;">${otp}</h1>
     <p style="font-size:13px; color:#666; margin-top:6px;">This OTP is valid for <strong>5 minutes</strong> ⏱</p>
  </div>

  <p style="font-size:14px; color:#444;">If you did not request this, you can safely ignore this email — your account is still secure.</p>

  <hr style="border:none; border-top:1px solid #eee; margin:22px 0;"/>

  <p style="font-size:14px; margin-bottom:2px;">Warm Regards,<br/>
    <strong>Thaalam Media</strong>
  </p>
</div>
  `;

  const attachments = [
    {
      filename: "thaalam-logo.png",
      path: path.join(__dirname, "../public/assets/thaalam-logo.png"),
      cid: "logoimage",
    },
  ];

  await sendEmail({
    toEmail: toEmail,
    subject: "Your Password Reset OTP",
    htmlContent,
    attachments,
  });
};

const sendCrewAccessEmail = async (toEmail, plainPassword) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color:#222; max-width:600px; padding:12px;">
      <h2 style="color:#cc0000;">Crew Portal Access Activated</h2>
      
      
      <p>Your crew access for <strong>Thaalam Media</strong> has been activated.</p>

      <div style="padding:14px; margin:18px 0; background:#fff7f7; border-left:4px solid #cc0000; border-radius:6px;">
        <p><strong>Email:</strong> ${toEmail}</p>
        <p><strong>Temporary Password:</strong> ${plainPassword}</p>
      </div>

      <p>Please login using the link below:</p>

      <a href="https://thaalam.ch/crew-login"
        style="display:inline-block;padding:10px 20px;background-color:#cc0000;color:white;border-radius:4px;text-decoration:none;">
        Login to Crew Portal
      </a>

      <p style="margin-top:15px;">⚠ We recommend changing your password after first login.</p>

      <br>
      <p>Regards,<br><strong>Thaalam media GmbH</strong></p>

      <img src="cid:logoimage" width="120" style="margin-top:16px;"/>
    </div>
  `;

  const attachments = [
    {
      filename: "thaalam-logo.png",
      path: path.join(__dirname, "../public/assets/thaalam-logo.png"),
      cid: "logoimage",
    },
  ];

  await sendEmail({
    toEmail,
    subject: "Crew Portal Access - Thaalam Media",
    htmlContent,
    attachments,
  });
};

const sendCrewOtpEmail = async (toEmail, otp) => {
  const htmlContent = `
  <div style="font-family: Arial, sans-serif; background:#f6f7fb; padding:30px;">
    <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:10px;padding:30px;border:1px solid #eee;">
      
      <div style="text-align:center;margin-bottom:20px;">
        <img src="cid:logoimage" alt="Thaalam Media" width="140"/>
      </div>

      <h2 style="margin:0;color:#222;">Hello,</h2>
      <p style="font-size:15px;color:#555;margin-top:8px;">
        We received a request to reset your crew portal password.
      </p>

      <div style="margin:25px 0;padding:18px;background:#fef2f2;border-left:4px solid #cc0000;border-radius:6px;text-align:center;">
        <p style="margin:0;font-size:14px;color:#666;">Your OTP Code</p>
        <h1 style="margin:8px 0 0 0;font-size:34px;letter-spacing:6px;color:#cc0000;">
          ${otp}
        </h1>
        <p style="font-size:13px;color:#888;margin-top:8px;">
          Valid for 5 minutes
        </p>
      </div>

      <p style="font-size:14px;color:#444;">
        Enter this OTP in the password reset screen to create a new password.
      </p>

      <p style="font-size:14px;color:#777;margin-top:18px;">
        If you did not request a password reset, you can safely ignore this email.
      </p>

      <hr style="border:none;border-top:1px solid #eee;margin:25px 0;" />

      <p style="font-size:14px;margin:0;">
        Regards,<br/>
        <strong>Thaalam media GmbH</strong>
      </p>

      <div style="text-align:center;margin-top:20px;">
        <img src="cid:logoimage" width="110"/>
      </div>

    </div>
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
    subject: "Your OTP for Password Reset - Thaalam Crew Access",
    htmlContent,
    attachments,
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
