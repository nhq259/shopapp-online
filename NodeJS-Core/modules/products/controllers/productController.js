const { Op } = require("sequelize");

const db = require("models/index");
const getAvatarURL = require("helpers/imageHelper");

// [GET] /api/products
module.exports.getProducts = async (req, res) => {
  const { search = "", page = 1,category,
      brand,
      price_min,
      price_max } = req.query;
  const pageSize = 5;
  const offset = (page - 1) * pageSize;

    const andConds = [{ status: "active" }];

    if (search.trim() !== "") {
      andConds.push({
        [db.Sequelize.Op.or]: [
          { name: { [db.Sequelize.Op.like]: `%${search}%` } },
          { description: { [db.Sequelize.Op.like]: `%${search}%` } },
          { specification: { [db.Sequelize.Op.like]: `%${search}%` } },
        ],
      });
    }

    // 🔍 CATEGORY FILTER
    if (category) {
      andConds.push({ category_id: category });
    }

    // 🔍 BRAND FILTER
    if (brand) {
      andConds.push({ brand_id: brand });
    }
    // 🔍 PRICE RANGE FILTER
    if (price_min && price_max) {
      andConds.push({
        price: {
          [Op.between]: [Number(price_min), Number(price_max)]
        }
      });
    }

    const whereClause = { [db.Sequelize.Op.and]: andConds };

    // 1️⃣ Truy vấn sản phẩm + attributes
    const [products, totalProducts] = await Promise.all([
      db.Product.findAll({
        where: whereClause,
        limit: pageSize,
        offset: offset,
        include: [
          {
            model: db.ProductAttributeValue,
            as: "attributes",
            include: [
              {
                model: db.Attribute,
                as: "attribute",
                attributes: ["name"],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      }),
      db.Product.count({ where: whereClause }),
    ]);

    // 2️⃣ Format dữ liệu trả về cho FE
    const formattedProducts = products.map((p) => {
      const plain = p.get({ plain: true });
      const formattedAttributes = (plain.attributes || []).map((item) => ({
        name: item.attribute?.name || null,
        value: item.value,
      }));

      delete plain.attributes;

      return {
        ...plain,
        attributes: formattedAttributes,
        image: getAvatarURL.getAvatarURL(plain.image || ""),
      };
    });

    // 3️⃣ Trả response
    return res.status(200).json({
      message: "Lấy danh sách sản phẩm thành công",
      data: formattedProducts,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(totalProducts / pageSize),
      total: totalProducts,
    });
};

// [GET] /api/products/:id
module.exports.getProductById = async (req, res) => {
  const productId = req.params.id;

    const product = await db.Product.findOne({
      where: { id: productId, status: "active" },
      include: [
        {
          model: db.ProductImage,
          as: "product_images", // alias trong model Product
          attributes: ["image_url"],
        },
        {
          model: db.ProductAttributeValue,
          as: "attributes", // alias trong Product.hasMany
          include: [
            {
              model: db.Attribute,
              as: "attribute", // alias trong ProductAttributeValue.belongsTo
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Chuyển sang plain object để dễ xử lý
    const plainProduct = product.get({ plain: true });

    // Format lại attributes cho gọn
    const formattedAttributes = (plainProduct.attributes || []).map((item) => ({
      name: item.attribute?.name || null,
      value: item.value,
    }));

    delete plainProduct.attributes;

    return res.status(200).json({
      message: "Chi tiết một sản phẩm",
      data: {
        ...plainProduct,
        attributes: formattedAttributes,
        image: getAvatarURL.getAvatarURL(plainProduct.image || ""),
      },
    });
};


// [POST] /api/products
module.exports.insertProduct = async (req, res) => {
  const { name, attributes = [], ...productData } = req.body;
  const transaction = await db.sequelize.transaction();

    // 1️⃣ Kiểm tra tên sản phẩm hợp lệ
    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Tên sản phẩm là bắt buộc",
      });
    }

    // 2️⃣ Kiểm tra trùng tên
    const existing = await db.Product.findOne({
      where: { name: name.trim() },
    });

    if (existing) {
      return res.status(400).json({
        message: "Tên sản phẩm đã tồn tại, không thể thêm mới",
      });
    }

    // 3️⃣ Tạo sản phẩm mới
    const product = await db.Product.create(
      {
        ...productData,
        name: name.trim(),
        status: "active",
      },
      { transaction }
    );

    // 4️Thêm các thuộc tính động (attributes)
    for (const attr of attributes) {
      const { name: attrName, value } = attr;
      if (!attrName || !value) continue;

      // Tìm hoặc tạo attribute trong bảng attributes
      const [attribute] = await db.Attribute.findOrCreate({
        where: { name: attrName.trim() },
        defaults: { name: attrName.trim() },
        transaction,
      });

      // Tạo bản ghi trong product_attribute_values
      await db.ProductAttributeValue.create(
        {
          product_id: product.id,
          attribute_id: attribute.id,
          value,
        },
        { transaction }
      );
    }

    await transaction.commit();

    // 5️⃣ Lấy lại sản phẩm vừa thêm (kèm attributes)
    const newProduct = await db.Product.findByPk(product.id, {
      include: [
        {
          model: db.ProductAttributeValue,
          as: "attributes",
          include: [
            {
              model: db.Attribute,
              as: "attribute",
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    // 6️⃣ Format lại dữ liệu trả về cho FE
    const plainProduct = newProduct.get({ plain: true });
    const formattedAttributes = (plainProduct.attributes || []).map((item) => ({
      name: item.attribute?.name || null,
      value: item.value,
    }));

    delete plainProduct.attributes;

    // 7️⃣ Trả kết quả
    return res.status(201).json({
      message: "Thêm mới sản phẩm thành công",
      data: {
        ...plainProduct,
        attributes: formattedAttributes,
        image: getAvatarURL.getAvatarURL(plainProduct.image || ""),
      },
    });
};


// [DELETE] /api/products/:id (xóa mềm)
module.exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  const transaction = await db.sequelize.transaction();

 
    //  Kiểm tra sản phẩm có tồn tại hay không
    const product = await db.Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm để xóa",
      });
    }

    //  Kiểm tra xem có OrderDetail nào tham chiếu đến sản phẩm này không
    const orderDetails = await db.OrderDetail.findAll({
      where: { product_id: id },
      include: [
        {
          model: db.Order,
          as: "order", // alias trong model OrderDetail.belongsTo(Order)
          attributes: ["id", "user_id", "session_id", "status", "note", "total", "createdAt"],
        },
      ],
    });

    if (orderDetails.length > 0) {
      // Nếu sản phẩm đang nằm trong đơn hàng, không cho phép xóa
      return res.status(400).json({
        message: "Không thể xóa sản phẩm vì đang được tham chiếu trong đơn hàng.",
        related_orders: orderDetails.map((od) => ({
          order_id: od.order?.id,
          user_id: od.order?.user_id,
          session_id: od.order?.session_id,
          status: od.order?.status,
          note: od.order?.note,
          total: od.order?.total,
          createdAt: od.order?.createdAt,
        })),
      });
    }

    //  Không có đơn hàng nào → XÓA MỀM sản phẩm
    const [affectedRows] = await db.Product.update(
      { status: "inactive", deletedAt: new Date() },
      { where: { id, status: "active" }, transaction }
    );

    if (!affectedRows) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm đang hoạt động để xóa",
      });
    }

    await transaction.commit();

    // Trả phản hồi thành công
    return res.status(200).json({
      message: "Xóa mềm sản phẩm thành công",
    });
};

// [PUT] /api/products/:id
module.exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { attributes = [], ...productData } = req.body;
  const { name } = req.body;


    //  Kiểm tra trùng tên nếu client có gửi name
    if (name && name.trim()) {
      const existing = await db.Product.findOne({
        where: {
          name: name.trim(),
          id: { [db.Sequelize.Op.ne]: id }, // loại trừ sản phẩm hiện tại
        },
      });

      if (existing) {
        return res.status(400).json({
          message: "Tên sản phẩm đã tồn tại, không thể cập nhật",
        });
      }
    }

    //  Cập nhật các thông tin cơ bản trong bảng products
    const [affectedRows] = await db.Product.update(productData, { where: { id } });

    if (!affectedRows) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm để cập nhật",
      });
    }

    // Cập nhật các thuộc tính động (attributes)
    for (const attr of attributes) {
      const { name: attrName, value } = attr;

      if (!attrName) continue; // bỏ qua thuộc tính không hợp lệ

      // Tìm hoặc tạo thuộc tính trong bảng attributes
      const [attribute] = await db.Attribute.findOrCreate({
        where: { name: attrName.trim() },
        defaults: { name: attrName.trim() },
      });

      // Kiểm tra xem giá trị đã tồn tại trong product_attribute_values chưa
      const existingAttrValue = await db.ProductAttributeValue.findOne({
        where: {
          product_id: id,
          attribute_id: attribute.id,
        },
      });

      if (existingAttrValue) {
        // Nếu tồn tại → cập nhật giá trị
        await existingAttrValue.update({ value });
      } else {
        // Nếu chưa tồn tại → thêm mới
        await db.ProductAttributeValue.create({
          product_id: id,
          attribute_id: attribute.id,
          value,
        });
      }
    }

   // 4️⃣ Lấy lại dữ liệu sau khi cập nhật (đã include alias chính xác)
    const updatedProduct = await db.Product.findByPk(id, {
      include: [
        {
          model: db.ProductAttributeValue,
          as: "attributes", // 👈 alias phải trùng trong models/product.js
          include: [
            {
              model: db.Attribute,
              as: "attribute", // 👈 alias trong models/product_attribute_value.js
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm sau khi cập nhật",
      });
    }

    // 5️⃣ Format lại dữ liệu trả về cho FE gọn gàng
    const plainProduct = updatedProduct.get({ plain: true });

    const formattedAttributes = (plainProduct.attributes || []).map((item) => ({
      name: item.attribute?.name || null,
      value: item.value,
    }));

    delete plainProduct.attributes;

    // 6️⃣ Trả kết quả
    return res.status(200).json({
      message: "Cập nhật sản phẩm thành công",
      data: {
        ...plainProduct,
        attributes: formattedAttributes,
        image: getAvatarURL.getAvatarURL(plainProduct.image || ""),
      },
    });
  };

