import { User } from '../models/user.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../util/authUtil.js';
import { AUTH_MESSAGES } from '../constants/auth.js';

/**
 * Registers a new user
 * @param {*} req - The request object
 * @param {*} res - The response object
 * @returns - The response object
 */
export const register = async (req, res) => {
  const { username, email, password } = req.body;
  const savedEmail = email.trim().toLowerCase();
  const savedUsername = username.trim();

  try {
    // Check if user already exists
    const userExists = await User.exists({ email: savedEmail });
    if (userExists) {
      return res.status(400).json({ message: AUTH_MESSAGES.USER_EXISTS });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      username: savedUsername,
      email: savedEmail,
      password: hashedPassword,
    });

    const token = generateToken(user);

    res.status(201).json({
      userDetails: {
        _id: user._id.toString(),
        email: savedEmail,
        username: savedUsername,
        token,
      },
    });
  } catch (error) {
    console.error('Register error: ', error);
    res.status(500).json({ message: AUTH_MESSAGES.SERVER_ERROR });
  }
};

/**
 * Logs in a user
 * @param {*} req - The request object
 * @param {*} res - The response object
 * @returns - The response object
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: AUTH_MESSAGES.EMAIL_OR_PASSWORD_INCORRECT });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: AUTH_MESSAGES.EMAIL_OR_PASSWORD_INCORRECT });
    }

    const token = generateToken(user);

    res.status(200).json({
      userDetails: {
        _id: user._id.toString(),
        email: user.email,
        username: user.username,
        token,
      },
    });
  } catch (error) {
    console.error('Login error: ', error);
    res.status(500).json({ message: AUTH_MESSAGES.SERVER_ERROR });
  }
};

/**
 * Logs out a user
 * @param {*} req - The request object
 * @param {*} res - The response object
 * @returns - The response object
 */
export const logout = async (req, res) => {
  res.status(200).json({ message: 'User logged out successfully' });
};
