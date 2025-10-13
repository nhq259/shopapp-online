const Joi = require("joi");

class insertNewsRequest {
  constructor(data) {
    this.title = data.title;
    this.content = data.content;
    this.image = data.image;
    this.product_ids = data.product_ids;
  }

  static validate(data) {
    const schema = Joi.object({
      title: Joi.string().required(),
      content: Joi.string().required(),
      image: Joi.string().optional().allow(""),
      product_ids: Joi.array().items(Joi.number().integer()).optional(),
    });

    return schema.validate(data);
  }
}

module.exports = insertNewsRequest;
