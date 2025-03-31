const Joi = require("joi");

const transferSchema = Joi.object({
  senderId: Joi.string().required(),
  recipientId: Joi.string().required(),
  amount: Joi.number().min(5).max(3000).required(),
  password: Joi.string().required(),
});

module.exports = { transferSchema };
