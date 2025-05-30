import Joi from 'joi';

export const inviteFriendSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const acceptRejectFriendSchema = Joi.object({
  id: Joi.string().required(),
});