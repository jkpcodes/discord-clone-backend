import Joi from "joi";

const passwordValidation = Joi.string()
  .min(8)
  .max(30)
  .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])"))
  .required()
  .messages({
    "string.pattern.base":
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    "string.min": "Password must be at least 8 characters long",
    "string.max": "Password cannot exceed 30 characters",
    "any.required": "Password is required",
  });

const emailValidation = Joi.string()
  .email()
  .required()
  .messages({
    "string.email": "Invalid email address",
    "any.required": "Email is required",
  });

export const registerSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .required()
    .messages({
      "string.min": "Username must be at least 3 characters long",
      "string.max": "Username cannot exceed 30 characters",
      "any.required": "Username is required",
    }),
  email: emailValidation,
  password: passwordValidation,
});

export const loginSchema = Joi.object({
  email: emailValidation,
  password: passwordValidation,
});
