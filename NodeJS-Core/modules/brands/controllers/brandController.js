const db = require("models/index")
const { Op } = require("sequelize");

//[GET] /api/brands
module.exports.getBrands = async (req, res) => {
  const { search = "", page = 1 } = req.query;
  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  let whereClause = {};
  if (search.trim() !== "") {
    whereClause = {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
      ],
    };
  }

  const [brands, totalBrands] = await Promise.all([
    db.Brand.findAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
      // order: [['createdAt', 'DESC']]
    }),
    db.Brand.count({ where: whereClause }),
  ]);

  return res.status(200).json({
    message: "Lấy danh sách thương hiệu thành công",
    data: brands,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalBrands / pageSize),
    totalBrands,
  });
};

//[GET] /api/brands/:id
module.exports.getBrandById = async (req, res) => {
    const brandId = req.params.id;
    const brand = await db.Brand.findByPk(brandId);
  
    if (!brand) {
      return res.status(400).json({
        message: "Không tìm thấy thương hiệu",
      });
    }

  res.status(200).json({
    message: "Chi tiết một thương hiệu",
    data: brand
  });
};
// [POST] /api/brands
module.exports.insertBrand = async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: "Tên thương hiệu là bắt buộc",
    });
  }

  // Kiểm tra trùng tên
  const existing = await db.Brand.findOne({
    where: { name: name.trim() },
  });

  if (existing) {
    return res.status(400).json({
      message: "Tên thương hiệu đã tồn tại, không thể thêm mới",
    });
  }

  // Tạo mới
  const brand = await db.Brand.create({
    ...req.body,
    name: name.trim(),
  });

  return res.status(201).json({
    message: "Thêm mới thương hiệu thành công",
    data: brand,
  });
};


// [DELETE] /api/brands/:id
module.exports.deleteBrand = async (req, res) => {
  const { id } = req.params;

  const deleted = await db.Brand.destroy({ where: { id } });

  if (!deleted) {
    return res.status(404).json({
      message: "Không tìm thấy thương hiệu để xóa",
    });
  }

  return res.status(200).json({
    message: "Xóa thương hiệu thành công",
  });
};

// [PUT] /api/brands/:id
module.exports.updateBrand = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  // Nếu client gửi name thì kiểm tra trùng lặp
  if (name && name.trim()) {
    const existing = await db.Brand.findOne({
      where: {
        name: name.trim(),
        id: { [db.Sequelize.Op.ne]: id }, // loại trừ chính brand đang update
      },
    });

    if (existing) {
      return res.status(400).json({
        message: "Tên thương hiệu đã tồn tại, không thể cập nhật",
      });
    }
  }

  // Thực hiện update
  await db.Brand.update(req.body, { where: { id } });

  // Lấy lại dữ liệu mới
  const updatedBrand = await db.Brand.findByPk(id);

  if (!updatedBrand) {
    return res.status(404).json({
      message: "Không tìm thấy thương hiệu để cập nhật",
    });
  }

  return res.status(200).json({
    message: "Cập nhật thương hiệu thành công",
    data: updatedBrand,
  });
};

