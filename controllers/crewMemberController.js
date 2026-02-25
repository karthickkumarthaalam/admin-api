const {
  CrewManagementList,
  CrewFlights,
  CrewRooms,
  sequelize,
} = require("../models");
const XLSX = require("xlsx");
const formatExcelDate = require("../utils/formatExcelDate");

// 🟢 CREATE crew member
exports.createCrewMember = async (req, res) => {
  try {
    const {
      crew_management_id,
      given_name,
      sur_name,
      date_of_birth,
      contact_number,
      email_id,
      gender,
      nationality,
      designation,
      passport_number,
      date_of_issue,
      date_of_expiry,
      visa_type,
      visa_number,
      visa_issue,
      visa_expiry,
      food_preference,
      room_preference,
      flight_class,
      remarks,
    } = req.body;

    const data = await CrewManagementList.create({
      crew_management_id,
      given_name,
      sur_name,
      date_of_birth: date_of_birth || null,
      contact_number: contact_number || null,
      email_id: email_id || null,
      gender: gender || null,
      nationality: nationality || null,
      designation: designation || null,
      passport_number: passport_number || null,
      date_of_issue: date_of_issue || null,
      date_of_expiry: date_of_expiry || null,
      visa_type: visa_type || null,
      visa_number: visa_number || null,
      visa_issue: visa_issue || null,
      visa_expiry: visa_expiry || null,
      food_preference: food_preference || null,
      flight_class,
      room_preference: room_preference || null,
      remarks: remarks || null,
      status: "in-active",
    });

    res.status(201).json({
      success: true,
      message: "Crew member added",
      data,
    });
  } catch (error) {
    console.error("createCrewMember error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🟢 GET crew by crew_management_id
exports.getCrewByManagementId = async (req, res) => {
  try {
    const { crew_management_id } = req.params;

    const data = await CrewManagementList.findAll({
      where: { crew_management_id },
      include: [
        { model: CrewFlights, as: "flights" },
        { model: CrewRooms, as: "rooms" },
      ],
      order: [
        [
          sequelize.literal(`
      CASE 
        WHEN status = 'active' THEN 0
        WHEN status = 'in-active' THEN 1
        ELSE 2
      END
    `),
          "ASC",
        ],
        ["createdAt", "DESC"],
      ],
    });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("getCrewByManagementId error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🟢 GET single crew full details
exports.getCrewById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await CrewManagementList.findByPk(id, {
      include: [
        { model: CrewFlights, as: "flights" },
        { model: CrewRooms, as: "rooms" },
      ],
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Crew not found",
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("getCrewById error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateCrewMemberStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "in-active"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const crew = await CrewManagementList.findByPk(id);
    if (!crew)
      return res
        .status(404)
        .json({ success: false, message: "Crew not found" });

    await crew.update({ status });

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🟢 UPDATE crew member
exports.updateCrewMember = async (req, res) => {
  try {
    const { id } = req.params;

    const crew = await CrewManagementList.findByPk(id);
    if (!crew) {
      return res.status(404).json({
        success: false,
        message: "Crew not found",
      });
    }

    await crew.update(req.body);

    res.json({
      success: true,
      message: "Crew updated",
      data: crew,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🟢 DELETE crew (soft delete)
exports.deleteCrewMember = async (req, res) => {
  try {
    const { id } = req.params;

    const crew = await CrewManagementList.findByPk(id);
    if (!crew) {
      return res.status(404).json({
        success: false,
        message: "Crew not found",
      });
    }

    await crew.destroy();

    res.json({
      success: true,
      message: "Crew deleted",
    });
  } catch (error) {
    console.error("deleteCrewMember error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.uploadCrewExcel = async (req, res) => {
  try {
    const { crew_management_id } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Excel required" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    let rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      return res.status(400).json({ success: false, message: "Excel empty" });
    }

    rows = rows.map((row) => {
      const newRow = {};
      Object.keys(row).forEach((key) => {
        newRow[key.toLowerCase().trim()] = row[key];
      });
      return newRow;
    });

    const existingCrew = await CrewManagementList.findAll({
      where: { crew_management_id },
      attributes: ["passport_number"],
    });

    const existingPassports = new Set(
      existingCrew.map((c) => c.passport_number),
    );

    const newData = [];

    for (const row of rows) {
      const passport = row["passport number"] || row["passport_number"];

      const givenName = row["given name"]?.toString().trim();
      const surName = row["surname"]?.toString().trim();

      if (!givenName && !surName) continue;

      if (passport && existingPassports.has(passport)) continue;

      newData.push({
        crew_management_id,
        given_name: row["given name"] || null,
        sur_name: row["surname"] || null,
        contact_number: row["contact number"] || null,
        email_id: row["email id"] || null,
        designation: row["show designation"] || null,

        date_of_birth: formatExcelDate(row["dob"]),
        passport_number: passport || null,
        date_of_expiry: formatExcelDate(row["passport expiry date"]),

        status: "in-active",
      });
    }

    if (!newData.length) {
      return res.json({
        success: true,
        message: "No new crew to upload (all already exist)",
      });
    }

    await CrewManagementList.bulkCreate(newData);

    res.json({
      success: true,
      message: `${newData.length} crew uploaded successfully`,
    });
  } catch (error) {
    console.error("Excel upload error:", error);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
};
