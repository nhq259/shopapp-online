const path = require('path');
const fs = require('fs')
const db = require("models/index");
const { Op, Sequelize } = db.Sequelize;

const uploadImages = async (req, res) => {
  try {
    // Kiểm tra không có file nào được tải lên
    if (!req.files || req.files.length === 0) {
      throw new Error("Không có file nào được tải lên");
    }

    // Trả về đường dẫn của các file ảnh được tải lên
    const uploadedImagesPaths = req.files.map((file) =>
      path.basename(file.path)
    );

    res.status(201).json({
      message: "Tải ảnh lên thành công",
      files: uploadedImagesPaths,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message || "Lỗi khi tải ảnh",
    });
  }
};

function normalizeFileName(input) {
  let s = String(input || "");
  s = s.normalize("NFC");
  s = s.replace(/[\u00A0\u200B]/g, " "); // NBSP + zero-width space -> space
  s = s.replace(/\s+/g, " ").trim();
  s = s.replace(/^['"]|['"]$/g, "");
  return path.basename(s);
}


function candidateDbValues(basename) {
  return [basename, `uploads/${basename}`, `/uploads/${basename}`];
}

async function isImageInUse(basename) {
  const candidates = candidateDbValues(basename);

  // Danh sách nơi có thể lưu ảnh (tuỳ schema của bạn, chỉnh cho khớp)
  const refs = [
    { model: db.User, fields: ["avatar"] },
    { model: db.Category, fields: ["image"] },
    { model: db.Brand, fields: ["image"] },
    { model: db.Product, fields: ["image"] },
    { model: db.News, fields: ["image"] },
    { model: db.Banner, fields: ["image"] },
    { model: db.ProductImage, fields: ["image_url"] },

  ].filter(Boolean);

  for (const { model, fields } of refs) {
    // where OR theo từng field
    const orConds = fields.map((f) => ({ [f]: { [Op.in]: candidates } }));
    const found = await model.findOne({ where: { [Op.or]: orConds } });
    if (found) {
      const modelName =
        model.name ||
        (typeof model.getTableName === "function"
          ? model.getTableName()
          : "UnknownModel");
      return { inUse: true, by: `${modelName}.${fields.join("|")}` };
    }
  }
  return { inUse: false, by: null };
}

const deleteImage = async (req, res) => {
  const raw = req.body?.url || req.body?.file || req.body?.image;

  if (!raw || !String(raw).trim()) {
    return res.status(400).json({ message: "Thiếu tên file/url ảnh" });
  }

  // 1) Chuẩn hóa & chỉ lấy tên file
  const basename = normalizeFileName(raw);

  // 2) Chặn xóa nếu ảnh đang dùng trong DB
  const using = await isImageInUse(basename);
  if (using.inUse) {
    return res.status(409).json({
      message: "Không thể xóa. Ảnh đang được sử dụng trong hệ thống.",
      usingBy: using.by,
      file: basename,
    });
  }

  // 3) Xóa file trong /uploads
  const imagePath = path.join(__dirname, "../uploads", basename);
  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ message: "Ảnh không tồn tại", file: basename });
  }

  try {
    fs.unlinkSync(imagePath);
    return res.status(200).json({
      message: "Xóa ảnh thành công",
      file: basename,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Lỗi khi xóa ảnh",
      error: err.message,
    });
  }
};

const viewImage = async (req, res) => {
  const {fileName} = req.params;
  const imagePath = path.join( path.join(__dirname, "../uploads/"),fileName)
  fs.access(imagePath,fs.constants.F_OK,(err)=>{
    if(err){
      return res.status(400).send('Image not Found')
    }
    res.sendFile(imagePath)
  })
};

module.exports = {
  uploadImages,
  viewImage,
  deleteImage
};