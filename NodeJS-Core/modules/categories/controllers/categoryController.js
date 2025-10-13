const db = require("models/index");
const { Op } = require("sequelize");
const getAvatarURL = require("helpers/imageHelper");

// [GET] /api/categories/
module.exports.getCategories = async (req, res) => {
  const { search = "", page = 1 } = req.query;
  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  let whereClause = {};
  if (search.trim() !== "") {
    whereClause = {
      [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
    };
  }

  const [categories, totalCategories] = await Promise.all([
    db.Category.findAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
      // order: [['createdAt', 'DESC']]
    }),
    db.Category.count({ where: whereClause }),
  ]);

  return res.status(200).json({
    message: "Lấy danh sách danh mục thành công",
    data: categories.map((c) => ({
      ...c.get({ plain: true }),
      image: getAvatarURL.getAvatarURL(c.image || ""),
    })),
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalCategories / pageSize),
    total: totalCategories,
  });
};

// [GET] /api/categories/:id
module.exports.getCategoryById = async (req, res) => {
  const categoryId = req.params.id;
  const category = await db.Category.findByPk(categoryId);

  if (!category) {
    return res.status(400).json({
      message: "Không tìm thấy danh mục",
    });
  }
  return res.status(200).json({
    message: "Chi tiết một danh mục",
    data: {
      ...category.get({ plain: true }),
      image: getAvatarURL.getAvatarURL(category.image || ""),
    },
  });
};

// [POST] /api/categories/
module.exports.insertCategory = async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: "Tên danh mục là bắt buộc",
    });
  }

  // Kiểm tra trùng tên
  const existing = await db.Category.findOne({
    where: { name: name.trim() },
  });

  if (existing) {
    return res.status(400).json({
      message: "Tên danh mục đã tồn tại, không thể thêm mới",
    });
  }

  // Tạo mới
  const category = await db.Category.create({
    ...req.body,
    name: name.trim(),
  });

  return res.status(201).json({
    message: "Thêm mới danh mục thành công",
    data: {
      ...category.get({ plain: true }),
      image: getAvatarURL.getAvatarURL(category.image || ""),
    },
  });
};

// [DELETE] /api/categories/:id
module.exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  const deleted = await db.Category.destroy({ where: { id } });

  if (!deleted) {
    return res.status(404).json({
      message: "Không tìm thấy danh mục để xóa",
    });
  }

  return res.status(200).json({
    message: "Xóa danh mục thành công",
  });
};

// [PUT] /api/categories/:id
module.exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  // Nếu client gửi name thì kiểm tra trùng lặp
  if (name && name.trim()) {
    const existing = await db.Category.findOne({
      where: {
        name: name.trim(),
        id: { [db.Sequelize.Op.ne]: id }, // loại trừ chính category đang update
      },
    });

    if (existing) {
      return res.status(400).json({
        message: "Tên danh mục đã tồn tại, không thể cập nhật",
      });
    }
  }

  // Thực hiện update
  await db.Category.update(req.body, { where: { id } });

  // Lấy lại dữ liệu mới
  const updatedCategory = await db.Category.findByPk(id);

  if (!updatedCategory) {
    return res.status(404).json({
      message: "Không tìm thấy danh mục để cập nhật",
    });
  }

  return res.status(200).json({
    message: "Cập nhật danh mục thành công",
    data: {
      ...updatedCategory.get({ plain: true }),
      image: getAvatarURL.getAvatarURL(updatedCategory.image || ""),
    },
  });
};
