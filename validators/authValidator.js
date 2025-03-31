const Joi = require("joi");

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  dateOfBirth: Joi.date().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.any()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Confirm password does not match password",
    }),
});


const otpVerifySchema = Joi.object({
  tempId: Joi.string().required(),
  otp: Joi.string().length(6).required(),
});

const registrationOtpVerifySchema = Joi.object({
  tempId: Joi.string().required(),
  otp: Joi.string().length(6).required(),
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  dateOfBirth: Joi.date().required(),
});

module.exports = { loginSchema, registerSchema, otpVerifySchema, registrationOtpVerifySchema };
