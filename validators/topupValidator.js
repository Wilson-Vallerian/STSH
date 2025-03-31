const Joi = require("joi");

const topupSchema = Joi.object({
  userId: Joi.string().required(),
  amount: Joi.number().min(100).max(1000).required(),
  password: Joi.string().required(),
});

module.exports = { topupSchema };
