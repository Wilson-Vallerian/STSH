const Joi = require("joi");

const subscriptionSchema = Joi.object({
  userId: Joi.string().required(),
  email: Joi.string().email().required(),
  insuranceType: Joi.string().required(),
  planType: Joi.string().required(),
  price: Joi.number().min(1).required(),
  tax: Joi.number().min(1).required(),
  password: Joi.string().required(),
});

const cancelSubscriptionSchema = Joi.object({
  userId: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports = { subscriptionSchema, cancelSubscriptionSchema };
