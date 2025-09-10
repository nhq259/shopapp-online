const { Op } = require("sequelize");
const db = require("models/index");
const ResponseUser = require("dtos/responses/user/ResponseUser");
const argon2 = require("argon2");

// [POST] /api/users
module.exports.insertUser = async (req, res) => {
  // 1. Kiểm tra email đã tồn tại chưa
  const { email } = req.body;
  const existingUser = await db.User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({
      message: "Email đã tồn tại",
    });
  }

  const hashPassword = await argon2.hash(req.body.password);

  const user = await db.User.create({ ...req.body, password: hashPassword });
  return res.status(200).json({
    message: "Thêm mới người dùng thành công",
    data: new ResponseUser(user), // ResponseUser trả về dữ liệu không bao gồm password
  });
};

// [PUT] /api/users/:id
module.exports.updateUser = async (req, res) => {
  const { id } = req.params;
  await db.User.update(req.body, { where: { id } });
  const updatedUser = await db.User.findByPk(id);

  if (!updatedUser) {
    return res.status(404).json({
      message: "Không tìm thấy người dùng để cập nhật",
    });
  }

  return res.status(200).json({
    message: "Cập nhật người dùng thành công",
    data: updatedUser,
  });
};
