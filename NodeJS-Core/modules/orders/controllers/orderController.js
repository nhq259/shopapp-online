const { Op } = require("sequelize");
const db = require("models/index");

// [GET] /api/orders
module.exports.getOrders = async (req, res) => {
  const { search = "", page = 1 } = req.query;
  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  let whereClause = {};
  if (search.trim() !== "") {
    whereClause = {
      [Op.or]: [{ status: { [Op.like]: `%${search}%` } }],
    };
  }

  const [orders, totalOrders] = await Promise.all([
    db.Order.findAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
    }),
    db.Order.count({ where: whereClause }),
  ]);

  return res.status(200).json({
    message: "Lấy danh sách đơn hàng thành công",
    data: orders,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalOrders / pageSize),
    totalOrders,
  });
};

// [GET] /api/orders/:id
module.exports.getOrderById = async (req, res) => {
  const { id } = req.params;
  const order = await db.Order.findByPk(id);

  if (!order) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }

  return res.status(200).json({
    message: "Chi tiết một đơn hàng",
    data: order,
  });
};

// [POST] /api/orders
module.exports.insertOrder = async (req, res) => {
  const userId = req.body.user_id;
  const userExists = await db.User.findByPk(userId);
  if (!userExists) {
    return res.status(404).json({ message: "Người dùng không tồn tại" });
  }
  const newOrder = await db.Order.create(req.body);
  if (newOrder) {
    return res.status(200).json({
      message: "Thêm mới đơn hàng thành công",
      data: newOrder,
    });
  }else{
    return res.status(404).json({ message: "Không thể thêm mới đơn hàng" });
  }
};

// [PUT] /api/orders/:id
module.exports.updateOrder = async (req, res) => {
  const { id } = req.params;

  await db.Order.update(req.body, { where: { id } });
  const updatedOrder = await db.Order.findByPk(id);

  if (!updatedOrder) {
    return res
      .status(404)
      .json({ message: "Không tìm thấy đơn hàng để cập nhật" });
  }

  return res.status(200).json({
    message: "Cập nhật đơn hàng thành công",
    data: updatedOrder,
  });
};

// [DELETE] /api/orders/:id
module.exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  const deleted = await db.Order.destroy({ where: { id } });

  if (!deleted) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng để xóa" });
  }

  return res.status(200).json({
    message: "Xóa đơn hàng thành công",
  });
};
