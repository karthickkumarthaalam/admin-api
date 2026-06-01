const fs = require("fs");
const { Op } = require("sequelize");
const path = require("path");
const { NewsAdvertisement } = require("../models");
const { uploadToR2, deleteFromR2 } = require("../services/crewUpload");
const {
  uploadToCpanel,
  deleteFromCpanel,
} = require("../services/uploadToCpanel");
const pagination = require("../utils/pagination");
const moment = require("moment");

exports.createAdvertisement = async (req, res) => {
  let imageUrl = null;
  try {
    const {
      headline,
      tag,
      sub,
      cta,
      redirect_link,
      is_active,
      start_date,
      end_date,
      size,
    } = req.body;

    if (!headline || !tag) {
      return res.status(400).json({
        status: "error",
        message: "Required field is empty",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Image is required",
      });
    }

    const remoteFolder = "News/advertisements";
    imageUrl = await uploadToCpanel(
      req.file.path,
      remoteFolder,
      req.file.originalname,
    );

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    const advertisement = await NewsAdvertisement.create({
      image_url: imageUrl,
      headline,
      tag,
      sub,
      cta,
      redirect_link,
      is_active: is_active !== undefined ? is_active : true,
      start_date: start_date || null,
      end_date: end_date || null,
      size: size || "small",
    });

    res.status(201).json({
      success: true,
      message: "Advertisement created successfully",
      data: advertisement,
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      status: "error",
      message: "Failed to create advertisement",
      error: error.message,
    });
  }
};

exports.getAdvertisements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const whereCondition = {};

    if (req.query.search) {
      const searchKeyword = req.query.search;

      whereCondition[Op.or] = [
        {
          headline: {
            [Op.like]: `%${searchKeyword}%`,
          },
        },
        {
          sub: {
            [Op.like]: `%${searchKeyword}%`,
          },
        },
        {
          tag: {
            [Op.like]: `%${searchKeyword}%`,
          },
        },
      ];
    }

    if (req.query.size) {
      whereCondition.size = req.query.size;
    }

    const result = await pagination(NewsAdvertisement, {
      page,
      limit,
      where: whereCondition,
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      status: "success",
      message: "Advertisements fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch advertisements",
      error: error.message,
    });
  }
};

exports.getActiveAdvertisement = async (req, res) => {
  try {
    const swissNow = moment().tz("Europe/Zurich").format("YYYY-MM-DD HH:mm:ss");

    const advertisements = await NewsAdvertisement.findAll({
      where: {
        is_active: true,

        [Op.and]: [
          {
            [Op.or]: [
              { start_date: null },
              {
                start_date: {
                  [Op.lte]: swissNow,
                },
              },
            ],
          },

          {
            [Op.or]: [
              { end_date: null },
              {
                end_date: {
                  [Op.gte]: swissNow,
                },
              },
            ],
          },
        ],
      },

      order: [["start_date", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: advertisements,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch advertisements",
      error: error.message,
    });
  }
};

exports.getAdvertisementById = async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = await NewsAdvertisement.findByPk(id);

    if (!advertisement) {
      return res.status(404).json({
        status: "error",
        message: "Advertisement not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: advertisement,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch advertisement",
      error: error.message,
    });
  }
};
exports.updateAdvertisement = async (req, res) => {
  let imageUrl = null;

  try {
    const { id } = req.params;

    const advertisement = await NewsAdvertisement.findByPk(id);

    if (!advertisement) {
      return res.status(404).json({
        status: "error",
        message: "Advertisement not found",
      });
    }

    const {
      headline,
      tag,
      sub,
      cta,
      redirect_link,
      is_active,
      start_date,
      end_date,
      size,
    } = req.body;

    if (!headline || !tag) {
      return res.status(400).json({
        status: "error",
        message: "Headline and tag are required",
      });
    }

    imageUrl = advertisement.image_url;

    if (req.file) {
      const remoteFolder = "News/advertisements";
      if (advertisement.image_url) {
        const fileName = path.basename(advertisement.image_url);
        await deleteFromCpanel(remoteFolder, fileName);
      }

      imageUrl = await uploadToCpanel(
        req.file.path,
        remoteFolder,
        req.file.originalname,
      );

      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    await advertisement.update({
      image_url: imageUrl,
      headline,
      tag,
      sub,
      cta,
      redirect_link,
      is_active: is_active !== undefined ? is_active : advertisement.is_active,
      start_date: start_date || null,
      end_date: end_date || null,
      size: size || advertisement.size,
    });

    res.status(200).json({
      status: "success",
      message: "Advertisement updated successfully",
      data: advertisement,
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      status: "error",
      message: "Failed to update advertisement",
      error: error.message,
    });
  }
};

exports.deleteAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = await NewsAdvertisement.findByPk(id);

    if (!advertisement) {
      return res.status(404).json({
        status: "error",
        message: "Advertisement not found",
      });
    }

    if (advertisement.image_url) {
      const fileName = path.basename(advertisement.image_url);
      await deleteFromCpanel("News/advertisements", fileName);
    }
    await advertisement.destroy();

    res.status(200).json({
      status: "success",
      message: "Advertisement deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete advertisement",
      error: error.message,
    });
  }
};

exports.updateAdsStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { is_active } = req.body;

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        status: "error",
        message: "is_active must be boolean",
      });
    }

    const advertisement = await NewsAdvertisement.findByPk(id);

    if (!advertisement) {
      return res.status(404).json({
        status: "error",
        message: "Advertisement not found",
      });
    }

    advertisement.is_active = is_active;

    await advertisement.save();

    res.status(200).json({
      status: "success",
      message: "Status updated successfully",
      data: advertisement,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to update status",
      error: error.message,
    });
  }
};
