const jwt = require('jsonwebtoken');
const config = require('../config');

const auth = async (req, res, next) => {
  try {
    const header = req.header('Authorization');
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = header.replace('Bearer ', '');
    const decoded = jwt.verify(token, config.jwtSecret);
    req.userId = decoded.userId;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = auth;
