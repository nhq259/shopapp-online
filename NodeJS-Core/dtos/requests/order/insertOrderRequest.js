const Joi = require("joi");

class insertOrderRequest {
  constructor(data) {
    this.user_id = data.user_id;
    this.status = data.status;
    this.note = data.note;
    this.total = data.total;
    this.phone = data.phone;
    this.address = data.address;
  }

  static validate(data) {
    const schema = Joi.object({
      user_id: Joi.number().integer().required(),
      status: Joi.number().integer().min(1).required(),
      note: Joi.string().optional().allow(''),
      total: Joi.number().integer().min(0).required(),

      phone: Joi.string()
        .trim()
        .pattern(/^[0-9+\-\s()]{7,20}$/)
        .required()
        .messages({
          "string.pattern.base": "Số điện thoại không hợp lệ (chỉ 0-9, + - ( ) và khoảng trắng, 7-20 ký tự).",
        }),

      address: Joi.string()
        .trim()
        .min(5)
        .max(255)
        .required()
        .messages({
          "string.min": "Địa chỉ quá ngắn.",
        }),
    });

    return schema.validate(data, { abortEarly: false });
  }
}

module.exports = insertOrderRequest;
