const path = require("path");
const multer = require("multer");
const storage= multer.diskStorage({
  destination: function (req, file, callback) {
    const destinationPath = path.join(__dirname, "../uploads/");
    callback(null, destinationPath);
  },
  filename: function (req, file, callback) {
    const newFileName = `${Date.now()}-${file.originalname}`;
    callback(null, newFileName);
  },
});
// Cấu hình chỉ cho phép file ảnh
const fileFilter = (req, file, callback) => {
  if(file.mimetype.startsWith('image')){
    callback(null,true);
  }else{
    callback(new Error('Chỉ được upload file ảnh'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits:{
    fileSize: 1024 * 1024 * 5
  }
})

module.exports = upload;