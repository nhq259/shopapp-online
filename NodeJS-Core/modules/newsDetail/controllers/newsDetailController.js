const db = require("models/index");
const { Op } = require("sequelize");

// [GET] /api/news-details
module.exports.getNewsDetails = async (req, res) => {
  const { page = 1 } = req.query;
  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  const [newsDetails, totalNewsDetails] = await Promise.all([
    db.NewsDetail.findAll({
      // include: [
      //   { model: db.Product}, chi tết...
      //   { model: db.News},
      // ],
      limit: pageSize,
      offset,
      // order: [['createdAt', 'DESC']]
    }),
    db.NewsDetail.count(),
  ]);

  return res.status(200).json({
    message: "Lấy danh sách NewsDetail thành công",
    data: newsDetails,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalNewsDetails / pageSize),
    totalNewsDetails,
  });
};

// [GET] /api/news-details/:id
module.exports.getNewsDetailById = async (req, res) => {
  const { id } = req.params;

  const item = await db.NewsDetail.findByPk(id, {
    include: [
      { model: db.Product},
      { model: db.News },
    ],
  });

  if (!item) {
    return res.status(404).json({ message: "Không tìm thấy NewsDetail" });
  }

  return res.status(200).json({
    message: "Chi tiết một NewsDetail",
    data: item,
  });
};

// [POST] /api/news-details
module.exports.insertNewsDetail = async (req, res) => {
  const { product_id, news_id } = req.body;

  // 1. Kiểm tra Product
  const product = await db.Product.findByPk(product_id);
  if (!product) {
    return res.status(404).json({
      message: "Không tìm thấy sản phẩm với product_id đã cung cấp",
    });
  }

  // 2. Kiểm tra News
  const news = await db.News.findByPk(news_id);
  if (!news) {
    return res.status(404).json({
      message: "Không tìm thấy tin tức với news_id đã cung cấp",
    });
  }

  // 3. Kiểm tra trùng (product_id + news_id đã tồn tại trong NewsDetail)
  const exists = await db.NewsDetail.findOne({
    where: { product_id, news_id },
  });
  if (exists) {
    return res.status(400).json({
      message: "Bản ghi NewsDetail với product_id và news_id này đã tồn tại",
    });
  }

  // 4. Tạo mới NewsDetail
  const newsDetail = await db.NewsDetail.create({ product_id, news_id });

  return res.status(201).json({
    message: "Thêm mới NewsDetail thành công",
    data: newsDetail,
  });
};


// [PUT] /api/news-details/:id
module.exports.updateNewsDetail = async (req, res) => {
  const { id } = req.params;
  const { product_id, news_id } = req.body;

  // 0) Tồn tại bản ghi cần cập nhật?
  const current = await db.NewsDetail.findByPk(id);
  if (!current) {
    return res.status(404).json({ message: "Không tìm thấy NewsDetail để cập nhật" });
  }

  // 1) Nếu client gửi product_id => verify Product tồn tại
  if (product_id !== undefined) {
    const product = await db.Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm với product_id đã cung cấp",
      });
    }
  }

  // 2) Nếu client gửi news_id => verify News tồn tại
  if (news_id !== undefined) {
    const news = await db.News.findByPk(news_id);
    if (!news) {
      return res.status(404).json({
        message: "Không tìm thấy tin tức với news_id đã cung cấp",
      });
    }
  }

  // 3) Tính cặp cuối cùng sau update để kiểm tra trùng (giữ nguyên nếu không gửi)
  const finalProductId = product_id !== undefined ? product_id : current.product_id;
  const finalNewsId    = news_id    !== undefined ? news_id    : current.news_id;

  // 4) Kiểm tra trùng cặp (product_id, news_id) với bản ghi khác
  const dup = await db.NewsDetail.findOne({
    where: {
      product_id: finalProductId,
      news_id: finalNewsId,
      id: { [Op.ne]: id },
    },
  });
  if (dup) {
    return res.status(400).json({
      message: "Bản ghi NewsDetail với cặp product_id và news_id này đã tồn tại",
    });
  }

  // 5) Tiến hành update
  await db.NewsDetail.update(
    { ...req.body, product_id: finalProductId, news_id: finalNewsId },
    { where: { id } }
  );

  // 6) Lấy lại dữ liệu (kèm include)
  const updated = await db.NewsDetail.findByPk(id, {
    include: [
      { model: db.Product, /* as: "product" */ },
      { model: db.News,    /* as: "news" */ },
    ],
  });

  return res.status(200).json({
    message: "Cập nhật NewsDetail thành công",
    data: updated,
  });
};


// [DELETE] /api/news-details/:id
module.exports.deleteNewsDetail = async (req, res) => {
  const { id } = req.params;

  const deleted = await db.NewsDetail.destroy({ where: { id } });
  if (!deleted) {
    return res.status(404).json({
      message: "Không tìm thấy NewsDetail để xóa",
    });
  }

  return res.status(200).json({
    message: "Xóa NewsDetail thành công",
  });
};
