const orderStatus = require("constants/OrderStatus");
const db = require("models/index");
const { Op } = require("sequelize");
const getAvatarURL = require('helpers/imageHelper')


// [GET] /api/carts?page=1
module.exports.getCarts = async (req, res) => {
  const { page = 1 } = req.query;
  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  const [carts, totalCarts] = await Promise.all([
    db.Cart.findAll({
      limit: pageSize,
      offset: offset,
      include: [{ model: db.CartItem }],
    }),
    db.Cart.count(),
  ]);

  return res.status(200).json({
    message: "Lấy danh sách giỏ hàng thành công",
    data: carts,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalCarts / pageSize),
    total: totalCarts,
  });
};

// [GET] /api/carts/:id
module.exports.getCartById = async (req, res) => {
  const { id } = req.params;
  const cart = await db.Cart.findByPk(id, {
    include: [{ model: db.CartItem,
      include: [
          {
            model: db.Product,
            attributes: ["id", "name", "price", "image"]
          }
        ]
    }],
  });

  if (!cart) {
    return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
  }

  return res.status(200).json({
    message: "Chi tiết giỏ hàng",
    data: cart,
  });
};

// // [POST] /api/carts
// module.exports.insertCart = async (req, res) => {
//   const { session_id, user_id } = req.body;

//   //  Kiểm tra logic: chỉ được có 1 trong 2 (XOR)
//   if ((!session_id && !user_id) || (session_id && user_id)) {
//     return res.status(400).json({
//       message: "Phải có duy nhất một trong hai: session_id hoặc user_id",
//     });
//   }

//   //  Nếu có session_id → check trùng
//   if (session_id) {
//     const existing = await db.Cart.findOne({ where: { session_id } });
//     if (existing) {
//       return res.status(400).json({
//         message: "Session_id đã tồn tại, không thể tạo giỏ hàng mới",
//       });
//     }
//   }

//   //  Nếu có user_id → check trùng
//   if (user_id) {
//     const existing = await db.Cart.findOne({ where: { user_id } });
//     if (existing) {
//       return res.status(400).json({
//         message: "User_id đã tồn tại, không thể tạo giỏ hàng mới",
//       });
//     }
//   }

//   // Tạo giỏ hàng
//   const cart = await db.Cart.create({
//     session_id: session_id || null,
//     user_id: user_id || null,
//     created_at: new Date(),
//     updated_at: new Date(),
//   });

//   return res.status(201).json({
//     message: "Tạo giỏ hàng thành công",
//     data: cart,
//   });
// };

// [POST] /api/carts  → GET OR CREATE CART
module.exports.insertCart = async (req, res) => {
  const { session_id, user_id } = req.body;

  // ❗ Bắt buộc 1 trong 2: session hoặc user
  if ((!session_id && !user_id) || (session_id && user_id)) {
    return res.status(400).json({
      message: "Phải có duy nhất một trong hai: session_id hoặc user_id",
    });
  }

  try {
    let existing = null;

    // 🔎 1) Check nếu là user login → kiểm tra user_id
    if (user_id) {
      existing = await db.Cart.findOne({ where: { user_id } });

      if (existing) {
        return res.status(200).json({
          message: "Lấy giỏ hàng thành công",
          data: existing,
        });
      }
    }

    // 🔎 2) Nếu là guest → kiểm tra session_id
    if (session_id) {
      existing = await db.Cart.findOne({ where: { session_id } });

      if (existing) {
        return res.status(200).json({
          message: "Lấy giỏ hàng thành công",
          data: existing,
        });
      }
    }

    // ➕ 3) Không có cart → tạo cart mới
    const cart = await db.Cart.create({
      session_id: session_id || null,
      user_id: user_id || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({
      message: "Tạo giỏ hàng thành công",
      data: cart,
    });

  } catch (error) {
    console.error("Insert Cart Error:", error);
    return res.status(500).json({
      message: "Có lỗi xảy ra khi xử lý giỏ hàng",
    });
  }
};


// [POST] /api/carts/checkout
module.exports.checkoutCart = async (req, res) => {
  const { cart_id, total, note,phone,address } = req.body;

  const transaction = await db.sequelize.transaction();

  try {
    // 1. Kiểm tra cart tồn tại
    const cart = await db.Cart.findByPk(cart_id, {
      include: [{ model: db.CartItem ,include: [{ model: db.Product}]}],
      transaction,
    });

    if (!cart) {
      await transaction.rollback();
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }

    if (!cart.CartItems || cart.CartItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    // 2. Tính tổng tiền nếu client không gửi total
    let finalTotal = total;
    if (finalTotal == null) { 
      finalTotal = cart.CartItems.reduce((sum, item) => {
        return sum + item.quantity * item.Product.price;
      }, 0);
    }

    // 3. Tạo Order
    const order = await db.Order.create(
      {
        user_id: cart.user_id || null,
        session_id: cart.session_id || null,
        status: orderStatus.PENDING,
        note,
        phone,
        address,
        total: finalTotal,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction }
    );

    // 4. Tạo OrderDetails từ CartItems
    const orderDetails = cart.CartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.Product.price,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await db.OrderDetail.bulkCreate(orderDetails, { transaction });

     // 5️⃣ Giảm tồn kho sản phẩm
    for (const item of cart.CartItems) {
      const product = item.Product;
      const newQuantity = product.quantity - item.quantity;

      if (newQuantity < 0) {
        // rollback ngay nếu tồn kho không đủ
        await transaction.rollback();
        return res.status(400).json({
          message: `Sản phẩm "${product.name}" không đủ hàng. Hiện còn ${product.quantity}`,
        });
      }

      await db.Product.update(
        { quantity: newQuantity, updated_at: new Date() },
        { where: { id: product.id }, transaction }
      );
    }

    // 5. Xóa cartItems và cart
    await db.CartItem.destroy({ where: { cart_id }, transaction });
    await db.Cart.destroy({ where: { id: cart_id }, transaction });

    // 6. Commit transaction
    await transaction.commit();

    return res.status(201).json({
      message: "Thanh toán giỏ hàng thành công",
      data: {
        order,
        orderDetails,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Checkout error:", error);
    return res.status(500).json({ message: "Có lỗi xảy ra khi checkout", error: error.message });
  }
};


// [DELETE] /api/carts/:id
module.exports.deleteCart = async (req, res) => {
  const { id } = req.params;
  const deleted = await db.Cart.destroy({ where: { id } });

  if (!deleted) {
    return res.status(404).json({ message: "Không tìm thấy giỏ hàng để xóa" });
  }

  return res.status(200).json({ message: "Xóa giỏ hàng thành công" });
};

// [PUT] /api/carts/:id
module.exports.updateCart = async (req, res) => {
  const { id } = req.params;

  await db.Cart.update(req.body, { where: { id } });
  const updatedCart = await db.Cart.findByPk(id);

  if (!updatedCart) {
    return res.status(404).json({ message: "Không tìm thấy giỏ hàng để cập nhật" });
  }

  return res.status(200).json({
    message: "Cập nhật giỏ hàng thành công",
    data: updatedCart,
  });
};
