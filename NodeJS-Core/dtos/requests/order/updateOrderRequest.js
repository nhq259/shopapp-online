const Joi = require("joi");
const OrderStatus = require("constants/OrderStatus");

class UpdateOrderRequest {
  constructor(data) {
    this.status = data.status;
    this.note = data.note;
    this.total = data.total;
    this.phone = data.phone;
    this.address = data.address;
  }

  static validate(data) {
    const schema = Joi.object({
      status: Joi.number()
        .valid(...Object.values(OrderStatus))
        .optional()
        .allow(null),

      note: Joi.string()
        .optional()
        .allow(null, ""),

      total: Joi.number()
        .integer()
        .min(0)
        .optional()
        .allow(null),

      phone: Joi.string()
        .trim()
        .pattern(/^[0-9+\-\s()]{7,20}$/)
        .optional()
        .allow(null)
        .messages({
          "string.pattern.base": "Số điện thoại không hợp lệ (chỉ 0-9, + - ( ) và khoảng trắng, 7-20 ký tự).",
        }),

      address: Joi.string()
        .trim()
        .min(5)
        .max(255)
        .optional()
        .allow(null, "")
        .messages({
          "string.min": "Địa chỉ quá ngắn.",
        }),
    });

    return schema.validate(data, { abortEarly: false });
  }
}

module.exports = UpdateOrderRequest;
