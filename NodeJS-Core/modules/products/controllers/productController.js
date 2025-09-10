const { Op } = require("sequelize");

const db = require("models/index");

//[GET] /api/products
module.exports.getProducts = async (req, res) => {
  // const products = await db.Product.findAll();
  //search and paging
  const { search = "", page = 1 } = req.query; // Default to an empty string if not provided
  const pageSize = 5; // Define the number of items per page
  const offset = (page - 1) * pageSize;

  const andConds = [{ status: "active" }];

  if (search.trim() !== "") {
    andConds.push({
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { specification: { [Op.like]: `%${search}%` } },
      ],
    });
  }

  const whereClause = { [Op.and]: andConds };

  const [products, totalProducts] = await Promise.all([
    db.Product.findAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
    }),
    db.Product.count({
      where: whereClause,
    }),
  ]);

  return res.status(200).json({
    message: "Lấy danh sách sản phẩm thành công",
    data: products,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalProducts / pageSize),
    totalProducts,
  });
};

//[GET] /api/products/:id
module.exports.getProductById = async (req, res) => {
  const productId = req.params.id;
  const product = await db.Product.findOne({
    where: { id: productId, status: "active" },
  });

  if (!product) {
    return res.status(400).json({
      message: "Không tìm thấy sản phẩm",
    });
  }

  res.status(200).json({
    message: "Chi tiết một sản phẩm",
    data: product,
  });
};

// [POST] /api/products
module.exports.insertProduct = async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: "Tên sản phẩm là bắt buộc",
    });
  }

  // Kiểm tra trùng tên
  const existing = await db.Product.findOne({
    where: { name: name.trim() },
  });

  if (existing) {
    return res.status(400).json({
      message: "Tên sản phẩm đã tồn tại, không thể thêm mới",
    });
  }

  // Tạo mới
  const product = await db.Product.create({
    ...req.body,
    name: name.trim(),
  });

  return res.status(201).json({
    message: "Thêm mới sản phẩm thành công",
    data: product,
  });
};


// [DELETE] /api/products/:id (xóa mềm)
module.exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  const [affected] = await db.Product.update(
    { status: "inactive" },
    { where: { id, status: "active" } }
  );

  if (!affected) {
    return res.status(404).json({
      message: "Không tìm thấy sản phẩm để xóa",
    });
  }

  return res.status(200).json({
    message: "Xóa sản phẩm (mềm) thành công",
  });
};

// [PUT] /api/products/:id
module.exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  // Nếu client gửi name thì kiểm tra trùng lặp
  if (name && name.trim()) {
    const existing = await db.Product.findOne({
      where: {
        name: name.trim(),
        id: { [db.Sequelize.Op.ne]: id }, // loại trừ chính product đang update
      },
    });

    if (existing) {
      return res.status(400).json({
        message: "Tên sản phẩm đã tồn tại, không thể cập nhật",
      });
    }
  }

  // Thực hiện update
  await db.Product.update(req.body, { where: { id } });

  // Lấy lại dữ liệu mới
  const updatedProduct = await db.Product.findByPk(id);

  if (!updatedProduct) {
    return res.status(404).json({
      message: "Không tìm thấy sản phẩm để cập nhật",
    });
  }

  return res.status(200).json({
    message: "Cập nhật sản phẩm thành công",
    data: updatedProduct,
  });
};

