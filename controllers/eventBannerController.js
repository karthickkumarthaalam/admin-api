const fs = require("fs");
const path = require("path");
const db = require("../models");
const { EventBanner, Event } = db;
const {
  uploadToCpanel,
  deleteFromCpanel,
} = require("../services/uploadToCpanel");

exports.addBanner = async (req, res) => {
  try {
    const { event_id, type, order_index, status } = req.body;

    if (!event_id) {
      return res.status(400).json({
        status: "error",
        message: "Event ID is required",
      });
    }

    const event = await Event.findByPk(event_id);
    if (!event) {
      return res.status(404).json({
        status: "error",
        message: "Event not found",
      });
    }

    const file = req.files?.file?.[0];
    if (!file) {
      return res.status(400).json({
        status: "error",
        message: "Banner file is required",
      });
    }

    const remoteFolder = "Events/banners";
    const fileUrl = await uploadToCpanel(
      file.path,
      remoteFolder,
      file.originalname
    );

    // remove temp file
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

    const newBanner = await EventBanner.create({
      event_id,
      url: fileUrl,
      type: type || "image",
      order_index: order_index || 0,
      status: status || "inactive",
    });

    res.status(200).json({
      status: "success",
      message: "Banner uploaded successfully",
      data: newBanner,
    });
  } catch (error) {
    console.error("❌ Error adding banner:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to upload banner",
      error: error.message,
    });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, order_index, status } = req.body;

    const banner = await EventBanner.findByPk(id);
    if (!banner) {
      return res.status(404).json({
        status: "error",
        message: "Banner not found.",
      });
    }

    let updatedUrl = banner.url;
    const file = req.files?.file?.[0];
    const remoteFolder = "Events/banners";

    if (file) {
      const newFileName = file.originalname;
      const oldFileName = banner.url ? path.basename(banner.url) : "";

      // ✅ Only replace if filenames differ
      if (!oldFileName || oldFileName !== newFileName) {
        try {
          // 🗑️ Delete old banner from server (if any)
          if (oldFileName) {
            await deleteFromCpanel(remoteFolder, oldFileName);
          }
          // 📤 Upload new banner file
          updatedUrl = await uploadToCpanel(
            file.path,
            remoteFolder,
            newFileName
          );
        } catch (err) {
          console.warn("⚠️ File handling warning:", err.message);
        } finally {
          // 🧹 Always clean up local temp file
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }
      } else {
        // ✅ Same file name — skip upload, just clean local file
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    }

    // 🧩 Update banner record
    await banner.update({
      url: updatedUrl,
      type: type || banner.type,
      order_index: order_index ?? banner.order_index,
      status: status,
    });

    res.status(200).json({
      status: "success",
      message: "Banner updated successfully.",
      data: banner,
    });
  } catch (error) {
    console.error("❌ Error updating banner:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update banner.",
      error: error.message,
    });
  }
};

exports.updateBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const eventBanner = await EventBanner.findByPk(id);

    if (!eventBanner) {
      return res.status(404).json({
        status: "error",
        message: "Event banner not found",
      });
    }

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid status value",
      });
    }

    await eventBanner.update({ status });

    res.status(200).json({
      status: "success",
      message: `Banner status updated to ${status}`,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to update banner status",
      error: error.message,
    });
  }
};

exports.listBannersByEventId = async (req, res) => {
  try {
    const { event_id } = req.params;

    // Validate event_id
    if (!event_id) {
      return res.status(400).json({
        status: "error",
        message: "Event ID is required",
      });
    }

    // Check if event exists (optional but recommended)
    const eventExists = await Event.findByPk(event_id);
    if (!eventExists) {
      return res.status(404).json({
        status: "error",
        message: "Event not found",
      });
    }

    // Fetch banners related to the event
    const banners = await EventBanner.findAll({
      where: { event_id },
      order: [["order_index", "ASC"]],
    });

    if (!banners.length) {
      return res.status(200).json({
        status: "success",
        message: "No banners found for this event",
        data: [],
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Event banners fetched successfully",
      data: banners,
    });
  } catch (error) {
    console.error("Error fetching event banners:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch event banners",
      error: error.message,
    });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await EventBanner.findByPk(id);

    if (!banner)
      return res.status(404).json({
        status: "error",
        message: "Banner not found",
      });

    const remoteFolder = "Events/banners";
    const fileName = banner.url?.split("/").pop().split("?")[0].split("#")[0];

    if (fileName) {
      try {
        await deleteFromCpanel(remoteFolder, fileName);
      } catch (err) {
        console.warn("⚠️ Failed to delete remote file:", err.message);
      }
    }

    await banner.destroy();

    res.status(200).json({
      status: "success",
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting banner:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete banner",
      error: error.message,
    });
  }
};
