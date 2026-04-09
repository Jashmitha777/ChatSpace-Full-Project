import { User } from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

const buildAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  token: generateToken(user._id)
});

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password.' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists.' });
  }

  const user = await User.create({ name, email, password });
  return res.status(201).json(buildAuthResponse(user));
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  return res.json(buildAuthResponse(user));
};

export const getMe = async (req, res) => res.json(req.user);
