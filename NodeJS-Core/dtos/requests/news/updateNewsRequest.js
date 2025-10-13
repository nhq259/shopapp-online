const Joi = require("joi");

class updateNewsRequest {
  constructor(data) {
    this.title = data.title;
    this.content = data.content;
    this.image = data.image;
  }

  static validate(data) {
    const schema = Joi.object({
      title: Joi.string().optional(), // có thể bỏ qua, nếu gửi phải là string
      content: Joi.string().optional(), // có thể bỏ qua, nếu gửi phải là string
      image: Joi.string().optional().allow(""), // có thể bỏ qua, nếu gửi phải là URL hoặc rỗng
    });

    return schema.validate(data);
  }
}

module.exports = updateNewsRequest;
