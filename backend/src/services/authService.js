/**
 * Auth service - Business logic separation (best practice)
 * Security: Password hashing with bcrypt before persist
 */
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const Organization = require('../models/Organization');

const register = async (body) => {
  const { name, email, password, role, orgName } = body;
  if (!orgName) throw Object.assign(new Error('Workspace Name is required for registration'), { statusCode: 400 });

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw Object.assign(new Error('User already exists'), { statusCode: 400 });

  // Security: Hash password - never store plain text
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: role || 'member',
    status: 'online', 
  });

  // If orgName is provided, create a new organization and make this user the admin
  if (orgName) {
    const org = await Organization.create({
      name: orgName,
      slug: orgName.toLowerCase().replace(/ /g, '-'),
      owner: user._id,
    });
    user.organization = org._id;
    user.role = 'admin';
    await user.save();
  }

  const token = generateToken(user._id);
  return { user: (await user.populate('organization')).toJSON(), token };
};

const login = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const token = generateToken(user._id);
  return { user: (await user.populate('organization')).toJSON(), token };
};

module.exports = { register, login, generateToken };
