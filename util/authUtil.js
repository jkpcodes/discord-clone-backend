import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  const payload = {
    _id: user._id.toString(),
    username: user.username,
    email: user.email,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

export const authenticateToken = (req, res, next) => {
  const authToken = req.headers.authorization;
  if (!authToken?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Verify the bearer token
    const token = authToken.split(' ')[1];
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
    // Add user info to request object
    req.user = decodedUser;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
