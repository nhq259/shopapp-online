const { Op } = require("sequelize");
const db = require("models/index");
const ResponseUser = require("dtos/responses/user/ResponseUser");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const UserRole = require("constants/UserRole");
require("dotenv").config();
const os = require("os");
const getAvatarURL = require("helpers/imageHelper");

// [GET] /api/users/:id
module.exports.getUserById = async (req, res) => {
  const { id } = req.params;

  // Cần middleware auth gắn req.user trước đó
  if (req.user.id != id && req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({
      message:
        "Chỉ người dùng hoặc quản trị mới có quyền truy cập thông tin này",
    });
  }

  const user = await db.User.findByPk(id, {
    attributes: { exclude: ["password"] },
  });
  if (!user) {
    return res.status(404).json({ message: "Không tìm thấy người dùng" });
  }

  const data = new ResponseUser(user);
  if (typeof data.avatar !== "undefined") {
    data.avatar = getAvatarURL.getAvatarURL(data.avatar || "");
  }

  return res.status(200).json({
    message: "Chi tiết người dùng",
    data,
  });
};

// [POST] /api/users/register
module.exports.registerUser = async (req, res) => {
  const { email, phone, password } = req.body;

  // 0) Ít nhất phải có email hoặc phone
  const hasEmail = !!(email && String(email).trim());
  const hasPhone = !!(phone && String(phone).trim());
  if (!hasEmail && !hasPhone) {
    return res.status(400).json({
      message: "Phải cung cấp ít nhất một trong hai: email hoặc số điện thoại",
    });
  }

  // 1) Kiểm tra trùng email nếu có email
  if (hasEmail) {
    const existingEmail = await db.User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }
  }

  // 2) Kiểm tra trùng phone nếu có phone
  if (hasPhone) {
    const existingPhone = await db.User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ message: "Số điện thoại đã tồn tại" });
    }
  }

  // 3) Hash password
  const hashPassword = await argon2.hash(password);

  // 4) Tạo user (giữ request body của bạn, chỉ đảm bảo email/phone null nếu không có)
  const user = await db.User.create({
    ...req.body,
    email: hasEmail ? email : null,
    phone: hasPhone ? phone : null,
    role: UserRole.USER,
    password: hashPassword,
  });

  const data = new ResponseUser(user);
  if (typeof data.avatar !== "undefined") {
    data.avatar = getAvatarURL.getAvatarURL(data.avatar || "");
  }

  return res.status(201).json({
    message: "Đăng ký người dùng thành công",
    data,
  });
};

// [POST] /api/users/login
module.exports.login = async (req, res) => {
  const { email, phone, password } = req.body;

  // 0) Ít nhất phải có email hoặc phone + bắt buộc có password
  const hasEmail = !!(email && String(email).trim());
  const hasPhone = !!(phone && String(phone).trim());
  if ((!hasEmail && !hasPhone) || !password) {
    return res.status(400).json({
      message: "Vui lòng cung cấp email hoặc số điện thoại và mật khẩu.",
    });
  }

  // 1) Chuẩn hoá email (nếu có)
  const normalizedEmail = hasEmail ? String(email).trim().toLowerCase() : null;

  // 2) Tìm user theo email/phone (ưu tiên email nếu gửi cả hai)
  const where = hasEmail
    ? { email: normalizedEmail }
    : { phone: String(phone).trim() };
  const user = await db.User.findOne({ where });

  // 3) Không tìm thấy hoặc sai mật khẩu
  if (!user) {
    return res
      .status(400)
      .json({ message: "Thông tin đăng nhập không chính xác." });
  }

  const match = await argon2.verify(user.password, password);
  if (!match) {
    return res
      .status(400)
      .json({ message: "Thông tin đăng nhập không chính xác." });
  }

  // 4) Tạo JWT
  const payload = {
    id: user.id,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
  // 5) Trả về
  const data = new ResponseUser(user);
  if (typeof data.avatar !== "undefined") {
    data.avatar = getAvatarURL.getAvatarURL(data.avatar || "");
  }

  return res.status(200).json({
    message: "Đăng nhập thành công",
    data,
    token,
  });
};

// [PUT] /api/users/:id
module.exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, avatar, old_password, new_password } = req.body;

  // Chỉ cho phép các field dưới đây
  const allowed = ["name", "avatar", "old_password", "new_password"];
  const extra = Object.keys(req.body || {}).filter((k) => !allowed.includes(k));
  if (extra.length) {
    return res.status(400).json({
      message: "Các trường sau không được phép cập nhật",
      fields: extra,
    });
  }

  const user = await db.User.findByPk(id);
  if (!user)
    return res
      .status(404)
      .json({ message: "Không tìm thấy người dùng để cập nhật" });

  // Không có dữ liệu hợp lệ để cập nhật
  if (
    typeof name === "undefined" &&
    typeof avatar === "undefined" &&
    typeof new_password === "undefined"
  ) {
    return res
      .status(400)
      .json({ message: "Không có dữ liệu hợp lệ để cập nhật" });
  }

  const updateData = {};
  if (typeof name !== "undefined") updateData.name = name;
  if (typeof avatar !== "undefined") updateData.avatar = avatar;

  // Đổi mật khẩu: cần có old_password và đúng thì mới cho đổi
  if (typeof new_password !== "undefined") {
    if (!old_password)
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp mật khẩu cũ để đổi mật khẩu" });

    const ok = await argon2.verify(user.password, String(old_password));
    if (!ok)
      return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });

    updateData.password = await argon2.hash(String(new_password));
    updateData.password_changed_at = new Date();
  }

  await db.User.update(updateData, { where: { id } });

  const updated = await db.User.findByPk(id, { raw: true });
  delete updated.password;
  if (typeof updated.avatar !== "undefined") {
  }

  return res.status(200).json({
    message: "Cập nhật người dùng thành công",
    data: {
      ...updated,
      avatar: getAvatarURL.getAvatarURL(updated.avatar),
    },
  });
};
