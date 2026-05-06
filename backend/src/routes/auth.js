import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  let { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  username = username.trim();
  try {
    const [users] = await db.query(
      `SELECT u.user_id, u.username, u.email, u.password_hash,
              u.is_active, r.role_name,
              t.team_id, t.team_name, t.remaining_budget
       FROM Users u
       JOIN Roles r ON u.role_id = r.role_id
       LEFT JOIN Teams t ON t.user_id = u.user_id
       WHERE LOWER(TRIM(u.email)) = LOWER(?) OR LOWER(TRIM(u.username)) = LOWER(?)`,
      [username, username]
    );
    if (users.length === 0) {
      return res.status(401).json({ error: 'Account not found or invalid credentials.' });
    }
    const user = users[0];
    if (!user.is_active) {
      return res.status(403).json({ error: 'Your account is currently suspended.' });
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password. Please try again.' });
    }
    await db.query('UPDATE Users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?', [user.user_id]);
    const token = jwt.sign(
      { user_id: user.user_id, username: user.username, role: user.role_name, team_id: user.team_id || null },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        role: user.role_name,
        team_id: user.team_id || null,
        team_name: user.team_name || null,
        remaining_budget: user.remaining_budget || null,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.user_id, u.username, u.email, r.role_name,
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

router.put('/update-profile', verifyToken, async (req, res) => {
  const { username, email, password } = req.body;
  const user_id = req.user.user_id;
  try {
    let updates = [];
    let values = [];
    if (username) {
      const [[existing]] = await db.query('SELECT user_id FROM Users WHERE username = ? AND user_id != ?', [username.trim(), user_id]);
      if (existing) return res.status(409).json({ error: 'Username already taken.' });
      updates.push('username = ?');
      values.push(username.trim());
    }
    if (email) {
      const [[existing]] = await db.query('SELECT user_id FROM Users WHERE email = ? AND user_id != ?', [email.trim(), user_id]);
      if (existing) return res.status(409).json({ error: 'Email already taken.' });
      updates.push('email = ?');
      values.push(email.trim());
    }
    if (password) {
      const hash = await bcrypt.hash(password, 12);
      updates.push('password_hash = ?');
      values.push(hash);
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nothing to update.' });
    }
    values.push(user_id);
    await db.query(`UPDATE Users SET ${updates.join(', ')} WHERE user_id = ?`, values);
    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
