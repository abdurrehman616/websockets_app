const { sendVerificationCode } = require('../utils/email');
const logger = require('../utils/logger'); // Import logger
const User = require('../models/user.model'); // Import User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  const { name, firstName, email, country, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      logger.warn(`Signup attempt with existing email: ${email}`);
      return res.status(400).json({ msg: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    const user = await User.create({
      name,
      firstName,
      email,
      country,
      password: hashedPassword,
      role: 'user',
      verificationCode,
      verificationCodeExpires: expiry
    });

    // await sendVerificationCode(email, verificationCode);

    // Log successful signup
    logger.info(`New user signed up: ${email}`);

    return res.status(201).json({ msg: 'Signup successful, check email for verification code: ' + verificationCode });
  } catch (err) {
    logger.error(`Error during signup for email ${email}: ${err.message}`);
    res.status(500).json({ msg: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
    const { email, code } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        logger.warn(`Verification attempt for non-existent user: ${email}`);
        return res.status(404).json({ msg: 'User not found' });
      }
  
      if (user.isVerified) {
        logger.warn(`Verification attempt for already verified user: ${email}`);
        return res.status(400).json({ msg: 'User already verified' });
      }
  
      const isCodeValid = user.verificationCode === code;
      const isCodeExpired = user.verificationCodeExpires < new Date();
  
      if (!isCodeValid || isCodeExpired) {
        logger.warn(`Invalid or expired verification code for ${email}`);
        return res.status(400).json({ msg: 'Invalid or expired verification code' });
      }
  
      user.isVerified = true;
      user.verificationCode = undefined;
      user.verificationCodeExpires = undefined;
      await user.save();
  
      // Log successful verification
      logger.info(`User email verified successfully: ${email}`);
  
      return res.json({ msg: 'Email verified successfully' });
  
    } catch (err) {
      logger.error(`Error during email verification for ${email}: ${err.message}`);
      res.status(500).json({ msg: 'Server error' });
    }
};

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Login attempt failed: ${email} not found`);
      return res.status(404).json({ msg: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Invalid password for: ${email}`);
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ msg: 'Please verify your email first' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: '1d' }
    );

    logger.info(`User logged in: ${email}`);
    res.json({ token, user: { email: user.email, role: user.role, name: user.name } });

  } catch (err) {
    logger.error(`Login error for ${email}: ${err.message}`);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.adminRegister = async (req, res) => {
    try {
        const { name, email, password, country, firstName } = req.body;

        // Validate input
        if (!name || !email || !password || !country) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Get role from middleware context
        const role = req.user?.role;
        if (!role || role.toLowerCase() !== 'admin') {
            return res.status(403).json({ message: 'Invalid role. Only admin role is allowed here.' });
        }

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: email.toLowerCase() });
        if (existingAdmin) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        // Determine first name
        const resolvedFirstName = firstName || name.split(' ')[0].trim();

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new admin user
        const newAdmin = new User({
            name,
            firstName: resolvedFirstName,
            email: email.toLowerCase(),
            password: hashedPassword,
            isVerified: true, // Admins are auto-verified
            role: 'admin',
            country
        });

        await newAdmin.save();

        res.status(201).json({
            message: 'Admin registered successfully',
            adminId: newAdmin._id
        });

    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};