import { User } from '../models/user.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../util/authUtil.js';

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  const savedEmail = email.trim().toLowerCase();
  const savedUsername = username.trim();

  try {
    // Check if user already exists
    const userExists = await User.exists({ email: savedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
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
        email: savedEmail,
        username: savedUsername,
        token,
      },
    });
  } catch (error) {
    console.error('Register error: ', error);
    res.status(500).json({ message: 'Server error occurred' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res
        .status(400)
        .json({ message: 'Email or password is incorrect' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: 'Email or password is incorrect' });
    }

    const token = generateToken(user);

    res.status(200).json({
      userDetails: { email: user.email, username: user.username, token },
    });
  } catch (error) {
    console.error('Login error: ', error);
    res.status(500).json({ message: 'Server error occurred' });
  }
};

export const logout = async (req, res) => {
  res.status(200).json({ message: 'User logged out successfully' });
};
