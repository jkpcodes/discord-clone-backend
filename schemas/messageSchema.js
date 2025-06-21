import Joi from 'joi';

export const sendMessageSchema = Joi.object({
  content: Joi.string().required(),
  type: Joi.string().valid('group', 'direct').required(),
});
