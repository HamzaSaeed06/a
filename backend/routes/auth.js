const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../db');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username aur password required hain.' });
  }

  try {
    const [users] = await db.query(
      `SELECT u.user_id, u.username, u.password_hash,
              u.is_active, r.role_name,
              t.team_id, t.team_name, t.remaining_budget
       FROM Users u
       JOIN Roles r ON u.role_id = r.role_id
       LEFT JOIN Teams t ON t.user_id = u.user_id
       WHERE u.email = ? OR u.username = ?`,
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Username ya password galat hai.' });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account suspend hai. System Admin se contact karo.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Username ya password galat hai.' });
    }

    await db.query(
      'UPDATE Users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?',
      [user.user_id]
    );

    const token = jwt.sign(
      {
        user_id:      user.user_id,
        username:     user.username,
        role:         user.role_name,
        team_id:      user.team_id || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        user_id:          user.user_id,
        username:         user.username,
        role:             user.role_name,
        team_id:          user.team_id || null,
        team_name:        user.team_name || null,
        remaining_budget: user.remaining_budget || null,
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

const { verifyToken } = require('../middleware/auth');

router.get('/me', verifyToken, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.user_id, u.username, r.role_name,
              t.team_id, t.team_name, t.remaining_budget
       FROM Users u
       JOIN Roles r ON u.role_id = r.role_id
       LEFT JOIN Teams t ON t.user_id = u.user_id
       WHERE u.user_id = ?`,
      [req.user.user_id]
    );
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
