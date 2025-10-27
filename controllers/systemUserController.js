const {
  SystemUsers,
  Department,
  User,
  RadioProgram,
  ProgramCategory,
} = require("../models");
const { Op, Sequelize } = require("sequelize");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const pagination = require("../utils/pagination");
const fs = require("fs");
const { sendRjPasswordEmail } = require("../utils/sendEmail");

// Create System User
exports.createSystemUser = async (req, res) => {
  try {
    const {
      name,
      email,
      employee_id,
      gender,
      date_of_birth,
      date_of_joining,
      phone_number,
      whatsapp_number,
      address,
      country,
      state,
      city,
      description,
      department_id,
      share_access,
      is_admin,
      show_profile,
      bank_name,
      ifsc_code,
      account_number,
      pan_number,
      uan_number,
    } = req.body;

    const existingUser = await SystemUsers.findOne({
      where: { email, employee_id },
    });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or employee ID already exists",
      });
    }

    const plainPassword = crypto.randomBytes(6).toString("hex");
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: is_admin === true || is_admin === "true" ? "admin" : "user",
    });

    const imageUrl = req.files["profile_image"]
      ? req.files["profile_image"][0].path
      : null;

    const systemUser = await SystemUsers.create({
      name,
      email,
      employee_id,
      gender,
      date_of_birth,
      phone_number,
      whatsapp_number,
      address,
      country,
      state,
      city,
      description,
      department_id,
      status: "inactive",
      image_url: imageUrl,
      user_id: user.id,
      is_admin,
      show_profile,
      share_access,
      date_of_joining,
      bank_name: bank_name || null,
      ifsc_code: ifsc_code || null,
      account_number: account_number || null,
      pan_number: pan_number || null,
      uan_number: uan_number || null,
    });

    if (share_access === true || share_access === "true") {
      await sendRjPasswordEmail(email, name, plainPassword);
    }
    res
      .status(201)
      .json({ message: "System user created successfully", data: systemUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create system user", error: error.message });
  }
};

// Update System User
exports.updateSystemUser = async (req, res) => {
  try {
    const { id } = req.params;
    const systemUser = await SystemUsers.findByPk(id, { include: "users" });
    if (!systemUser) return res.status(404).json({ message: "User not found" });

    const userRecord = systemUser.users;

    const { email, name, employee_id, share_access, is_admin, ...restBody } =
      req.body;

    // Email change & duplication check
    if (email && email !== userRecord.email) {
      const emailTaken = await User.findOne({ where: { email } });
      if (emailTaken) {
        return res
          .status(400)
          .json({ message: "Another user with this email already exists" });
      }
      userRecord.email = email;
    }
    if (employee_id && employee_id !== systemUser.employee_id) {
      const employeeIdTaken = await SystemUsers.findOne({
        where: { employee_id },
      });
      if (employeeIdTaken) {
        return res.status(400).json({ message: "Employee Id already taken" });
      }
    }
    // console.log(systemUser, "showing system User");

    // Share access -> send new password
    const newShareAccess = share_access === true || share_access === "true";

    if (!systemUser.share_access && newShareAccess) {
      // Only send email if it was previously false and now being set to true
      const plainPassword = crypto.randomBytes(6).toString("hex");
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      userRecord.password = hashedPassword;
      await sendRjPasswordEmail(
        userRecord.email,
        name || systemUser.name,
        plainPassword
      );
    }

    // is_admin -> update role
    if (is_admin !== undefined) {
      userRecord.role =
        is_admin === true || is_admin === "true" ? "admin" : "user";
    }

    await userRecord.save(); // single update

    // Image update
    let imageUrl = systemUser.image_url;
    if (req.files["profile_image"]) {
      if (imageUrl && fs.existsSync(imageUrl)) {
        fs.unlinkSync(imageUrl);
      }
      imageUrl = req.files["profile_image"][0].path;
    }

    await systemUser.update({
      ...restBody,
      name: name,
      email: email,
      share_access,
      is_admin,
      image_url: imageUrl,
      employee_id: employee_id,
    });

    res
      .status(200)
      .json({ message: "User updated successfully", data: systemUser });
  } catch (error) {
    console.log(error, "showing error");
    res
      .status(500)
      .json({ message: "Failed to update user", error: error.message });
  }
};

// Update Status
exports.updateSystemUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = await SystemUsers.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update({ status });

    res
      .status(200)
      .json({ message: "Status updated successfully", data: user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update status", error: error.message });
  }
};

// Delete User
exports.deleteSystemUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await SystemUsers.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.image_url && fs.existsSync(user.image_url)) {
      fs.unlinkSync(user.image_url);
    }

    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};

// Get All Users
exports.getAllSystemUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const filterConditions = {};
    const includeConditions = [{ model: Department, as: "department" }];

    if (req.query.search) {
      const searchQuery = `%${req.query.search}%`;
      filterConditions[Op.or] = [
        { name: { [Op.like]: searchQuery } },
        { email: { [Op.like]: searchQuery } },
      ];
    }

    if (req.query.show_profile) {
      filterConditions.show_profile = req.query.show_profile === "true";
    }

    if (req.query.department) {
      const departmentNameQuery = `%${req.query.department}%`;
      includeConditions[0].where = {
        department_name: { [Op.like]: departmentNameQuery },
      };
    }

    const result = await pagination(SystemUsers, {
      page,
      limit,
      where: filterConditions,
      order: [["createdAt", "ASC"]],
      include: includeConditions,
    });

    res.status(200).json({
      message: "Users fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
};

// Get User by ID
exports.getSystemUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await SystemUsers.findByPk(id, {
      include: [{ model: Department, as: "department" }],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User fetched successfully", data: user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: error.message });
  }
};

exports.getSystemUsersWithPrograms = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const skipId = req.query.skipId ? parseInt(req.query.skipId) : null;

    const whereCondition = { show_profile: true };
    if (skipId) {
      whereCondition.id = { [Op.ne]: skipId };
    }

    const users = await SystemUsers.findAll({
      where: whereCondition,
      attributes: ["id", "name", "image_url", "description"],
      include: [
        {
          model: RadioProgram,
          as: "radio_programs",
          required: false,
          include: [
            {
              model: ProgramCategory,
              as: "program_category",
              attributes: ["id", "category", "start_time", "end_time"],
            },
          ],
        },
      ],
      limit: limit || undefined,
      order: limit ? Sequelize.literal("RAND()") : [["id", "DESC"]],
    });

    const formatted = users.map((user) => ({
      id: user.id,
      name: user.name,
      image: user.image_url,
      description: user.description,
      shows: (user.radio_programs || []).map((rp) => ({
        category: rp.program_category?.category || null,
        startTime: rp.program_category?.start_time || null,
        endTime: rp.program_category?.end_time || null,
      })),
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching users with programs:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getRjUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await SystemUsers.findByPk(id, {
      attributes: ["id", "name", "image_url", "description"],
      include: [
        {
          model: RadioProgram,
          as: "radio_programs",
          include: [
            {
              model: ProgramCategory,
              as: "program_category",
              attributes: ["id", "category", "start_time", "end_time"],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const formattedUser = {
      id: user.id,
      name: user.name,
      imageUrl: user.image_url,
      description: user.description,
      radioPrograms: user.radio_programs.map((program) => ({
        id: program.id,
        category: program.program_category.category,
        startTime: program.program_category.start_time,
        endTime: program.program_category.end_time,
      })),
    };

    return res.status(200).json({ success: true, data: formattedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
