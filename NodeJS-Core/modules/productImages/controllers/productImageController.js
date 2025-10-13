const db = require("models/index");
const { Op, Sequelize, Model } = require("sequelize");
const getAvatarURL = require("helpers/imageHelper");

// [GET] /api/product-images?product_id=1&page=1
module.exports.getProductImages = async (req, res) => {
  const { product_id, page = 1 } = req.query;
  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  // Nếu có product_id thì lọc theo product_id, ngược lại lấy tất cả
  let whereClause = {};
  if (product_id) {
    whereClause.product_id = product_id;
  }

  const [productImages, totalProductImages] = await Promise.all([
    db.ProductImage.findAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
      // include: [{model: db.Product, as : 'product'}],
      order: [["createdAt", "DESC"]],
    }),
    db.ProductImage.count({ where: whereClause }),
  ]);

  return res.status(200).json({
    message: "Lấy danh sách ảnh sản phẩm thành công",
    data: productImages.map((img) => ({
      ...img.get({ plain: true }),
      image_url: getAvatarURL.getAvatarURL(img.image_url || ""),
    })),
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalProductImages / pageSize),
    total:totalProductImages,
  });
};

// [GET] /api/product-images/:id
module.exports.getProductImageById = async (req, res) => {
  const id = req.params.id;
  const image = await db.ProductImage.findByPk(id);

  if (!image) {
    return res.status(404).json({
      message: "Không tìm thấy ảnh sản phẩm",
    });
  }

  return res.status(200).json({
    message: "Chi tiết ảnh sản phẩm",
    data: {
      ...image.get({ plain: true }),
      image_url: getAvatarURL.getAvatarURL(image.image_url || ""),
    },
  });
};

// [POST] /api/product-images
module.exports.insertProductImage = async (req, res) => {
  const { product_id, image_url } = req.body;

  if (!product_id || !image_url || !image_url.trim()) {
    return res.status(400).json({
      message: "product_id và image_url là bắt buộc",
    });
  }

  // kiểm tra product có tồn tại không
  const product = await db.Product.findByPk(product_id);
  if (!product) {
    return res.status(404).json({
      message: "Không tìm thấy sản phẩm với product_id này",
    });
  }
  // kiểm tra cặp product_id + image_url có bị trùng không
  const existing = await db.ProductImage.findOne({
    where: { product_id, image_url: image_url.trim() },
  });

  if (existing) {
    return res.status(400).json({
      message: "Ảnh này đã tồn tại cho sản phẩm này",
    });
  }

  const image = await db.ProductImage.create({
    product_id,
    image_url: image_url.trim(),
  });

  return res.status(201).json({
    message: "Thêm ảnh sản phẩm thành công",
    data: {
      ...image.get({ plain: true }),
      image_url: getAvatarURL.getAvatarURL(image.image_url || ""),
    },
  });
};

// [DELETE] /api/product-images/:id
module.exports.deleteProductImage = async (req, res) => {
  const { id } = req.params;

  const deleted = await db.ProductImage.destroy({ where: { id } });

  if (!deleted) {
    return res.status(404).json({
      message: "Không tìm thấy ảnh sản phẩm để xóa",
    });
  }

  return res.status(200).json({
    message: "Xóa ảnh sản phẩm thành công",
  });
};
