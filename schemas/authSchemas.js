import Joi from 'joi';
import {
  USER_NAME_MIN_LENGTH,
  USER_NAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '../constants/validators.js';

const passwordValidation = Joi.string()
  .min(PASSWORD_MIN_LENGTH)
  .max(PASSWORD_MAX_LENGTH)
  .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
  .required()
  .messages({
    'string.pattern.base':
    'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password cannot exceed 30 characters',
    'any.required': 'Password is required',
  });

const emailValidation = Joi.string().trim().email().required().messages({
  'string.email': 'Invalid email address',
  'any.required': 'Email is required',
});

/**
 * Validation schema for /auth/register endpoint
 * @type {Joi.ObjectSchema}
 */
export const registerSchema = Joi.object({
  username: Joi.string()
    .trim()
    .min(USER_NAME_MIN_LENGTH)
    .max(USER_NAME_MAX_LENGTH)
    .required()
    .messages({
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters',
      'any.required': 'Username is required',
    }),
  email: emailValidation,
  password: passwordValidation,
});

/**
 * Validation schema for /auth/login endpoint
 * @type {Joi.ObjectSchema}
 */
export const loginSchema = Joi.object({
  email: emailValidation,
  password: passwordValidation,
});
