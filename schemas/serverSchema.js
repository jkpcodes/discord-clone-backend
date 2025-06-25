import Joi from 'joi';

export const createServerSchema = Joi.object({
  name: Joi.string().required(),
  members: Joi.array().items(Joi.string()).required(),
});