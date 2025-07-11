import jwt from 'jsonwebtoken';
import { AUTH_MESSAGES } from '../constants/auth.js';
import rateLimit from 'express-rate-limit';

/**
 * Generates a token for the user
 * @param {*} user - The user object
 * @returns - The token string generated by jsonwebtoken
 */
export const generateToken = (user) => {
  const payload = {
    _id: user._id.toString(),
    username: user.username,
    email: user.email,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

/**
 * Authenticates the token and adds the user info to the request object
 * @param {*} req - The request object
 * @param {*} res - The response object
 * @param {*} next - The next middleware function
 * @returns - The next middleware function
 */
export const authenticateToken = (req, res, next) => {
  const authToken = req.headers.authorization;
  if (!authToken?.startsWith('Bearer ')) {
    return res.status(401).json({ message: AUTH_MESSAGES.UNAUTHORIZED });
  }

  try {
    // Verify the bearer token
    const token = authToken.split(' ')[1];
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
    // Add user info to request object
    req.user = decodedUser;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: AUTH_MESSAGES.TOKEN_EXPIRED });
    }
    return res.status(401).json({ message: AUTH_MESSAGES.INVALID_TOKEN });
  }
};

/**
 * Rate limiter for the auth endpoints
 * @type {import('express-rate-limit').RateLimitRequestHandler}
 */
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: AUTH_MESSAGES.TOO_MANY_REQUESTS,
});

/**
 * Verifies the socket token
 * @param {*} socket - The socket object
 * @param {*} next - The next middleware function
 * @returns - The next middleware function
 */
export const verifySocketToken = (socket, next) => {
  const token = socket.handshake.auth?.token;
  const instanceId = socket.handshake.auth?.instanceId;

  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    socket.instanceId = instanceId;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};
