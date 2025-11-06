const fs = require("fs");
const path = require("path");
const db = require("../models");
const { EventCrewMember, Event } = db;
const {
  uploadToCpanel,
  deleteFromCpanel,
} = require("../services/uploadToCpanel");

exports.addCrewMember = async (req, res) => {
  try {
    const { event_id, name, role, description, social_links, status } =
      req.body;

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

    let imageUrl = null;
    const file = req.files?.image?.[0];
    const remoteFolder = "Events/crew";

    if (file) {
      imageUrl = await uploadToCpanel(
        file.path,
        remoteFolder,
        file.originalname
      );
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

    const newCrew = await EventCrewMember.create({
      event_id,
      name,
      role,
      description,
      image: imageUrl,
      social_links: Array.isArray(social_links)
        ? social_links.join("|||")
        : social_links || null,
      status: status || "inactive",
    });

    res.status(200).json({
      status: "success",
      message: "Crew member added successfully",
      data: newCrew,
    });
  } catch (error) {
    console.error("❌ Error adding crew member:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to add crew member",
      error: error.message,
    });
  }
};

exports.updateCrewMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, description, social_links, status } = req.body;

    const crew = await EventCrewMember.findByPk(id);
    if (!crew) {
      return res.status(404).json({
        status: "error",
        message: "Crew member not found",
      });
    }

    let updatedImage = crew.image;
    const file = req.files?.image?.[0];
    const remoteFolder = "Events/crew";

    if (file) {
      const newFileName = file.originalname;
      const oldFileName = crew.image ? path.basename(crew.image) : "";

      if (!oldFileName || oldFileName !== newFileName) {
        try {
          if (oldFileName) {
            await deleteFromCpanel(remoteFolder, oldFileName);
          }
          updatedImage = await uploadToCpanel(
            file.path,
            remoteFolder,
            newFileName
          );
        } catch (err) {
          console.warn("⚠️ File handling warning:", err.message);
        } finally {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }
      } else {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    }

    await crew.update({
      name: name || crew.name,
      role: role || crew.role,
      description: description ?? crew.description,
      image: updatedImage,
      social_links: Array.isArray(social_links)
        ? social_links.join("|||")
        : social_links || crew.social_links,
      status: status || crew.status,
    });

    res.status(200).json({
      status: "success",
      message: "Crew member updated successfully",
      data: crew,
    });
  } catch (error) {
    console.error("❌ Error updating crew member:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update crew member",
      error: error.message,
    });
  }
};

exports.listCrewMembersByEventId = async (req, res) => {
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

    const crewMembers = await EventCrewMember.findAll({
      where: { event_id },
      order: [["id", "ASC"]],
    });

    res.status(200).json({
      status: "success",
      message: "Crew members fetched successfully",
      data: crewMembers,
    });
  } catch (error) {
    console.error("❌ Error fetching crew members:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch crew members",
      error: error.message,
    });
  }
};

exports.deleteCrewMember = async (req, res) => {
  try {
    const { id } = req.params;

    const crew = await EventCrewMember.findByPk(id);
    if (!crew) {
      return res.status(404).json({
        status: "error",
        message: "Crew member not found",
      });
    }

    const remoteFolder = "Events/crew";
    const fileName = crew.image ? path.basename(crew.image) : "";

    if (fileName) {
      try {
        await deleteFromCpanel(remoteFolder, fileName);
      } catch (err) {
        console.warn("⚠️ Failed to delete remote image:", err.message);
      }
    }

    await crew.destroy();

    res.status(200).json({
      status: "success",
      message: "Crew member deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting crew member:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete crew member",
      error: error.message,
    });
  }
};
