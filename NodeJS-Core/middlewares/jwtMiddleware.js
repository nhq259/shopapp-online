const getUserFromToken = require("helpers/tokenHelper");
const { AuthError } = require("helpers/tokenHelper"); // nếu bạn export kèm AuthError

const requireRoles = (rolesRequired = []) => {
  if (!Array.isArray(rolesRequired) || rolesRequired.length === 0) {
    throw new Error("requireRoles cần truyền vào một mảng role hợp lệ.");
  }

  return async (req, res, next) => {
    try {
      // Lấy user từ token (sẽ ném lỗi nếu có vấn đề)
      const user = await getUserFromToken(req);

      // Kiểm tra trạng thái tài khoản
      if (user.status === "inactive") {
        return res
          .status(403)
          .json({ message: "Tài khoản đã bị khóa hoặc ngưng hoạt động" });
      }

      // Kiểm tra quyền
      if (!rolesRequired.includes(user.role)) {
        return res.status(403).json({ message: "Không có quyền truy cập" });
      }

      // Hợp lệ -> gắn user vào req
      req.user = user;
      return next();
    } catch (err) {
      const status = err instanceof AuthError ? err.status : 401;
      const code = err.code || "AUTH_ERROR";
      return res.status(status).json({ message: err.message || "Lỗi xác thực", code });
    }
  };
};

module.exports = requireRoles;
