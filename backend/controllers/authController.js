const bcryptjs = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    // Check password (in real app, use proper password hashing)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/'
    });

    // Also send token in response for client-side storage
    // Include class information for students
    const userData = {
      id: user.id,
      _id: user._id, // Include both id formats
      email: user.email,
      name: user.name,
      role: user.role
    };

    // Add class information for students
    if (user.role === 'student') {
      userData.class = user.class || "";
      userData.rollNo = user.rollNo;
    }

    // Add subjects for teachers
    if (user.role === 'teacher') {
      userData.subjects = user.subjects || [];
    }

    res.json({
      token: token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      role: role || 'student'
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/'
    });

    // Prepare user data with role-specific fields
    const userData = {
      id: newUser.id,
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    };

    // Add class information for students
    if (newUser.role === 'student') {
      userData.class = newUser.class || "";
      userData.rollNo = newUser.rollNo;
    }

    // Add subjects for teachers
    if (newUser.role === 'teacher') {
      userData.subjects = newUser.subjects || [];
    }

    res.status(201).json({
      user: userData
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const logout = (req, res) => {
  try {
    // Clear token cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
      path: '/'
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  login,
  register,
  logout
};