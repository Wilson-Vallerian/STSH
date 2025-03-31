const Joi = require("joi");

const updateNameSchema = Joi.object({
  userId: Joi.string().required(),
  newName: Joi.string().min(2).required(),
});

const updatePasswordSchema = Joi.object({
  userId: Joi.string().required(),
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

module.exports = { updateNameSchema, updatePasswordSchema };
