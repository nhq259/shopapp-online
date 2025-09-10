const path = require("path");
const fs = require("fs");

/**
 * Middleware kiểm tra image trong req.body.image
 * - Nếu rỗng hoặc null => pass
 * - Nếu là URL http/https => pass
 * - Nếu là tên file cục bộ => kiểm tra tồn tại trong /uploads
 */
const validateImageExists = (req, res, next) => {
  const imageName = req.body.image;

  // Nếu không có imageName thì cho qua
  if (!imageName || String(imageName).trim() === "") {
    return next();
  }

  // Nếu là URL thì cho qua
  if (
    imageName.startsWith("http://") ||
    imageName.startsWith("https://")
  ) {
    return next();
  }

  // Nếu là file cục bộ thì kiểm tra tồn tại
  const basename = path.basename(imageName);
  const imagePath = path.join(__dirname, "../uploads", basename);

  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({
      message: "File ảnh không tồn tại",
    });
  }

  // Nếu hợp lệ thì tiếp tục
  next();
};

module.exports = validateImageExists;
