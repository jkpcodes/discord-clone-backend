import { Router } from 'express';
import { register, login, logout } from '../controllers/authController.js';
import { createValidator } from 'express-joi-validation';
import { registerSchema, loginSchema } from '../schemas/authSchemas.js';
import { authenticateToken, rateLimiter } from '../util/authUtil.js';

const validator = createValidator({});

const router = Router();

// 👇 Only apply rate limit when not in development or test mode
if (process.env.NODE_ENV !== 'dev' && process.env.NODE_ENV !== 'test') {
  router.post('/register', rateLimiter, validator.body(registerSchema), register);
  router.post('/login', rateLimiter, validator.body(loginSchema), login);
} else {
  router.post('/register', validator.body(registerSchema), register);
  router.post('/login', validator.body(loginSchema), login);
}
router.post('/logout', authenticateToken, logout);

export default router;
