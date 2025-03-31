const Joi = require("joi");

const agricultureRequestSchema = Joi.object({
  userId: Joi.string().required(),
  seedType: Joi.string().required(),
  seedAmount: Joi.number().positive().required(),
  dirtType: Joi.string().required(),
  dirtAmount: Joi.number().positive().required(),
  address: Joi.string().required(),
});

const payRequestSchema = Joi.object({
  userId: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports = { agricultureRequestSchema, payRequestSchema };
