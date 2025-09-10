const db = require("models/index");
const { Op } = require("sequelize");
const { error } = require("utils/responseUtils");

const path = require('path');
const fs = require('fs')

// [GET] /api/banners
module.exports.getBanners = async (req, res) => {
  const { search = "", page = 1 } = req.query;
  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  let whereClause = {};
  if (search.trim() !== "") {
    whereClause = {
      [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
    };
  }

  const [banners, totalBanners] = await Promise.all([
    db.Banner.findAll({
      where: whereClause,
      limit: pageSize,
      offset,
      // order: [["createdAt", "DESC"]],
    }),
    db.Banner.count({ where: whereClause }),
  ]);

  return res.status(200).json({
    message: "Lấy danh sách banner thành công",
    data: banners,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalBanners / pageSize),
    totalBanners,
  });
};

// [GET] /api/banners/:id
module.exports.getBannerById = async (req, res) => {
  const { id } = req.params;
  const item = await db.Banner.findByPk(id);

  if (!item) {
    return res.status(404).json({ message: "Không tìm thấy banner" });
  }

  return res.status(200).json({
    message: "Chi tiết banner",
    data: item,
  });
};

// [POST] /api/banners
module.exports.insertBanner = async (req, res) => {
  const { name } = req.body;

  // 1. Kiểm tra banner trùng tên
  const existing = await db.Banner.findOne({ where: { name: name.trim() } });
  if (existing) {
    return res.status(400).json({
      message: "Tên banner đã tồn tại, không thể thêm mới",
    });
  }


  // 2. Tạo mới banner
  const banner = await db.Banner.create(req.body);

  return res.status(201).json({
    message: "Thêm mới banner thành công",
    data: banner,
  });
};

// [PUT] /api/banners/:id
module.exports.updateBanner = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  // Nếu có gửi name -> kiểm tra trùng tên
  if (name && name.trim() !== "") {
    const existing = await db.Banner.findOne({
      where: {
        name: name.trim(),
        id: { [Op.ne]: id }, // loại trừ chính banner đang update
      },
    });

    if (existing) {
      return res.status(400).json({
        message: "Tên banner đã tồn tại, không thể cập nhật",
      });
    }
  }

  await db.Banner.update(req.body, { where: { id } });
  const updated = await db.Banner.findByPk(id);

  if (!updated) {
    return res.status(404).json({
      message: "Không tìm thấy banner để cập nhật",
    });
  }

  return res.status(200).json({
    message: "Cập nhật banner thành công",
    data: updated,
  });
};

// [DELETE] /api/banners/:id
module.exports.deleteBanner = async (req, res) => {
  const { id } = req.params;

  const deleted = await db.Banner.destroy({ where: { id } });

  if (!deleted) {
    return res.status(404).json({
      message: "Không tìm thấy banner để xóa",
    });
  }

  return res.status(200).json({
    message: "Xóa banner thành công",
  });
};
