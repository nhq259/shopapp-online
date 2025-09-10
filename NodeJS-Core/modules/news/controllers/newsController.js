const db = require("models/index")
const { Op } = require("sequelize");

// [GET] /api/news
module.exports.getNews = async (req, res) => {
  const { search = "", page = 1 } = req.query;
  const pageSize = 5;
  const offset = (page - 1) * pageSize;

  let whereClause = {};
  if (search.trim() !== "") {
    whereClause = {
      [Op.or]: [
        { title:   { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
      ],
    };
  }

  const [news, totalNews] = await Promise.all([
    db.News.findAll({
      where: whereClause,
      limit: pageSize,
      offset,
      // order: [['createdAt', 'DESC']],
    }),
    db.News.count({ where: whereClause }),
  ]);

  return res.status(200).json({
    message: "Lấy danh sách tin tức thành công",
    data: news,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(totalNews / pageSize),
    totalNews,
  });
};

// [GET] /api/news/:id
module.exports.getNewsById = async (req, res) => {
  const { id } = req.params;
  const item = await db.News.findByPk(id);

  if (!item) {
    return res.status(404).json({ message: "Không tìm thấy tin tức" });
  }

  return res.status(200).json({
    message: "Chi tiết một tin tức",
    data: item,
  });
};

// [POST] /api/news
module.exports.insertNews = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const newsArticle = await db.News.create(req.body, { transaction: t });

    //we need transactional
    if (req.body.product_ids && req.body.product_ids.length > 0) {
      // verify that all product_id in req.body.product_ids exists
      // otherwise, remove that product's id
      const productIds = req.body.product_ids;

      const existing = await db.Product.findAll({
        where: { id: productIds },
        attributes: ["id"],
        transaction: t,
      });

      const validIdSet = new Set(existing.map(p => p.id));
      const validProductIds = productIds.filter(id => validIdSet.has(id));

      if (validProductIds.length > 0) {
        const newsDetailPromises = validProductIds.map(product_id =>
          db.NewsDetail.create(
            {
              product_id: product_id,
              news_id: newsArticle.id,
            },
            { transaction: t }
          )
        );
        await Promise.all(newsDetailPromises);
      }
    }

    await t.commit();
    return res.status(201).json({
      message: "Thêm mới tin tức thành công",
      data: newsArticle,
    });
  } catch (err) {
    await t.rollback();
    throw err;
  }
};



// [PUT] /api/news/:id
module.exports.updateNews = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  // Nếu client gửi title thì kiểm tra trùng lặp
  if (title && title.trim()) {
    const existing = await db.News.findOne({
      where: {
        title: title.trim(),
        id: { [db.Sequelize.Op.ne]: id }, // loại trừ chính record đang update
      },
    });

    if (existing) {
      return res.status(400).json({
        message: "Tiêu đề tin tức đã tồn tại, không thể cập nhật",
      });
    }
  }

  // Thực hiện update
  await db.News.update(req.body, { where: { id } });

  // Lấy lại dữ liệu mới
  const updated = await db.News.findByPk(id);

  if (!updated) {
    return res.status(404).json({
      message: "Không tìm thấy tin tức để cập nhật",
    });
  }

  return res.status(200).json({
    message: "Cập nhật tin tức thành công",
    data: updated,
  });
};


// [DELETE] /api/news/:id
module.exports.deleteNews = async (req, res) => {
  const { id } = req.params;
  const t = await db.sequelize.transaction();

  try {
    // 1. Xoá các NewsDetail liên quan
    await db.NewsDetail.destroy({
      where: { news_id: id },
      transaction: t,
    });

    // 2. Xoá bản ghi News
    const deleted = await db.News.destroy({
      where: { id },
      transaction: t,
    });

    if (!deleted) {
      await t.rollback();
      return res.status(404).json({ message: "Không tìm thấy tin tức để xóa" });
    }

    // 3. Commit transaction
    await t.commit();
    return res.status(200).json({
      message: "Xóa tin tức thành công",
    });
  } catch (err) {
    await t.rollback();
    throw err; // để asyncHandler hoặc middleware error bắt
  }
};
