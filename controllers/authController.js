export const register = async (req, res) => {
  res.status(201).json({ message: 'hahahahay User registered successfully' });
};

export const login = async (req, res) => {
  res.status(200).json({ message: 'User logged in successfully' });
};

export const logout = async (req, res) => {
  res.status(200).json({ message: 'User logged out successfully' });
};
