const Joi = require("joi");

class loginUserRequest {
  constructor(data) {
    this.email = data.email;
    this.phone = data.phone;
    this.password = data.password; // sẽ được hash trước khi lưu vào DB
  }

  static validate(data) {
    const schema = Joi.object({
      email: Joi.string().email().optional(),
      phone: Joi.string().pattern(/^[0-9]{9,11}$/).optional().allow(""),
      password: Joi.string().min(6).required(), // bắt buộc, >= 6 ký tự
    });

    return schema.validate(data);
  }
}

module.exports = loginUserRequest;
