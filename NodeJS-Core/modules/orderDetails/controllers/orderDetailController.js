const { Op } = require("sequelize");
const db = require("models/index");
const getAvatarURL = require('helpers/imageHelper')

// [GET] /api/order-details
module.exports.getOrderDetails = async (req, res) => {
  const orderDetail = await db.OrderDetail.findAll();

  res.status(200).json({
    message: "Lấy danh sách chi tiết đơn hàng thành công",
    data: orderDetail
  });
};

// [GET] /api/order-details/:id
module.exports.getOrderDetailById = async (req, res) => {
  const { id } = req.params;

  const orderDetail = await db.OrderDetail.findByPk(id, {
    // include: [{ model: db.Product, as: "product" }, { model: db.Order, as: "order" }]
  });

  if (!orderDetail) {
    return res.status(404).json({
      message: "Không tìm thấy chi tiết đơn hàng",
    });
  }

  return res.status(200).json({
    message: "Chi tiết một chi tiết đơn hàng",
    data: orderDetail,
  });
};

// [POST] /api/order-details
module.exports.insertOrderDetail = async (req, res) => {
  const newOrderDetail = await db.OrderDetail.create(req.body);

  return res.status(200).json({
    message: "Thêm mới chi tiết đơn hàng thành công",
    data: newOrderDetail,
  });
};

// [DELETE] /api/order-details/:id
module.exports.deleteOrderDetail = async (req, res) => {
  const { id } = req.params;

  const deleted = await db.OrderDetail.destroy({ where: { id } });

  if (!deleted) {
    return res.status(404).json({
      message: "Không tìm thấy chi tiết đơn hàng để xóa",
    });
  }

  return res.status(200).json({
    message: "Xóa chi tiết đơn hàng thành công",
  });
};

// [PUT] /api/order-details/:id
module.exports.updateOrderDetail = async (req, res) => {
  const { id } = req.params;

  await db.OrderDetail.update(req.body, { where: { id } });
  const updated = await db.OrderDetail.findByPk(id);

  if (!updated) {
    return res.status(404).json({
      message: "Không tìm thấy chi tiết đơn hàng để cập nhật",
    });
  }

  return res.status(200).json({
    message: "Cập nhật chi tiết đơn hàng thành công",
    data: updated,
  });
};
