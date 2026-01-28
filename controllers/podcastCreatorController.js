const fs = require("fs");
const db = require("../models");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const pagination = require("../utils/pagination");
const { uploadToCpanel } = require("../services/uploadToCpanel");
const sendNotification = require("../services/sendNotification");
const {
  sendPodcastCreatorEmail,
  creatorCredentialSharing,
  creatorRejectionTemplate,
  generateOTP,
  sendCreatorOTP,
} = require("../utils/sendEmail");

const { PodcastCreator } = db;

exports.createPodcastCreator = async (req, res) => {
  const profile = req.files?.profile?.[0] || null;
  const idProof = req.files?.id_proof?.[0] || null;

  try {
    // 1. Basic required fields validation
    const requiredFields = [
      "name",
      "email",
      "phone",
      "gender",
      "address1",
      "country",
      "state",
      "city",
      "date_of_birth",
    ];

    for (let field of requiredFields) {
      if (!req.body[field] || String(req.body[field]).trim() === "") {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    const { email, phone } = req.body;

    const existUser = await PodcastCreator.findOne({ where: { email } });
    if (existUser) {
      return res
        .status(409)
        .json({ message: "Creator request already exists with this email." });
    }

    const existPhone = await PodcastCreator.findOne({ where: { phone } });
    if (existPhone) {
      return res.status(409).json({
        message: "Creator request already exists with this phone number.",
      });
    }

    let profileLink = null;
    if (profile?.path) {
      profileLink = await uploadToCpanel(
        profile.path,
        "podcastCreator/profile",
        profile.originalname,
      );
      if (fs.existsSync(profile.path)) {
        fs.unlinkSync(profile.path);
      }
    }

    let idProofLink = null;
    if (idProof?.path) {
      idProofLink = await uploadToCpanel(
        idProof.path,
        "podcastCreator/id-proof",
        idProof.originalname,
      );
      if (fs.existsSync(idProof.path)) {
        fs.unlinkSync(idProof.path);
      }
    }

    let socialLinks = null;
    if (req.body.social_links) {
      try {
        socialLinks =
          typeof req.body.social_links === "string"
            ? JSON.parse(req.body.social_links)
            : req.body.social_links;
      } catch (e) {
        return res
          .status(400)
          .json({ message: "Invalid JSON format for social_links" });
      }
    }

    const creator = await PodcastCreator.create({
      name: req.body.name,
      email,
      phone,
      gender: req.body.gender,
      date_of_birth: req.body.date_of_birth,
      bio: req.body.bio || null,
      profile: profileLink,
      address1: req.body.address1,
      address2: req.body.address2 || null,
      country: req.body.country,
      state: req.body.state,
      city: req.body.city,
      id_proof_name: req.body.id_proof_name || null,
      id_proof_link: idProofLink,
      reason_to_join: req.body.reason_to_join || null,
      experience: req.body.experience || null,
      social_links: socialLinks,
      status: "pending",
    });

    await sendPodcastCreatorEmail(creator.email, creator.name);

    try {
      await sendNotification(req.app, {
        title: "Podcast Creator Application",
        message: `${creator.name} applied for Podcast creator`,
        type: "career",
        created_by: creator.name,
      });
    } catch (error) {
      console.error("Notification emit failed:", error.message);
    }

    return res.status(201).json({
      message: "Podcast Creator request submitted successfully!",
    });
  } catch (error) {
    try {
      if (profile && fs.existsSync(profile.path)) fs.unlinkSync(profile.path);
      if (idProof && fs.existsSync(idProof.path)) fs.unlinkSync(idProof.path);
    } catch (e) {
      console.error("File cleanup failed:", e.message);
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409)
        .json({ message: "Email or phone already registered as creator." });
    }

    return res.status(500).json({
      message: "Failed to submit creator request",
      error: error.message,
    });
  }
};

exports.listPodcastCreators = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const whereCondition = {};

    if (req.query.status) {
      whereCondition.status = req.query.status;
    }

    if (req.query.search) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${req.query.search}%` } },
        { email: { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    const result = await pagination(PodcastCreator, {
      page,
      limit,
      where: whereCondition,
    });

    res.status(200).json({
      message: "Data fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to list creators",
      error: error.message,
    });
  }
};

exports.listCreators = async (req, res) => {
  try {
    const creators = await PodcastCreator.findAll({
      attributes: ["id", "name"],
    });

    res.status(200).json({
      data: creators,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to list creators" });
  }
};

exports.updateCreatorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    const validStatus = ["pending", "approved", "rejected"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    const creator = await PodcastCreator.findOne({ where: { id } });
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    if (
      status === "rejected" &&
      (!rejection_reason || rejection_reason.trim() === "")
    ) {
      return res.status(400).json({
        message: "Rejection reason is required when status is rejected",
      });
    }
    const verifiedBy = req.user?.email === "admin" ? "Admin" : req.user?.email;

    if (status === "pending") {
      await creator.update({
        status,
        verified_by: null,
        verified_at: null,
      });
    }

    if (status === "approved") {
      const tempPassword = crypto.randomInt(10000000, 99999999).toString();
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      await creator.update({
        status,
        password: hashedPassword,
        verified_by: verifiedBy || null,
        verified_at: new Date(),
        rejection_reason: null,
      });

      await creatorCredentialSharing(creator.name, creator.email, tempPassword);
    }

    if (status === "rejected") {
      await creator.update({
        status,
        rejection_reason,
        verified_by: verifiedBy || null,
        verified_at: new Date(),
      });

      await creatorRejectionTemplate(
        creator.name,
        creator.email,
        rejection_reason,
      );
    }

    res.status(200).json({
      message: "Creator status updated ",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update status",
      error: error.message,
    });
  }
};

exports.loginPodcastCreator = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const creator = await PodcastCreator.findOne({
      where: {
        email: username,
        status: "approved",
      },
    });

    if (!creator) {
      return res.status(404).json({
        message: "Creator with this email not found OR status not approved",
      });
    }

    const passwordMatch = await bcrypt.compare(password, creator.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      { id: creator.id, email: creator.email, name: creator.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login Successful",
      data: creator,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to login",
      error: error.message,
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { id } = req.params;

    const creator = await PodcastCreator.findOne({
      where: {
        id,
      },
    });

    if (!creator) {
      return res.status(404).json({
        message: "Creator with this email not found",
      });
    }

    const { previousPassword, newPassword } = req.body;

    const comparePassword = await bcrypt.compare(
      previousPassword,
      creator.password,
    );

    if (!comparePassword) {
      return res.status(401).json({
        message: "Invalid Password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await creator.update({
      password: hashedPassword,
      password_changed_at: new Date(),
    });

    res.status(201).json({
      message: "Password updated succesfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update Password",
      error: error.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        message: "Please provide email ID",
      });
    }

    const creator = await PodcastCreator.findOne({
      where: {
        email,
      },
    });

    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await creator.update({
      reset_otp: otp,
      reset_otp_expires: expiresAt,
    });

    await sendCreatorOTP(creator.name, creator.email, otp);

    res.status(200).json({
      message: "Otp sent successfully to your registered email",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Forgot password failed",
      error: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "All required fields are mandatory." });
    }

    const creator = await PodcastCreator.findOne({
      where: {
        email,
      },
    });

    if (!creator) {
      return res.status(404).json({
        message: "Creator not found",
      });
    }

    if (creator.reset_otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP entered" });
    }

    if (Date.now() > new Date(creator.reset_otp_expires).getTime()) {
      return res
        .status(410)
        .json({ message: "OTP is expired, request again." });
    }
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password and confirm password must match." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await creator.update({
      password: hashedPassword,
      password_changed_at: new Date(),
      reset_otp: null,
      reset_otp_expires: null,
    });

    return res
      .status(200)
      .json({ message: "Password updated successfully using OTP " });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to verify OTP", error: error.message });
  }
};

exports.getCreatorDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const creator = await PodcastCreator.findByPk(id);

    if (!creator) {
      return res.status(404).json({
        status: "error",
        message: "creator not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Creator details fetched successfully",
      data: creator,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch details",
      error: error.message,
    });
  }
};
