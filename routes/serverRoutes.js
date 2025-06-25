import express from 'express';
import { authenticateToken } from '../util/authUtil.js';
import { createServer, getServers } from '../controllers/serverController.js';
import { createServerSchema } from '../schemas/serverSchema.js';
import { createValidator } from 'express-joi-validation';

const validator = createValidator({});
const router = express.Router();

// Create a server
router.post('/create', authenticateToken, validator.body(createServerSchema), createServer);

// Get all servers
router.get('/list', authenticateToken, getServers);

// Load server text channel messages
router.get('/:id/messages', authenticateToken, () => {});

// Send a message to a server text channel
router.post('/:id/messages', authenticateToken, () => {});

// Get all server members
router.get('/:id/members', authenticateToken, () => {});

export default router;