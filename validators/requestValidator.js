const Joi = require("joi");

const agricultureRequestSchema = Joi.object({
  userId: Joi.string().required(),
  seedType: Joi.string().required(),
  seedAmount: Joi.number().positive().required(),
  dirtType: Joi.string().required(),
  dirtAmount: Joi.number().positive().required(),
  address: Joi.string().required(),
  approval: Joi.boolean().optional(),
  status: Joi.string().valid("pending", "approved", "rejected").optional(),
});

const payRequestSchema = Joi.object({
  userId: Joi.string().required(),
  password: Joi.string().required(),
  approval: Joi.boolean().required(),
});

module.exports = { agricultureRequestSchema, payRequestSchema };
