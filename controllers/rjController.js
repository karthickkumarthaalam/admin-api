const db = require("../models");
const { SystemUsers, Podcast, News, RadioProgram, ProgramCategory, Blogs } = db;

exports.getRjDetails = async (req, res) => {
  const slug = req.params.slug;

  try {
    const name = slug.split("-").join(" ");

    const rjDetails = await SystemUsers.findOne({
      where: { name },
      attributes: ["name", "description", "image_url"],
      include: [
        {
          model: RadioProgram,
          as: "radio_programs",
          include: [
            {
              model: ProgramCategory,
              as: "program_category",
              attributes: ["category", "image_url", "start_time", "end_time"],
            },
          ],
          separate: true,
          limit: 10,
          order: [["updatedAt", "DESC"]],
        },
        {
          model: News,
          as: "news",
          attributes: ["title", "slug", "cover_image", "content"],
          separate: true,
          limit: 10,
          order: [["updatedAt", "DESC"]],
        },
        {
          model: Podcast,
          as: "podcasts",
          attributes: ["id", "title", "description", "image_url"],
          separate: true,
          limit: 10,
          order: [["date", "DESC"]],
        },
        {
          model: Blogs,
          as: "blogs",
          attributes: [
            "id",
            "title",
            "subtitle",
            "content",
            "cover_image",
            "slug",
          ],
          separate: true,
          limit: 10,
          ordeR: [["updatedAt", "DESC"]],
        },
      ],
    });

    if (!rjDetails) {
      return res.status(404).json({
        status: "error",
        message: "Rj Details not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: rjDetails,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch RJ details",
    });
  }
};

exports.getMetaTag = async (req, res) => {
  const slug = req.params.slug;
  try {
    const name = slug.split("-").join(" ");

    const rjDetails = await SystemUsers.findOne({
      where: {
        name,
      },
      attributes: ["name", "description", "image_url"],
    });

    if (!rjDetails) {
      return res.status(404).json({
        status: "error",
        message: "Rj Details not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: rjDetails,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch Rj meta tag",
    });
  }
};
