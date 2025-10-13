const UserRole = require("constants/UserRole");
const Joi = require("joi");

class insertUserRequest {
  constructor(data) {
    this.email = data.email;
    this.password = data.password; // sẽ được hash trước khi lưu vào DB
    this.name = data.name;
    this.avatar = data.avatar;
    this.phone = data.phone;
    this.status = data.status;
    this.deleted = data.deleted;
  }

  static validate(data) {
    const schema = Joi.object({
      email: Joi.string().email().optional(),
      password: Joi.string().min(6).optional(), // bắt buộc, >= 6 ký tự
      name: Joi.string().required(),
      avatar: Joi.string().optional().allow(""),
      phone: Joi.string().pattern(/^[0-9]{9,11}$/).optional().allow(""),
      status: Joi.string().valid("active", "inactive").optional(),
      deleted: Joi.boolean().optional()
    });

    return schema.validate(data);
  }
}

module.exports = insertUserRequest;
