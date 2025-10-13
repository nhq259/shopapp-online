// helpers/tokenHelper.js
const jwt = require("jsonwebtoken");
const db = require("models/index");
const JWT_SECRET = process.env.JWT_SECRET_KEY;

class AuthError extends Error {
  constructor(message, status = 401, code = "AUTH_ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function getUserFromToken(req) {
  // 1) Lấy token
  const auth = req.headers?.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    throw new AuthError("Không có token được cung cấp", 401, "TOKEN_MISSING");
  }
  const token = auth.split(" ")[1];

  // 2) Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    const msg = e.name === "TokenExpiredError" ? "Token đã hết hạn" : "Token không hợp lệ";
    const code = e.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "TOKEN_INVALID";
    throw new AuthError(msg, 401, code);
  }

  // 3) Tìm user
  const userId = decoded.id || decoded.userId || decoded.sub;
  if (!userId) {
    throw new AuthError("Token không chứa thông tin người dùng", 401, "TOKEN_PAYLOAD_INVALID");
  }

  const user = await db.User.findByPk(userId);
  if (!user) {
    throw new AuthError("Người dùng không tồn tại", 404, "USER_NOT_FOUND");
  }

  // 4) Token có cũ hơn lần đổi mật khẩu không?
  if (user.password_changed_at) {
    const iat = typeof decoded.iat === "number" ? decoded.iat : 0;
    const pwdChangedAtSec = Math.floor(new Date(user.password_changed_at).getTime() / 1000);
    if (iat < pwdChangedAtSec) {
      throw new AuthError("Token không hợp lệ do mật khẩu đã thay đổi", 401, "TOKEN_STALE");
    }
  }

  return user;
}

module.exports = getUserFromToken;
module.exports.AuthError = AuthError;
