const db = require("models/index");
const { Op } = require("sequelize");
const getAvatarURL = require('helpers/imageHelper')


// [GET] /api/banner-details
module.exports.getBannerDetails = async (req, res) => {
  const { page = 1 } = req.query;
  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  const [bannerDetails, totalBannerDetails] = await Promise.all([
    db.BannerDetail.findAll({
      include: [
        { model: db.Product, },
        { model: db.Banner, },
      ],
      limit: pageSize,
      offset,
    }),
    db.BannerDetail.count(),
  ]);

  return res.status(200).json({
    message: "Lấy danh sách BannerDetail thành công",
    data: bannerDetails,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalBannerDetails / pageSize),
    total: totalBannerDetails,
  });
};

// [GET] /api/banner-details/:id
module.exports.getBannerDetailById = async (req, res) => {
  const { id } = req.params;

  const item = await db.BannerDetail.findByPk(id, {
    include: [
      { model: db.Product},
      { model: db.Banner},
    ],
  });

  if (!item) {
    return res.status(404).json({
      message: "Không tìm thấy BannerDetail",
    });
  }

  return res.status(200).json({
    message: "Chi tiết một BannerDetail",
    data: item,
  });
};

// [POST] /api/banner-details
module.exports.insertBannerDetail = async (req, res) => {
  const { product_id, banner_id } = req.body;

  // Check product tồn tại
  const product = await db.Product.findByPk(product_id);
  if (!product) {
    return res.status(404).json({ message: "Không tìm thấy product_id" });
  }

  // Check banner tồn tại
  const banner = await db.Banner.findByPk(banner_id);
  if (!banner) {
    return res.status(404).json({ message: "Không tìm thấy banner_id" });
  }

  // Check trùng
  const exists = await db.BannerDetail.findOne({
    where: { product_id, banner_id },
  });
  if (exists) {
    return res.status(400).json({
      message: "BannerDetail với product_id và banner_id đã tồn tại",
    });
  }

  const item = await db.BannerDetail.create({ product_id, banner_id });
  return res.status(201).json({
    message: "Thêm mới BannerDetail thành công",
    data: item,
  });
};

// [PUT] /api/banner-details/:id
module.exports.updateBannerDetail = async (req, res) => {
  const { id } = req.params;
  const { product_id, banner_id } = req.body;

  const current = await db.BannerDetail.findByPk(id);
  if (!current) {
    return res.status(404).json({ message: "Không tìm thấy BannerDetail để cập nhật" });
  }

  // Nếu có gửi product_id thì kiểm tra tồn tại
  if (product_id !== undefined) {
    const product = await db.Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy product_id" });
    }
  }

  // Nếu có gửi banner_id thì kiểm tra tồn tại
  if (banner_id !== undefined) {
    const banner = await db.Banner.findByPk(banner_id);
    if (!banner) {
      return res.status(404).json({ message: "Không tìm thấy banner_id" });
    }
  }

  const finalProductId = product_id ?? current.product_id;
  const finalBannerId = banner_id ?? current.banner_id;

  // Check trùng cặp product_id + banner_id
  const dup = await db.BannerDetail.findOne({
    where: {
      product_id: finalProductId,
      banner_id: finalBannerId,
      id: { [Op.ne]: id },
    },
  });
  if (dup) {
    return res.status(400).json({
      message: "BannerDetail với cặp product_id và banner_id đã tồn tại",
    });
  }

  await db.BannerDetail.update(
    { product_id: finalProductId, banner_id: finalBannerId },
    { where: { id } }
  );

  const updated = await db.BannerDetail.findByPk(id, {
    include: [
      { model: db.Product },
      { model: db.Banner},
    ],
  });

  return res.status(200).json({
    message: "Cập nhật BannerDetail thành công",
    data: updated,
  });
};

// [DELETE] /api/banner-details/:id
module.exports.deleteBannerDetail = async (req, res) => {
  const { id } = req.params;

  const deleted = await db.BannerDetail.destroy({ where: { id } });
  if (!deleted) {
    return res.status(404).json({
      message: "Không tìm thấy BannerDetail để xóa",
    });
  }

  return res.status(200).json({
    message: "Xóa BannerDetail thành công",
  });
};
