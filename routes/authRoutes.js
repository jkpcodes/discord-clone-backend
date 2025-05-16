import { Router } from 'express';
import { register, login, logout } from '../controllers/authController.js';
import { createValidator } from 'express-joi-validation';
import { registerSchema, loginSchema } from '../schemas/authSchemas.js';
import { authenticateToken } from '../util/authUtil.js';

const validator = createValidator({});

const router = Router();

router.post('/register', validator.body(registerSchema), register);

router.post('/login', validator.body(loginSchema), login);

router.post('/logout', authenticateToken, logout);

export default router;
