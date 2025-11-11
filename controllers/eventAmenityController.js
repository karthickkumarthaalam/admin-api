const fs = require("fs");
const path = require("path");
const db = require("../models");
const { EventAmenity, Event } = db;
const {
  uploadToCpanel,
  deleteFromCpanel,
} = require("../services/uploadToCpanel");

// 🟢 Add Amenity
exports.addAmenity = async (req, res) => {
  try {
    const { event_id, name, description, status } = req.body;

    if (!event_id || !name) {
      return res.status(400).json({
        status: "error",
        message: "Event ID and name are required",
      });
    }

    const event = await Event.findByPk(event_id);
    if (!event) {
      return res.status(404).json({
        status: "error",
        message: "Event not found",
      });
    }

    const file = req.files?.amenity_image?.[0];

    let fileUrl = null;
    if (file) {
      const remoteFolder = "Events/amenities";

      fileUrl = await uploadToCpanel(
        file.path,
        remoteFolder,
        file.originalname
      );

      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

    const newAmenity = await EventAmenity.create({
      event_id,
      name,
      description,
      image: fileUrl,
      status: status || "inactive",
    });

    res.status(200).json({
      status: "success",
      message: "Amenity added successfully",
      data: newAmenity,
    });
  } catch (error) {
    console.error("❌ Error adding amenity:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to add amenity",
      error: error.message,
    });
  }
};

// 🟡 Update Amenity
exports.updateAmenity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const amenity = await EventAmenity.findByPk(id);
    if (!amenity) {
      return res.status(404).json({
        status: "error",
        message: "Amenity not found",
      });
    }

    let updatedUrl = amenity.image;
    const file = req.files.amenity_image?.[0];

    if (file) {
      const newFileName = file.originalname;
      const oldFileName = amenity.image ? path.basename(amenity.image) : "";

      const remoteFolder = "Events/amenities";

      if (!oldFileName || oldFileName !== newFileName) {
        try {
          if (oldFileName) {
            await deleteFromCpanel(remoteFolder, oldFileName);
          }
          updatedUrl = await uploadToCpanel(
            file.path,
            remoteFolder,
            newFileName
          );
        } catch (error) {
          console.warn("⚠️ File handling warning:", error.message);
        } finally {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }
      } else {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    }

    await amenity.update({
      name: name || amenity.name,
      description: description ?? amenity.description,
      image: updatedUrl,
      status: status,
    });

    res.status(200).json({
      status: "success",
      message: "Amenity updated successfully",
      data: amenity,
    });
  } catch (error) {
    console.error("❌ Error updating amenity:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update amenity",
      error: error.message,
    });
  }
};

// Update Amenity status
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const { status } = req.body;

    const amenity = await EventAmenity.findByPk(id);

    if (!amenity) {
      return res.status(404).json({
        status: "error",
        message: "amenity not found",
      });
    }

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        status: "error",
        mesage: "Status must be active or inactive",
      });
    }

    amenity.status = status;

    await amenity.save();

    res.status(200).json({
      status: "success",
      message: "Status updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to update status",
    });
  }
};

// 🔵 List Amenities by Event ID
exports.listAmenitiesByEventId = async (req, res) => {
  try {
    const { event_id } = req.params;

    if (!event_id) {
      return res.status(400).json({
        status: "error",
        message: "Event ID is required",
      });
    }

    const eventExists = await Event.findByPk(event_id);
    if (!eventExists) {
      return res.status(404).json({
        status: "error",
        message: "Event not found",
      });
    }

    const amenities = await EventAmenity.findAll({
      where: { event_id },
      order: [["id", "ASC"]],
    });

    res.status(200).json({
      status: "success",
      message: "Event amenities fetched successfully",
      data: amenities,
    });
  } catch (error) {
    console.error("❌ Error fetching amenities:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch amenities",
      error: error.message,
    });
  }
};

// 🔴 Delete Amenity
exports.deleteAmenity = async (req, res) => {
  try {
    const { id } = req.params;

    const amenity = await EventAmenity.findByPk(id);
    if (!amenity) {
      return res.status(404).json({
        status: "error",
        message: "Amenity not found",
      });
    }

    const remoteUrl = "Events/amenities";
    const fileName = amenity.image
      ?.split("/")
      .pop()
      .split("?")[0]
      .split("#")[0];

    if (fileName) {
      try {
        await deleteFromCpanel(remoteUrl, fileName);
      } catch (err) {
        console.warn("⚠️ Failed to delete remote file:", err.message);
      }
    }

    await amenity.destroy();

    res.status(200).json({
      status: "success",
      message: "Amenity deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting amenity:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete amenity",
      error: error.message,
    });
  }
};
