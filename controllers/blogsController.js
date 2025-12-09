"use strict";

const db = require("../models");
const { Blogs, BlogsCategory, SystemUsers } = db;
const slugify = require("../utils/slugify");
const pagination = require("../utils/pagination");
const {
  uploadToCpanel,
  deleteFromCpanel,
} = require("../services/uploadToCpanel");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");

/* -------------------------------------------------------------------------- */
/*                                Create Blog                                 */
/* -------------------------------------------------------------------------- */
exports.createBlog = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      title,
      subtitle,
      published_by,
      publisher_id,
      content,
      status,
      published_date,
    } = req.body;

    if (!category || !title || !content) {
      return res
        .status(400)
        .json({ status: "error", message: "Required fields are missing" });
    }

    const created_by = req.user?.id || null;
    const slug = slugify(title);
    const coverfile = req.files?.cover_image?.[0];
    let coverUrl = null;

    if (coverfile) {
      const remoteFolder = "blogs/cover-images";
      coverUrl = await uploadToCpanel(
        coverfile.path,
        remoteFolder,
        coverfile.originalname
      );

      if (fs.existsSync(coverfile.path)) {
        fs.unlinkSync(coverfile.path);
      }
    }

    const blog = await Blogs.create(
      {
        category,
        subcategory,
        title,
        subtitle,
        slug,
        content,
        published_by,
        publisher_id,
        published_date,
        status: status || "draft",
        cover_image: coverUrl,
        created_by,
      },
      { returning: true }
    );

    res
      .status(201)
      .json({ status: "success", message: "Blog created successfully", blog });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

/* -------------------------------------------------------------------------- */
/*                                List Blogs (Pagination + Search)            */
/* -------------------------------------------------------------------------- */
exports.getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const whereCondition = {};

    if (req.query.status) {
      whereCondition.status = req.query.status;
    }

    if (req.query.date) {
      whereCondition.published_date = req.query.date;
    }

    if (req.query.category) {
      whereCondition.category = req.query.category;
    }

    if (req.query.published_by) {
      whereCondition.published_by = req.query.published_by;
    }

    if (req.user && req.user.role !== "admin") {
      whereCondition.created_by = req.user.id;
    }

    if (req.query.search) {
      const search = req.query.search.trim();
      whereCondition[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { subtitle: { [Op.like]: `%${search}%` } },
      ];
    }

    const result = await pagination(Blogs, {
      page,
      limit,
      include: [
        {
          model: SystemUsers,
          as: "publisher",
          attributes: ["id", "name"],
        },
        {
          model: SystemUsers,
          as: "creator",
          attributes: ["id", "name"],
        },
      ],
      where: whereCondition,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      status: "success",
      message: "Blogs fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to list blogs",
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                                Update Blog                                 */
/* -------------------------------------------------------------------------- */
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category,
      subcategory,
      title,
      subtitle,
      content,
      published_by,
      publisher_id,
      status,
      published_date,
    } = req.body;

    const blog = await Blogs.findByPk(id);

    if (!blog) {
      return res
        .status(404)
        .json({ status: "error", message: "Blog not found" });
    }

    const coverfile = req.files?.cover_image?.[0];
    let coverUrl = blog.cover_image;

    if (coverfile) {
      const remoteFolder = "blogs/cover-images";
      const newFileName = coverfile.originalname;
      const oldFileName = path.basename(blog.cover_image || "");

      if (newFileName !== oldFileName && blog.cover_image) {
        try {
          await deleteFromCpanel(remoteFolder, oldFileName);
        } catch (err) {
          console.warn("⚠️ Failed to delete old cover:", err.message);
        }
      }

      coverUrl = await uploadToCpanel(
        coverfile.path,
        remoteFolder,
        newFileName
      );

      if (fs.existsSync(coverfile.path)) fs.unlinkSync(coverfile.path);
    }

    let slug = blog.slug;
    if (title && title !== blog.title) {
      slug = slugify(title);
    }

    await blog.update({
      category,
      subcategory,
      title,
      subtitle,
      slug,
      content,
      published_by,
      publisher_id,
      published_date,
      cover_image: coverUrl,
    });

    res.status(200).json({
      status: "success",
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to update blog",
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                              Update Blog Status                            */
/* -------------------------------------------------------------------------- */
exports.updateBlogStatus = async (req, res) => {
  try {
    const blog = await Blogs.findByPk(req.params.id);

    if (!blog) {
      return res
        .status(404)
        .json({ status: "error", message: "Blog not found" });
    }

    const { status } = req.body;
    const allowed = ["draft", "published", "archived"];

    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid status" });
    }

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ status: "error", message: "Only admin can update status" });
    }

    const statusUpdater = await SystemUsers.findOne({
      where: { user_id: req.user.id },
      attributes: ["name"],
    });

    blog.status = status;
    blog.status_updated_by = (statusUpdater && statusUpdater?.name) || "Admin";
    blog.status_updated_at = new Date();

    await blog.save();

    res.status(200).json({
      status: "success",
      message: "Blog status updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to update blog status",
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                                Get Blog by ID                              */
/* -------------------------------------------------------------------------- */
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blogs.findByPk(req.params.id, {
      include: [
        { model: SystemUsers, as: "creator", attributes: ["id", "name"] },
      ],
    });

    if (!blog) {
      return res
        .status(404)
        .json({ status: "error", message: "Blog not found" });
    }

    res.status(200).json({
      status: "success",
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to get Blog",
      error: error.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                                Get Blog by Slug                            */
/* -------------------------------------------------------------------------- */
exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blogs.findOne({
      where: { slug: req.params.slug },
      include: [
        { model: SystemUsers, as: "creator", attributes: ["id", "name"] },
      ],
    });

    if (!blog) {
      return res
        .status(404)
        .json({ status: "error", message: "Blog not found" });
    }

    res.status(200).json({
      status: "success",
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

/* -------------------------------------------------------------------------- */
/*                                Get Related Blogs                           */
/* -------------------------------------------------------------------------- */
exports.getRelatedBlogs = async (req, res) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit, 10) || 4;

    const blogs = await Blogs.findAll({
      where: { category, status: "published" },
      limit,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ status: "success", data: blogs });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

/* -------------------------------------------------------------------------- */
/*                                Delete Blog                                 */
/* -------------------------------------------------------------------------- */
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blogs.findByPk(id);

    if (!blog) {
      return res
        .status(404)
        .json({ status: "error", message: "Blog not found" });
    }

    if (blog.cover_image) {
      const remoteFolder = "blogs/cover-images";
      const fileName = path.basename(blog.cover_image);

      try {
        await deleteFromCpanel(remoteFolder, fileName);
      } catch (err) {
        console.warn("⚠️ Failed to delete cover image:", err.message);
      }
    }

    await blog.destroy();

    res.status(200).json({
      status: "success",
      message: "Blog deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to delete blog",
      error: error.message,
    });
  }
};
