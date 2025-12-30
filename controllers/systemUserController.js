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
const fs = require("fs");
const { sendRjPasswordEmail } = require("../utils/sendEmail");
const pagination = require("../utils/pagination");

/* -----------------------------------------------------------
   🟢 CREATE SYSTEM USER (with transaction)
----------------------------------------------------------- */
exports.createSystemUser = async (req, res) => {
  const transaction = await SystemUsers.sequelize.transaction();

  try {
    const body = req.body;

    // ✅ Required validation
    if (!body.name || !body.email) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Name and Email are required fields" });
    }

    // ✅ Sanitize dates (handle "Invalid date" or empty)
    const safeDate = (val) => {
      if (!val || val === "Invalid date" || isNaN(new Date(val))) return null;
      return new Date(val);
    };

    const dateOfBirth = safeDate(body.date_of_birth);
    const dateOfJoining = safeDate(body.date_of_joining);

    // ✅ Duplicate email check
    const existingEmail = await SystemUsers.findOne({
      where: { email: body.email },
    });
    if (existingEmail) {
      await transaction.rollback();
      return res.status(400).json({ message: "Email already exists" });
    }

    // ✅ Create linked User
    const plainPassword = crypto.randomBytes(6).toString("hex");
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const user = await User.create(
      {
        email: body.email,
        password: hashedPassword,
        role:
          body.is_admin === "true" || body.is_admin === true ? "admin" : "user",
      },
      { transaction }
    );

    // ✅ Handle image upload (local)
    const imageUrl = req.files?.profile_image?.[0]?.path || null;

    // ✅ Create SystemUser safely
    const systemUser = await SystemUsers.create(
      {
        ...body,
        date_of_birth: dateOfBirth,
        date_of_joining: dateOfJoining,
        status: "inactive",
        image_url: imageUrl,
        user_id: user.id,
        share_access:
          body.share_access === "true" || body.share_access === true,
        is_admin: body.is_admin === "true" || body.is_admin === true,
        show_profile:
          body.show_profile === "true" || body.show_profile === true,
      },
      { transaction }
    );

    await transaction.commit();

    if (systemUser.share_access) {
      try {
        await sendRjPasswordEmail(body.email, body.name, plainPassword);
      } catch (err) {
        console.warn("⚠️ Email send failed:", err.message);
      }
    }

    res.status(201).json({
      message: "System user created successfully",
      data: systemUser,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error creating system user:", error);
    res.status(500).json({
      message: "Failed to create system user",
      error: error.message,
    });
  }
};

/* -----------------------------------------------------------
   🟡 UPDATE SYSTEM USER (with transaction)
----------------------------------------------------------- */
exports.updateSystemUser = async (req, res) => {
  const transaction = await SystemUsers.sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      email,
      name,
      remove_image,
      employee_id,
      share_access,
      is_admin,
      ...restBody
    } = req.body;

    const systemUser = await SystemUsers.findByPk(id, {
      include: { model: User, as: "users" },
      transaction,
    });
    if (!systemUser) return res.status(404).json({ message: "User not found" });

    const userRecord = systemUser.users;

    // ✅ Sanitize dates before update
    const safeDate = (val) => {
      if (!val || val === "Invalid date" || isNaN(new Date(val))) return null;
      return new Date(val);
    };

    const dateOfBirth = safeDate(restBody.date_of_birth);
    const dateOfJoining = safeDate(restBody.date_of_joining);

    // ✅ Email check
    if (email && email !== userRecord.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res
          .status(400)
          .json({ message: "Another user with this email already exists" });
      }

      userRecord.email = email;
    }

    // ✅ Employee ID check
    if (employee_id && employee_id !== systemUser.employee_id) {
      const employeeIdTaken = await SystemUsers.findOne({
        where: { employee_id },
      });
      if (employeeIdTaken)
        return res.status(400).json({ message: "Employee ID already taken" });
    }

    // ✅ Share access update logic
    const newShareAccess = share_access === "true" || share_access === true;
    if (!systemUser.share_access && newShareAccess) {
      const plainPassword = crypto.randomBytes(6).toString("hex");
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      userRecord.password = hashedPassword;
      try {
        await sendRjPasswordEmail(
          email || userRecord.email,
          name || systemUser.name,
          plainPassword
        );
      } catch (err) {
        console.warn("⚠️ Email sending failed:", err.message);
      }
    }

    // ✅ Update admin role
    if (is_admin !== undefined) {
      userRecord.role =
        is_admin === true || is_admin === "true" ? "admin" : "user";
    }
    await userRecord.save({ transaction });

    // ✅ Handle Image
    let imageUrl = systemUser.image_url;
    const file = req.files?.profile_image?.[0];

    if (remove_image === "true" || remove_image === true) {
      if (imageUrl && fs.existsSync(imageUrl)) {
        fs.unlinkSync(imageUrl);
      }
      imageUrl = null;
    }

    if (file) {
      if (imageUrl && fs.existsSync(imageUrl)) fs.unlinkSync(imageUrl);
      imageUrl = file.path;
    }

    await systemUser.update(
      {
        ...restBody,
        name,
        email,
        employee_id,
        date_of_birth: dateOfBirth,
        date_of_joining: dateOfJoining,
        share_access: newShareAccess,
        is_admin: is_admin === true || is_admin === "true",
        image_url: imageUrl,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(200).json({
      message: "User updated successfully",
      data: systemUser,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Update error:", error);
    res.status(500).json({
      message: "Failed to update user",
      error: error.message,
    });
  }
};

/* -----------------------------------------------------------
   🔵 UPDATE STATUS
----------------------------------------------------------- */
exports.updateSystemUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

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

/* -----------------------------------------------------------
   🔴 DELETE USER (with rollback safety)
----------------------------------------------------------- */
exports.deleteSystemUser = async (req, res) => {
  const transaction = await SystemUsers.sequelize.transaction();
  try {
    const { id } = req.params;

    const user = await SystemUsers.findByPk(id, {
      include: { model: User, as: "users" },
      transaction,
    });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    const userRecord = user.users;

    // Delete image locally
    if (user.image_url && fs.existsSync(user.image_url)) {
      fs.unlinkSync(user.image_url);
    }

    if (userRecord) await userRecord.destroy({ transaction });
    await user.destroy({ transaction });

    await transaction.commit();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};

/* -----------------------------------------------------------
   🟣 GET ALL SYSTEM USERS (with pagination)
----------------------------------------------------------- */
exports.getAllSystemUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const filterConditions = {};
    const includeConditions = [{ model: Department, as: "department" }];

    if (req.query.search) {
      const q = `%${req.query.search}%`;
      filterConditions[Op.or] = [
        { name: { [Op.like]: q } },
        { email: { [Op.like]: q } },
      ];
    }

    if (req.query.show_profile) {
      filterConditions.show_profile = req.query.show_profile === "true";
    }

    if (req.query.status) {
      filterConditions.status = req.query.status;
    }

    if (req.query.department) {
      includeConditions[0].where = {
        department_name: { [Op.like]: `%${req.query.department}%` },
      };
    }

    const result = await pagination(SystemUsers, {
      page,
      limit,
      where: filterConditions,
      include: includeConditions,
      order: [["createdAt", "ASC"]],
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

/* -----------------------------------------------------------
   🟤 GET SYSTEM USER BY ID
----------------------------------------------------------- */
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

exports.getSystemUserByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    const systemUser = await SystemUsers.findOne({
      where: {
        user_id,
      },
      include: [
        {
          model: Department,
          as: "department",
        },
      ],
    });

    if (!systemUser) {
      return res.status(404).json({ messge: "user not found" });
    }

    res
      .status(200)
      .json({ message: "User fetched successfully", data: systemUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: error.message });
  }
};

/* -----------------------------------------------------------
   🎙 GET USERS WITH PROGRAMS
----------------------------------------------------------- */
exports.getSystemUsersWithPrograms = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const skipId = req.query.skipId ? parseInt(req.query.skipId) : null;

    const whereCondition = { show_profile: true };
    if (skipId) whereCondition.id = { [Op.ne]: skipId };

    const users = await SystemUsers.findAll({
      where: whereCondition,
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
      limit: limit || undefined,
      order: limit ? Sequelize.literal("RAND()") : [["id", "DESC"]],
    });

    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      image: u.image_url,
      description: u.description,
      shows: u.radio_programs.map((p) => ({
        category: p.program_category?.category,
        startTime: p.program_category?.start_time,
        endTime: p.program_category?.end_time,
      })),
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error("❌ Error fetching RJ users:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/* -----------------------------------------------------------
   🧾 GET RJ PROFILE BY ID
----------------------------------------------------------- */
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

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        imageUrl: user.image_url,
        description: user.description,
        radioPrograms: user.radio_programs.map((p) => ({
          id: p.id,
          category: p.program_category.category,
          startTime: p.program_category.start_time,
          endTime: p.program_category.end_time,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
