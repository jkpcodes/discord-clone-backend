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
  getFriendMessages,
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
router.get(
  '/direct-messages',
  authenticateToken,
  getFriendMessages
)

export default router;
