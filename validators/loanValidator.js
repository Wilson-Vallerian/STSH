const Joi = require("joi");

const applyLoanSchema = Joi.object({
  userId: Joi.string().required(),
  amount: Joi.number().min(100).max(50000).required(),
  password: Joi.string().required(),
});

const loanPaymentSchema = Joi.object({
  loanId: Joi.string().required(),
  userId: Joi.string().required(),
  paymentAmount: Joi.number().positive().required(),
  password: Joi.string().required(),
});

module.exports = { applyLoanSchema, loanPaymentSchema };
