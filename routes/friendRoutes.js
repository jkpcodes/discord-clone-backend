import { Router } from 'express';
import { createValidator } from 'express-joi-validation';
import {
  inviteFriendSchema,
  acceptRejectFriendSchema,
} from '../schemas/friendSchema.js';
import { authenticateToken } from '../util/authUtil.js';
import {
  inviteFriend,
  acceptFriend,
  rejectFriend,
} from '../controllers/friendController.js';

const validator = createValidator({});
const router = Router();

router.post(
  '/invite',
  authenticateToken,
  validator.body(inviteFriendSchema),
  inviteFriend
);
router.post(
  '/accept',
  authenticateToken,
  validator.body(acceptRejectFriendSchema),
  acceptFriend
);
router.post(
  '/reject',
  authenticateToken,
  validator.body(acceptRejectFriendSchema),
  rejectFriend
);

export default router;
