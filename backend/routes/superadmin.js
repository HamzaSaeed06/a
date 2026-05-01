const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.use((req, res, next) => {
  if (req.user.role !== 'Super Admin') return res.status(403).json({ error: 'Super Admin access only.' });
  next();
});

// ── OVERVIEW STATS ────────────────────────────────────────────
router.get('/overview-stats', async (req, res) => {
  try {
    const [[{ total_users }]]       = await db.query('SELECT COUNT(*) AS total_users FROM Users');
    const [[{ active_users }]]      = await db.query('SELECT COUNT(*) AS active_users FROM Users WHERE is_active = 1');
    const [[{ total_teams }]]       = await db.query('SELECT COUNT(*) AS total_teams FROM Teams');
    const [[{ total_players }]]     = await db.query('SELECT COUNT(*) AS total_players FROM Players');
    const [[{ total_countries }]]   = await db.query('SELECT COUNT(*) AS total_countries FROM Countries');
    const [[{ total_categories }]]  = await db.query('SELECT COUNT(*) AS total_categories FROM Player_Category');
    const [[{ total_auctions }]]    = await db.query('SELECT COUNT(*) AS total_auctions FROM Auction');
    const [[{ live_auctions }]]     = await db.query("SELECT COUNT(*) AS live_auctions FROM Auction WHERE status = 'live'");
    res.json({
      total_users,
      active_users,
      total_teams,
      total_players,
      total_countries,
      total_categories,
      total_auctions,
      total_seasons: total_auctions,
      live_auctions,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── USERS ─────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.user_id, u.username, u.email, u.is_active, u.created_at, r.role_name
       FROM Users u JOIN Roles r ON u.role_id = r.role_id
       ORDER BY u.created_at DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/users', async (req, res) => {
  const bcrypt = require('bcryptjs');
  const { username, email, password, role_name } = req.body;
  if (!username || !email || !password || !role_name) return res.status(400).json({ error: 'All fields required.' });
  try {
    const [[role]] = await db.query('SELECT role_id FROM Roles WHERE role_name = ?', [role_name]);
    if (!role) return res.status(400).json({ error: 'Invalid role.' });
    const [[existing]] = await db.query('SELECT user_id FROM Users WHERE username = ? OR email = ?', [username, email]);
    if (existing) return res.status(409).json({ error: 'Username or email already taken.' });
    const hash = await bcrypt.hash(password, 12);
    await db.query('INSERT INTO Users (username, email, password_hash, role_id, is_active) VALUES (?, ?, ?, ?, 1)', [username, email, hash, role.role_id]);
    res.json({ message: 'User created.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/users/:id', async (req, res) => {
  const bcrypt = require('bcryptjs');
  const { is_active, password, role_name } = req.body;
  try {
    if (typeof is_active !== 'undefined') {
      await db.query('UPDATE Users SET is_active = ? WHERE user_id = ?', [is_active ? 1 : 0, req.params.id]);
    }
    if (role_name) {
      const [[role]] = await db.query('SELECT role_id FROM Roles WHERE role_name = ?', [role_name]);
      if (!role) return res.status(400).json({ error: 'Invalid role.' });
      await db.query('UPDATE Users SET role_id = ? WHERE user_id = ?', [role.role_id, req.params.id]);
    }
    if (password) {
      const hash = await bcrypt.hash(password, 12);
      await db.query('UPDATE Users SET password_hash = ? WHERE user_id = ?', [hash, req.params.id]);
    }
    res.json({ message: 'User updated.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const [[user]] = await db.query(
      'SELECT r.role_name FROM Users u JOIN Roles r ON u.role_id = r.role_id WHERE u.user_id = ?',
      [req.params.id]
    );
    if (user?.role_name === 'Super Admin') return res.status(403).json({ error: 'Cannot delete Super Admin.' });
    await db.query('DELETE FROM Users WHERE user_id = ?', [req.params.id]);
    res.json({ message: 'User deleted.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── CATEGORIES ────────────────────────────────────────────────
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT pc.*, (SELECT COUNT(*) FROM Players p WHERE p.category_id = pc.category_id) AS player_count
       FROM Player_Category pc ORDER BY pc.category_name`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/categories', async (req, res) => {
  const { category_name, description, min_price, max_price } = req.body;
  if (!category_name) return res.status(400).json({ error: 'Category name required.' });
  try {
    await db.query(
      `INSERT INTO Player_Category (category_name, min_price, max_price) VALUES (?, ?, ?)`,
      [category_name, min_price || 0, max_price || 999999999]
    );
    res.json({ message: 'Category created.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/categories/:id', async (req, res) => {
  const { category_name, min_price, max_price } = req.body;
  try {
    await db.query(
      `UPDATE Player_Category SET category_name = ?, min_price = ?, max_price = ? WHERE category_id = ?`,
      [category_name, min_price || 0, max_price || 999999999, req.params.id]
    );
    res.json({ message: 'Category updated.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Player_Category WHERE category_id = ?', [req.params.id]);
    res.json({ message: 'Deleted.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── COUNTRIES ─────────────────────────────────────────────────
router.get('/countries', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*,
              COALESCE(c.country_code, c.region, '') AS country_code,
              (SELECT COUNT(*) FROM Players p WHERE p.country_id = c.country_id) AS player_count
       FROM Countries c ORDER BY c.country_name`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/countries', async (req, res) => {
  const { country_name, country_code } = req.body;
  if (!country_name) return res.status(400).json({ error: 'Country name required.' });
  try {
    // Try inserting with country_code; fall back to region if column doesn't exist
    try {
      await db.query('INSERT INTO Countries (country_name, region, country_code) VALUES (?, ?, ?)', [country_name, country_code, country_code]);
    } catch (e) {
      await db.query('INSERT INTO Countries (country_name, region) VALUES (?, ?)', [country_name, country_code]);
    }
    res.json({ message: 'Country added.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/countries/:id', async (req, res) => {
  const { country_name, country_code } = req.body;
  try {
    try {
      await db.query('UPDATE Countries SET country_name = ?, region = ?, country_code = ? WHERE country_id = ?', [country_name, country_code, country_code, req.params.id]);
    } catch (e) {
      await db.query('UPDATE Countries SET country_name = ?, region = ? WHERE country_id = ?', [country_name, country_code, req.params.id]);
    }
    res.json({ message: 'Country updated.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/countries/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Countries WHERE country_id = ?', [req.params.id]);
    res.json({ message: 'Deleted.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── AUCTIONS / SEASONS ────────────────────────────────────────
router.get('/auctions', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*,
              COALESCE(a.location, a.venue, '') AS location,
              (SELECT COUNT(*) FROM Auction_Pool ap WHERE ap.auction_id = a.auction_id) AS players_in_pool
       FROM Auction a ORDER BY a.season DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/auctions', async (req, res) => {
  const { auction_name, season, auction_date, location, total_budget_per_team, status, description } = req.body;
  if (!season) return res.status(400).json({ error: 'Season required.' });
  try {
    const yr = parseInt(season) || new Date().getFullYear();
    const dt = auction_date || `${yr}-01-01`;
    await db.query(
      `INSERT INTO Auction (auction_name, season, auction_date, venue, location, total_budget_per_team, status, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        auction_name || `Auction ${yr}`,
        yr,
        dt,
        location || null,
        location || null,
        total_budget_per_team || null,
        status || 'upcoming',
        description || null,
      ]
    );
    res.json({ message: 'Season created.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/auctions/:id', async (req, res) => {
  const { auction_name, season, auction_date, location, total_budget_per_team, status, description } = req.body;
  try {
    const yr = parseInt(season) || new Date().getFullYear();
    const dt = auction_date || `${yr}-01-01`;
    await db.query(
      `UPDATE Auction
       SET auction_name = ?, season = ?, auction_date = ?, venue = ?, location = ?, total_budget_per_team = ?, status = ?, description = ?
       WHERE auction_id = ?`,
      [
        auction_name || `Auction ${yr}`,
        yr,
        dt,
        location || null,
        location || null,
        total_budget_per_team || null,
        status || 'upcoming',
        description || null,
        req.params.id,
      ]
    );
    res.json({ message: 'Season updated.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/auctions/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Auction WHERE auction_id = ?', [req.params.id]);
    res.json({ message: 'Deleted.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
