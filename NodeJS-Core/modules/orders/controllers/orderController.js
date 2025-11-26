const { Op } = require("sequelize");
const db = require("models/index");
const OrderStatus = require("constants/OrderStatus")
const getAvatarURL = require('helpers/imageHelper')



// [GET] /api/orders
module.exports.getOrders = async (req, res) => {
    const { search = "", page = 1, status } = req.query;
    const pageSize = 5;
    const offset = (page - 1) * pageSize;

    let whereClause = {};

    // Lọc theo status nếu có
    if (status) {
      whereClause.status = status; // status từ query param
    }

    // Tìm kiếm theo note nếu có
    if (search.trim() !== "") {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { note: { [Op.like]: `%${search}%` } }
        ],
      };
    }

    const [orders, totalOrders] = await Promise.all([
      db.Order.findAll({
        where: whereClause,
        limit: pageSize,
        offset: offset,
        order: [["createdAt", "DESC"]],
      }),
      db.Order.count({ where: whereClause }),
    ]);

    return res.status(200).json({
      message: "Lấy danh sách đơn hàng thành công",
      data: orders,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(totalOrders / pageSize),
      total:totalOrders,
    });
  
};

// [GET] /api/orders/:id
module.exports.getOrderById = async (req, res) => {
  const { id } = req.params;
  const order = await db.Order.findByPk(id,{
    include: [{ model: db.OrderDetail, as:"order_details",include: [
          {
            model: db.Product,
            as: "product"       // nếu OrderDetail liên kết với Product có alias
          }
        ]}],
  });

  if (!order) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }

  return res.status(200).json({
    message: "Chi tiết một đơn hàng",
    data: order,
  });
};

/*
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
*/

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

  // Tìm đơn hàng theo id
  const order = await db.Order.findByPk(id);

  if (!order) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng để xóa" });
  }

  // Cập nhật trạng thái thay vì xóa cứng
  order.status = OrderStatus.FAILED;
  await order.save();

  return res.status(200).json({
    message: "Xóa (soft delete) đơn hàng thành công",
    data: order,
  });
};
