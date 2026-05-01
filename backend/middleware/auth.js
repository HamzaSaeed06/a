const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Login required.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token.' });
  }
};

const pcbOnly = (req, res, next) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Admin Access only.' });
  }
  next();
};

const franchiseOnly = (req, res, next) => {
  if (req.user.role !== 'Franchise') {
    return res.status(403).json({ error: 'Franchise only.' });
  }
  next();
};

module.exports = { verifyToken, pcbOnly, franchiseOnly };
