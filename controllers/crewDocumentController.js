const fs = require("fs");
const { CrewManagementList } = require("../models");
const { uploadToR2, deleteFromR2 } = require("../services/uploadToR2");

exports.uploadPassportFiles = async (req, res) => {
  try {
    const { crewId } = req.params;

    const crew = await CrewManagementList.findByPk(crewId);
    if (!crew) {
      return res.status(404).json({
        success: false,
        message: "Crew not found",
      });
    }

    if (!req.files || !req.files.length) {
      return res.status(400).json({
        success: false,
        message: "No passport files uploaded",
      });
    }

    if (crew.passport_files && crew.passport_files.length) {
      for (const url of crew.passport_files) {
        const key = url.replace(process.env.R2_PUBLIC_URL + "/", "");
        await deleteFromR2(key);
      }
    }

    let uploadedUrls = [];

    for (const file of req.files) {
      const url = await uploadToR2(
        file.path,
        "crew/passport",
        file.originalname,
      );
      uploadedUrls.push(url);
      fs.unlinkSync(file.path);
    }

    await crew.update({ passport_files: uploadedUrls });

    res.json({
      success: true,
      message: "Passport uploaded successfully",
      passport_files: uploadedUrls,
    });
  } catch (error) {
    console.error("uploadPassportFiles error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.uploadVisaFiles = async (req, res) => {
  try {
    const { crewId } = req.params;

    const crew = await CrewManagementList.findByPk(crewId);
    if (!crew) {
      return res.status(404).json({
        success: false,
        message: "Crew not found",
      });
    }

    if (!req.files || !req.files.length) {
      return res.status(400).json({
        success: false,
        message: "No visa files uploaded",
      });
    }

    if (crew.visa_files && crew.visa_files.length) {
      for (const url of crew.visa_files) {
        const key = url.replace(process.env.R2_PUBLIC_URL + "/", "");
        await deleteFromR2(key);
      }
    }

    let uploadedUrls = [];

    for (const file of req.files) {
      const url = await uploadToR2(file.path, "crew/visa", file.originalname);
      uploadedUrls.push(url);
      fs.unlinkSync(file.path);
    }

    await crew.update({ visa_files: uploadedUrls });

    res.json({
      success: true,
      message: "Visa uploaded successfully",
      visa_files: uploadedUrls,
    });
  } catch (error) {
    console.error("uploadVisaFiles error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteSinglePassport = async (req, res) => {
  try {
    const { crewId } = req.params;
    const { fileUrl } = req.body;

    const crew = await CrewManagementList.findByPk(crewId);
    if (!crew) return res.status(404).json({ success: false });

    let files = crew.passport_files || [];

    const key = fileUrl.replace(process.env.R2_PUBLIC_URL + "/", "");
    await deleteFromR2(key);

    files = files.filter((f) => f !== fileUrl);

    await crew.update({ passport_files: files });

    res.json({
      success: true,
      message: "Passport file removed",
      passport_files: files,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

exports.deleteSingleVisa = async (req, res) => {
  try {
    const { crewId } = req.params;
    const { fileUrl } = req.body;

    const crew = await CrewManagementList.findByPk(crewId);
    if (!crew) return res.status(404).json({ success: false });

    let files = crew.visa_files || [];

    const key = fileUrl.replace(process.env.R2_PUBLIC_URL + "/", "");
    await deleteFromR2(key);

    files = files.filter((f) => f !== fileUrl);

    await crew.update({ visa_files: files });

    res.json({
      success: true,
      message: "Visa file removed",
      visa_files: files,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};
