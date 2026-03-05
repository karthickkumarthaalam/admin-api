const fs = require("fs");
const { CrewVisa } = require("../models");
const { uploadToR2, deleteFromR2 } = require("../services/crewUpload");

// ===============================
// BULK SAVE VISAS
// ===============================
exports.bulkSaveVisas = async (req, res) => {
  try {
    let { crew_list_id, visas } = req.body;

    if (!crew_list_id) {
      return res.status(400).json({
        success: false,
        message: "crew_list_id required",
      });
    }

    // parse if string
    if (typeof visas === "string") {
      visas = JSON.parse(visas);
    }

    if (!Array.isArray(visas)) {
      return res.status(400).json({
        success: false,
        message: "visas must be array",
      });
    }

    // existing visas
    const existingVisas = await CrewVisa.findAll({
      where: { crew_list_id },
    });

    const existingIds = existingVisas.map((v) => v.id);
    const incomingIds = visas.filter((v) => v.id).map((v) => v.id);

    // ===============================
    // DELETE removed visas
    // ===============================
    const toDelete = existingIds.filter((id) => !incomingIds.includes(id));

    for (const id of toDelete) {
      const visa = existingVisas.find((v) => v.id === id);

      // delete file from R2
      if (visa?.visa_file_url) {
        const key = visa.visa_file_url.replace(
          process.env.R2_PUBLIC_URL + "/",
          "",
        );
        await deleteFromR2(key);
      }

      await CrewVisa.destroy({ where: { id } });
    }

    // ===============================
    // CREATE / UPDATE
    // ===============================
    for (let i = 0; i < visas.length; i++) {
      const v = visas[i];

      let fileUrl = v.visa_file_url || null;
      let fileName = v.visa_file_name || null;

      const fileKey = `visa_${i}`;
      const file = req.files?.find((fl) => fl.fieldname === fileKey);

      if (file) {
        // delete old file if updating
        if (v.id) {
          const existing = existingVisas.find((x) => x.id === v.id);
          if (existing?.visa_file_url) {
            const key = existing.visa_file_url.replace(
              process.env.R2_PUBLIC_URL + "/",
              "",
            );
            await deleteFromR2(key);
          }
        }

        // upload new file
        fileUrl = await uploadToR2(file.path, "crew/visa", file.originalname);

        fileName = file.originalname;

        fs.unlinkSync(file.path);
      }

      const payload = {
        crew_list_id,
        visa_type: v.visa_type,
        visa_number: v.visa_number,
        country: v.country,
        date_of_issue: v.date_of_issue,
        date_of_expiry: v.date_of_expiry,
        visa_verified: v.visa_verified ?? false,
        currency: v.currency,
        visa_charge: v.visa_charge,
        visa_file_url: fileUrl,
        visa_file_name: fileName,
        remarks: v.remarks,
      };

      if (v.id) {
        await CrewVisa.update(payload, { where: { id: v.id } });
      } else {
        await CrewVisa.create(payload);
      }
    }

    return res.json({
      success: true,
      message: "Visas saved successfully",
    });
  } catch (error) {
    console.error("bulkSaveVisas error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.createVisa = async (req, res) => {
  try {
    const {
      crew_list_id,
      visa_type,
      visa_number,
      country,
      date_of_issue,
      date_of_expiry,
      visa_verified,
      remarks,
      currency,
      visa_charge,
    } = req.body;

    if (!crew_list_id) {
      return res.status(400).json({
        success: false,
        message: "crew_list_id required",
      });
    }

    let fileUrl = null;
    let fileName = null;

    // upload file
    if (req.file) {
      fileUrl = await uploadToR2(
        req.file.path,
        "crew/visa",
        req.file.originalname,
      );
      fileName = req.file.originalname;
      fs.unlinkSync(req.file.path);
    }

    const visa = await CrewVisa.create({
      crew_list_id,
      visa_type,
      visa_number,
      country,
      date_of_issue,
      date_of_expiry,
      visa_verified: visa_verified || false,
      visa_file_url: fileUrl,
      visa_file_name: fileName,
      remarks,
      currency,
      visa_charge,
    });

    res.json({
      success: true,
      message: "Visa created successfully",
      data: visa,
    });
  } catch (error) {
    console.error("createVisa error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.updateVisa = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await CrewVisa.findByPk(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Visa not found",
      });
    }

    let fileUrl = existing.visa_file_url;
    let fileName = existing.visa_file_name;

    // if new file uploaded
    if (req.file) {
      // delete old file
      if (existing.visa_file_url) {
        const key = existing.visa_file_url.replace(
          process.env.R2_PUBLIC_URL + "/",
          "",
        );
        await deleteFromR2(key);
      }

      // upload new
      fileUrl = await uploadToR2(
        req.file.path,
        "crew/visa",
        req.file.originalname,
      );
      fileName = req.file.originalname;

      fs.unlinkSync(req.file.path);
    }

    await existing.update({
      visa_type: req.body.visa_type,
      visa_number: req.body.visa_number,
      country: req.body.country,
      date_of_issue: req.body.date_of_issue,
      date_of_expiry: req.body.date_of_expiry,
      visa_verified: req.body.visa_verified,
      visa_file_url: fileUrl,
      visa_file_name: fileName,
      remarks: req.body.remarks,
      currency: req.body.currency,
      visa_charge: req.body.visa_charge,
    });

    res.json({
      success: true,
      message: "Visa updated successfully",
    });
  } catch (error) {
    console.error("updateVisa error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===============================
// GET VISAS BY CREW
// ===============================
exports.getVisasByCrew = async (req, res) => {
  try {
    const { crew_list_id } = req.params;

    const data = await CrewVisa.findAll({
      where: { crew_list_id },
      order: [["id", "ASC"]],
    });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("getVisasByCrew error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.deleteVisa = async (req, res) => {
  try {
    const { id } = req.params;

    const visa = await CrewVisa.findByPk(id);
    if (!visa) {
      return res.status(404).json({
        success: false,
        message: "Visa not found",
      });
    }

    // delete file from R2
    if (visa.visa_file_url) {
      const key = visa.visa_file_url.replace(
        process.env.R2_PUBLIC_URL + "/",
        "",
      );
      await deleteFromR2(key);
    }

    await visa.destroy();

    res.json({
      success: true,
      message: "Visa deleted successfully",
    });
  } catch (error) {
    console.error("deleteVisa error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
