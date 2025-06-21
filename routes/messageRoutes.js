import { Router } from 'express';
import { authenticateToken } from '../util/authUtil.js';
import { getDirectMessages, sendDirectMessage } from '../controllers/messageController.js';
import { createValidator } from 'express-joi-validation';
import { sendMessageSchema } from '../schemas/messageSchema.js';

const validator = createValidator({});
const router = Router();

// Get direct messages
router.get('/direct/:id', authenticateToken, getDirectMessages);

// Send a direct message to a user
router.post('/direct/:id', authenticateToken, validator.body(sendMessageSchema), sendDirectMessage);

export default router;