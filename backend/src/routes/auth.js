const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = await User.createUser({ name, email, password, phone });

    const token = jwt.sign({ userId: user._id, email: user.email }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await User.comparePassword(user, password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    res.json({ user: User.sanitize(user), token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: User.sanitize(user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/me', auth, async (req, res) => {
  try {
    const updates = {};
    const allowed = ['name', 'phone', 'avatar', 'notificationSettings'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(req.userId, updates);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
