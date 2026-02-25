const db = require("../models");
const { CrewManagement } = db;
const { Op } = require("sequelize");
const pagination = require("../utils/pagination");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const {
  sendCrewAccessEmail,
  generateOTP,
  sendCrewOtpEmail,
} = require("../utils/sendEmail");

exports.getNextCrewId = async (req, res) => {
  try {
    const lastCrew = await CrewManagement.findOne({
      order: [["createdAt", "DESC"]],
    });

    let lastId = 1;
    const year = new Date().getFullYear();

    if (lastCrew && lastCrew.crew_id) {
      const match = lastCrew.crew_id.match(/^TMA(\d{4})(\d{3})$/);

      if (match) {
        const lastNumber = parseInt(match[2], 10);
        lastId = lastNumber + 1;
      }
    }

    const padded = String(lastId).padStart(3, "0");
    const crewNumber = `TMA${year}${padded}`;

    return res.status(200).json({
      status: "success",
      crew_id: crewNumber,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to generate crew id",
      error: error.message,
    });
  }
};

exports.createCrewManagement = async (req, res) => {
  try {
    const { crew_id, title, description, email } = req.body;
    const userId = req.user?.id;

    if (!crew_id || !title) {
      return res.status(400).json({
        success: false,
        message: "crew_id and title are required",
      });
    }

    const existing = await CrewManagement.findOne({ where: { crew_id } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Crew ID already exists",
      });
    }

    const data = await CrewManagement.create({
      crew_id,
      title,
      description,
      email: email || null,
      created_by: userId,
    });
    return res.status(201).json({
      success: true,
      message: "Crew management created successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create crew management",
    });
  }
};

exports.getCrewManagementById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await CrewManagement.findByPk(id, {
      include: [
        {
          association: "crew_members",
        },
      ],
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Crew management not found",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("getCrewManagementById error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllCrewManagement = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const where = {};

    if (req.query.search) {
      const searchQuery = `%${req.query.search}%`;
      where[Op.or] = [{ title: { [Op.like]: searchQuery } }];
    }

    const result = await pagination(CrewManagement, {
      page,
      limit,
      where,
    });

    return res.status(200).json({
      message: "Crew fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateCrewManagement = async (req, res) => {
  try {
    const { id } = req.params;
    const { crew_id, title, description, email } = req.body;

    const data = await CrewManagement.findByPk(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Crew management not found",
      });
    }

    await data.update({
      crew_id: crew_id ?? data.crew_id,
      title: title ?? data.title,
      email: email ?? data.email,
      description: description ?? data.description,
    });

    return res.json({
      success: true,
      message: "Updated successfully",
      data,
    });
  } catch (error) {
    console.error("updateCrewManagement error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteCrewManagement = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await CrewManagement.findByPk(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Crew management not found",
      });
    }

    await data.destroy();

    return res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    console.error("deleteCrewManagement error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.toggleCrewStatusWithEmail = async (req, res) => {
  try {
    const { id } = req.params;

    const crew = await CrewManagement.findByPk(id);
    if (!crew) {
      return res
        .status(404)
        .json({ success: false, message: "Crew not found" });
    }

    crew.is_active = !crew.is_active;

    if (crew.is_active && !crew.password && crew.email) {
      const plainPassword = crypto.randomBytes(4).toString("hex"); // 8 char password

      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      crew.password = hashedPassword;

      await crew.save();

      await sendCrewAccessEmail(crew.email, plainPassword);

      return res.json({
        success: true,
        message: "Crew activated & credentials sent via email",
        is_active: crew.is_active,
      });
    }

    await crew.save();

    return res.json({
      success: true,
      message: `Crew ${
        crew.is_active ? "activated" : "deactivated"
      } successfully`,
      is_active: crew.is_active,
    });
  } catch (error) {
    console.error("toggleCrewStatus error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.toggleCrewStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const crew = await CrewManagement.findByPk(id);
    if (!crew) {
      return res
        .status(404)
        .json({ success: false, message: "Crew not found" });
    }

    crew.is_active = !crew.is_active;

    let generatedPassword = null;

    if (crew.is_active && !crew.password) {
      const plainPassword = crypto.randomBytes(4).toString("hex");
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      crew.password = hashedPassword;
      generatedPassword = plainPassword;
    }

    await crew.save();

    return res.json({
      success: true,
      message: `Crew ${
        crew.is_active ? "activated" : "deactivated"
      } successfully`,
      is_active: crew.is_active,

      ...(generatedPassword && { generatedPassword }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const crew = await CrewManagement.findOne({ where: { email } });

    if (!crew) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    if (!crew.is_active) {
      return res.status(403).json({
        success: false,
        message: "Access disabled by admin",
      });
    }

    if (!crew.password) {
      return res.status(400).json({
        success: false,
        message: "Password not set. Contact admin",
      });
    }

    const match = await bcrypt.compare(password, crew.password);

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        crew_id: crew.id,
        email: crew.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      crew: {
        id: crew.id,
        crew_id: crew.crew_id,
        title: crew.title,
        email: crew.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { id } = req.params;

    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password required",
      });
    }

    const crew = await CrewManagement.findByPk(id);
    if (!crew) {
      return res.status(404).json({
        success: false,
        message: "Crew not found",
      });
    }

    if (!crew.password) {
      return res.status(400).json({
        success: false,
        message: "Password not set yet",
      });
    }

    const isMatch = await bcrypt.compare(old_password, crew.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    crew.password = hashedPassword;

    await crew.save();

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }

    const crew = await CrewManagement.findOne({ where: { email } });

    if (!crew) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    const otp = generateOTP();

    crew.otp = otp;
    crew.otp_expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    await crew.save();

    await sendCrewOtpEmail(email, otp);

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updatePasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;

    if (!email || !otp || !new_password) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password required",
      });
    }

    const crew = await CrewManagement.findOne({ where: { email } });

    if (!crew) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!crew.otp || crew.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (new Date() > crew.otp_expiry) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    const hashed = await bcrypt.hash(new_password, 10);

    crew.password = hashed;
    crew.otp = null;
    crew.otp_expiry = null;

    await crew.save();

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
