const Joi = require("joi");

class updateBannerRequest {
  constructor(data) {
    this.name = data.name;
    this.image = data.image;
    this.status = data.status;
  }

  static validate(data) {
    const schema = Joi.object({
      name: Joi.string().optional(),
      // Cho phép: URL http/https hoặc tên file có đuôi ảnh
      image: Joi.alternatives()
        .try(
          Joi.string().uri({ scheme: ["http", "https"] }),
          Joi.string().pattern(
            /^[\w\-. ]+\.(jpg|jpeg|png|gif|webp)$/i,
            "local filename"
          )
        )
        .optional()
        .allow(""),
      status: Joi.number().integer().greater(0).optional(),
    });

    return schema.validate(data);
  }
}

module.exports = updateBannerRequest;
