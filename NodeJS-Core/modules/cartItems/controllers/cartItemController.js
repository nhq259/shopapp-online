const db = require("models/index");
const getAvatarURL = require('helpers/imageHelper')


// [GET] /api/cart-items?cart_id=1
module.exports.getCartItems = async (req, res) => {
  const { cart_id } = req.query;

  const whereClause = {};
  if (cart_id) whereClause.cart_id = cart_id;

  const cartItems = await db.CartItem.findAll({
    where: whereClause,
  });

  return res.status(200).json({
    message: "Lấy danh sách sản phẩm trong giỏ hàng thành công",
    data: cartItems,
  });
};

// [GET] /api/cart-items/:id
module.exports.getCartItemById = async (req, res) => {
  const { id } = req.params;
  const cartItem = await db.CartItem.findByPk(id);

  if (!cartItem) {
    return res.status(404).json({ message: "Không tìm thấy mục giỏ hàng" });
  }

  return res.status(200).json({
    message: "Chi tiết mục giỏ hàng",
    data: cartItem,
  });
};

// [GET] /api/cart-items/carts/:cart_id
module.exports.getCartItemsByCartId = async (req, res) => {
  const { cart_id } = req.params;

  // Lấy danh sách cart items theo cart_id
  const cartItems = await db.CartItem.findAll({
    where: { cart_id },
  });

  if (!cartItems || cartItems.length === 0) {
    return res.status(404).json({
      message: "Không tìm thấy sản phẩm nào trong giỏ hàng này",
    });
  }

  return res.status(200).json({
    message: "Danh sách sản phẩm trong giỏ hàng",
    data: cartItems,
  });
};

// [POST] /api/cart-items
module.exports.insertOrUpdateCartItem = async (req, res) => {
  const { cart_id, product_id, quantity } = req.body;

  if (!cart_id || !product_id || quantity === undefined) {
    return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
  }

  // ✅ Kiểm tra cart có tồn tại không
  const cart = await db.Cart.findByPk(cart_id);
  if (!cart) {
    return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
  }
  // ✅ Kiểm tra product có tồn tại không
  const product = await db.Product.findByPk(product_id);
  if (!product) {
    return res.status(404).json({ message: "Sản phẩm không tồn tại" });
  }

  // ✅ Kiểm tra tồn kho
  if (quantity > product.quantity) {
    return res.status(400).json({
      message: `Số lượng sản phẩm vượt quá tồn kho. Hiện chỉ còn ${product.quantity} sản phẩm`,
    });
  }

  // ✅ Kiểm tra cart item đã tồn tại chưa
  const existing = await db.CartItem.findOne({
    where: { cart_id, product_id },
  });

  // Nếu số lượng = 0 → xóa cartItem (nếu tồn tại)
  if (quantity === 0) {
    if (existing) {
      await db.CartItem.destroy({ where: { id: existing.id } });
      return res.status(200).json({
        message: "Đã xóa sản phẩm khỏi giỏ hàng",
      });
    } else {
      return res.status(400).json({
        message: "Không thể xóa vì sản phẩm chưa có trong giỏ",
      });
    }
  }

  // Nếu chưa có thì thêm mới
  if (!existing) {
    const newItem = await db.CartItem.create({
      cart_id,
      product_id,
      quantity,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({
      message: "Thêm sản phẩm vào giỏ hàng thành công",
      data: newItem,
    });
  }

  // Nếu đã có thì update số lượng
  await db.CartItem.update(
    { quantity, updated_at: new Date() },
    { where: { id: existing.id } }
  );

  const updatedItem = await db.CartItem.findByPk(existing.id);

  return res.status(200).json({
    message: "Cập nhật số lượng sản phẩm trong giỏ hàng thành công",
    data: updatedItem,
  });
};


// // [PUT] /api/cart-items/:id
// module.exports.updateCartItem = async (req, res) => {
//   const { id } = req.params;

//   await db.CartItem.update(req.body, { where: { id } });
//   const updated = await db.CartItem.findByPk(id, { include: [db.Product] });

//   if (!updated) {
//     return res
//       .status(404)
//       .json({ message: "Không tìm thấy mục giỏ hàng để cập nhật" });
//   }

//   return res.status(200).json({
//     message: "Cập nhật sản phẩm trong giỏ hàng thành công",
//     data: updated,
//   });
// };

// [DELETE] /api/cart-items/:id
module.exports.deleteCartItem = async (req, res) => {
  const { id } = req.params;
  const deleted = await db.CartItem.destroy({ where: { id } });

  if (!deleted) {
    return res
      .status(404)
      .json({ message: "Không tìm thấy mục giỏ hàng để xóa" });
  }

  return res.status(200).json({ message: "Xóa mục giỏ hàng thành công" });
};
