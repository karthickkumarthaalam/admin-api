const db = require("../models");
const { Event, SystemUsers, EventBanner, EventCrewMember, EventAmenity } = db;
const pagination = require("../utils/pagination");
const slugify = require("../utils/slugify");
const fs = require("fs");
const path = require("path");
const {
  uploadToCpanel,
  deleteFromCpanel,
} = require("../services/uploadToCpanel");
const { Op, where } = require("sequelize");

exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      venue,
      start_date,
      end_date,
      start_time,
      end_time,
      country,
      state,
      city,
      status,
    } = req.body;

    const user = req.user;
    if (!title || !venue || !start_date) {
      return res.status(400).json({
        status: "error",
        message: "Title, description, venue and start_date are required.",
      });
    }

    let logoUrl = null;
    const file = req.files?.logo?.[0]; // expecting field: logo

    if (file) {
      const remoteFolder = "Events/logo";
      logoUrl = await uploadToCpanel(
        file.path,
        remoteFolder,
        file.originalname
      );
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

    const slug = slugify(title);

    const createdEvent = await Event.create({
      title,
      slug,
      description,
      venue,
      start_date,
      end_date,
      start_time,
      end_time,
      country,
      state,
      city,
      status,
      logo_image: logoUrl,
      created_by: user?.id || null,
    });

    res.status(201).json({
      status: "success",
      message: "Event created successfully.",
      data: createdEvent,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to create event.",
      error: error.message,
    });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { role, id } = req.user || {};

    const where = {};

    if (req.query.search) {
      const search = req.query.search.trim();
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { venue: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } },
        { state: { [Op.like]: `%${search}%` } },
        { country: { [Op.like]: `%${search}%` } },
      ];
    }

    if (role !== "admin") {
      where.created_by = id;
    }

    if (req.query.status && req.query.status !== "all") {
      where.status = req.query.status;
    }

    const result = await pagination(Event, {
      page,
      limit,
      where,
      order: [["start_date", "DESC"]],
      include: [
        {
          model: SystemUsers,
          as: "creator",
          attributes: ["name"],
        },
      ],
    });

    return res.status(200).json({
      status: "success",
      message: "Events fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch events.",
      error: error.message,
    });
  }
};

exports.getAllEventForUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const whereConditions = {};

    if (req.query.search) {
      const search = req.query.search;
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { venue: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } },
        { state: { [Op.like]: `%${search}%` } },
        { country: { [Op.like]: `%${search}%` } },
      ];
    }

    if (req.query.status && req.query.status !== "all") {
      whereConditions.status = req.query.status;
    }

    const result = await pagination(Event, {
      page,
      limit,
      where: whereConditions,
      order: [["start_date", "DESC"]],
    });

    return res.status(200).json({
      status: "success",
      message: "Events fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      error: error.message,
      message: "Failed to fetch events",
    });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id, {
      include: [
        { model: SystemUsers, as: "creator", attributes: ["name"] },
        { model: EventBanner, as: "banners" },
        { model: EventAmenity, as: "amenities" },
        { model: EventCrewMember, as: "crew_members" },
      ],
    });

    if (!event)
      return res.status(404).json({
        status: "error",
        message: "Event not found.",
      });

    res.status(200).json({
      status: "success",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch event.",
      error: error.message,
    });
  }
};

exports.getEventBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const event = await Event.findOne({
      where: {
        slug,
      },
      include: [
        {
          model: EventBanner,
          as: "banners",
          required: false,
          where: {
            status: "active",
          },
        },
        {
          model: EventAmenity,
          as: "amenities",
          required: false,
          where: {
            status: "active",
          },
        },
        {
          model: EventCrewMember,
          as: "crew_members",
          required: false,
          where: {
            status: "active",
          },
        },
      ],
    });

    if (!event) {
      console.log("flag marking here for the banner not available");
      return res.status(404).json({
        status: "error",
        message: "Event not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch event.",
      error: error.message,
    });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      venue,
      start_date,
      end_date,
      start_time,
      end_time,
      country,
      state,
      city,
      status,
    } = req.body;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        status: "error",
        message: "Event not found.",
      });
    }

    let updatedLogo = event.logo_image;
    const file = req.files?.logo?.[0];
    const remoteFolder = "Events/logo";

    if (file) {
      const newFileName = file.originalname;
      const oldFileName = path.basename(event.logo_image || "");

      // ✅ Only delete and upload if the file name has changed
      if (!oldFileName || oldFileName !== newFileName) {
        try {
          // Delete old logo only if it exists
          if (oldFileName) {
            await deleteFromCpanel(remoteFolder, oldFileName);
          }

          // Upload new file
          updatedLogo = await uploadToCpanel(
            file.path,
            remoteFolder,
            newFileName
          );
        } catch (err) {
          console.warn("⚠️ File handling warning:", err.message);
        } finally {
          // Clean up temp file
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }
      } else {
        // ✅ File name is same → skip upload, cleanup local temp file if any
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    }

    const slug = title ? slugify(title) : event.slug;

    await event.update({
      title,
      slug,
      description,
      venue,
      start_date,
      end_date,
      start_time,
      end_time,
      country,
      state,
      city,
      status,
      logo_image: updatedLogo,
    });

    res.status(200).json({
      status: "success",
      message: "Event updated successfully.",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to update event.",
      error: error.message,
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);
    if (!event)
      return res.status(404).json({
        status: "error",
        message: "Event not found.",
      });

    // Delete logo from server
    if (event.logo_image) {
      const remoteFolder = "Events/logo";
      const fileName = path.basename(event.logo_image);
      try {
        await deleteFromCpanel(remoteFolder, fileName);
      } catch (err) {
        console.warn("⚠️ Failed to delete event logo:", err.message);
      }
    }

    await event.destroy();

    res.status(200).json({
      status: "success",
      message: "Event deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete event.",
      error: error.message,
    });
  }
};
