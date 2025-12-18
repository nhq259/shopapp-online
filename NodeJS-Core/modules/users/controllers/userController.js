const { Op } = require("sequelize");
const db = require("models/index");
const ResponseUser = require("dtos/responses/user/ResponseUser");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const UserRole = require("constants/UserRole");
require("dotenv").config();
const os = require("os");
const getAvatarURL = require("helpers/imageHelper");


// [GET] /api/admin/users
module.exports.getAllUsers = async (req, res) => {
  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({
      message: "Chỉ quản trị viên mới có quyền truy cập",
    });
  }

  const { search = "", page = 1, limit = 5 } = req.query;
  const offset = (page - 1) * limit;

  const where = {
    deleted: false,
    role: UserRole.USER,  
    ...(search && {
      [Op.or]: [
        { email: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ],
    }),
  };

  const { rows, count } = await db.User.findAndCountAll({
    where,
    attributes: { exclude: ["password"] },
    limit: Number(limit),
    offset,
    order: [["createdAt", "DESC"]],
  });

  const data = rows.map((u) => {
    const item = new ResponseUser(u);
    if (item.avatar) {
      item.avatar = getAvatarURL.getAvatarURL(item.avatar);
    }
    return item;
  });

  return res.status(200).json({
    message: "Danh sách người dùng",
    meta: {
      page: Number(page),
      limit: Number(limit),
      total: count,
    },
    data,
  });
};

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
      code:400,
      message: "Phải cung cấp ít nhất một trong hai: email hoặc số điện thoại",
    });
  }

  // 1) Kiểm tra trùng email nếu có email
  if (hasEmail) {
    const existingEmail = await db.User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({code:400, message: "Email đã tồn tại" });
    }
  }

  // 2) Kiểm tra trùng phone nếu có phone
  if (hasPhone) {
    const existingPhone = await db.User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ code:400,message: "Số điện thoại đã tồn tại" });
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
    status: "active",
    deleted: false,
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
      code:400,message: "Vui lòng cung cấp email hoặc số điện thoại và mật khẩu.",
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
  return res.status(400).json({
    code: 400,
    message: "Thông tin đăng nhập không chính xác."
  });
}

 /* 🔒 CHẶN TÀI KHOẢN */
  if (user.deleted === true) {
    return res.status(403).json({
      code: 403,
      message: "Tài khoản đã bị khóa vĩnh viễn",
    });
  }

  if (user.status !== "active") {
    return res.status(403).json({
      code: 403,
      message: "Tài khoản đang bị ngừng hoạt động",
    });
  }


  const match = await argon2.verify(user.password, password);
 if (!match) {
  return res.status(400).json({
    code: 400,
    message: "Thông tin đăng nhập không chính xác."
  });
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
      code:400,
      message: "Các trường sau không được phép cập nhật",
      fields: extra,
    });
  }

  const user = await db.User.findByPk(id);
  if (!user)
    return res
      .status(404)
      .json({ code:400,message: "Không tìm thấy người dùng để cập nhật" });

  // Không có dữ liệu hợp lệ để cập nhật
  if (
    typeof name === "undefined" &&
    typeof avatar === "undefined" &&
    typeof new_password === "undefined"
  ) {
    return res
      .status(400)
      .json({ code:400,message: "Không có dữ liệu hợp lệ để cập nhật" });
  }

  const updateData = {};
  if (typeof name !== "undefined") updateData.name = name;
  if (typeof avatar !== "undefined") updateData.avatar = avatar;

  // Đổi mật khẩu: cần có old_password và đúng thì mới cho đổi
  if (typeof new_password !== "undefined") {
    if (!old_password)
      return res
        .status(400)
        .json({ code:400,message: "Vui lòng cung cấp mật khẩu cũ để đổi mật khẩu" });

    const ok = await argon2.verify(user.password, String(old_password));
    if (!ok)
      return res.status(400).json({ code:400,message: "Mật khẩu cũ không chính xác" });

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

// [DELETE] /api/admin/users/:id
module.exports.softDeleteUser = async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ message: "Chỉ admin được phép" });
  }

  if (req.user.id == id) {
    return res.status(400).json({
      message: "Không thể xóa chính mình",
    });
  }

  const user = await db.User.findByPk(id);
  if (!user) {
    return res.status(404).json({ message: "Không tìm thấy user" });
  }

  await user.update({
    deleted: true,
    status: "inactive",
  });

  return res.status(200).json({
    message: "Xóa mềm người dùng thành công",
  });
};

//[PATCH] /api/users/:id/status
module.exports.toggleUserStatus = async (req, res) => {
  const { id } = req.params;

  const user = await db.User.findByPk(id);
  if (req.user.role !== UserRole.ADMIN) {
  return res.status(403).json({ message: "Chỉ admin được phép" });
}

  if (!user) {
    return res.status(404).json({ message: "Người dùng không tồn tại" });
  }

  const newStatus = user.status === "active" ? "inactive" : "active";

  await user.update({ status: newStatus });

  return res.json({
    message: "Cập nhật trạng thái thành công",
    data: {
      id: user.id,
      status: newStatus,
    },
  });
};