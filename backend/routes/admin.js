const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const multer  = require('multer');
const path    = require('path');
const db      = require('../db');
const { verifyToken } = require('../middleware/auth');

// ── Multer setup ──────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|mov|avi|mkv|webm/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Invalid file type'));
  }
});

// ── Middleware ────────────────────────────────────────────────
router.use(verifyToken);
router.use((req, res, next) => {
  if (!['Admin', 'Super Admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
});

// ── DASHBOARD STATS ───────────────────────────────────────────
router.get('/dashboard-stats', async (req, res) => {
  try {
    const [[{ total_teams }]]    = await db.query('SELECT COUNT(*) AS total_teams FROM Teams');
    const [[{ total_players }]]  = await db.query('SELECT COUNT(*) AS total_players FROM Players');
    const [[{ sold_players }]]   = await db.query("SELECT COUNT(*) AS sold_players FROM Players WHERE status = 'sold'");
    const [[{ unsold_players }]] = await db.query("SELECT COUNT(*) AS unsold_players FROM Players WHERE status = 'unsold'");
    const [[{ total_bids }]]     = await db.query('SELECT COUNT(*) AS total_bids FROM Bids');
    const [[{ total_spent }]]    = await db.query('SELECT COALESCE(SUM(final_price), 0) AS total_spent FROM Player_Sale');
    res.json({ total_teams, total_players, sold_players, unsold_players, total_bids, total_spent });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── RECENT LOG ────────────────────────────────────────────────
router.get('/recent-log', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT al.*, p.name AS player_name, t.team_name
       FROM Auction_Log al
       LEFT JOIN Players p ON al.player_id = p.player_id
       LEFT JOIN Teams t   ON al.team_id   = t.team_id
       ORDER BY al.log_time DESC LIMIT 20`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── TEAMS ─────────────────────────────────────────────────────
router.get('/teams', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT t.*, u.username, u.email
       FROM Teams t LEFT JOIN Users u ON t.user_id = u.user_id
       ORDER BY t.team_name`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/teams', async (req, res) => {
  const { team_name, city, home_ground, total_budget, owner_name, username, email, password } = req.body;
  if (!team_name || !username || !email || !password) return res.status(400).json({ error: 'Required fields missing.' });
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const hash = await bcrypt.hash(password, 12);
    const [uRes] = await conn.query(
      `INSERT INTO Users (username, email, password_hash, role_id) VALUES (?, ?, ?, 3)`,
      [username, email, hash]
    );
    const userId = uRes.insertId;
    const budget = Number(total_budget) || 95000000;
    await conn.query(
      `INSERT INTO Teams (team_name, city, home_ground, total_budget, remaining_budget, owner_name, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [team_name, city, home_ground, budget, budget, owner_name, userId]
    );
    await conn.commit();
    res.json({ message: `Team "${team_name}" created.` });
  } catch (err) { await conn.rollback(); res.status(500).json({ error: err.message }); }
  finally { conn.release(); }
});

router.put('/teams/:id', async (req, res) => {
  const { team_name, city, home_ground, total_budget, owner_name } = req.body;
  try {
    await db.query(
      `UPDATE Teams SET team_name = ?, city = ?, home_ground = ?, total_budget = ?, owner_name = ? WHERE team_id = ?`,
      [team_name, city, home_ground, total_budget, owner_name, req.params.id]
    );
    res.json({ message: 'Team updated.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/teams/:id', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[team]] = await conn.query('SELECT user_id FROM Teams WHERE team_id = ?', [req.params.id]);
    await conn.query('DELETE FROM Teams WHERE team_id = ?', [req.params.id]);
    if (team?.user_id) {
      await conn.query('DELETE FROM Users WHERE user_id = ?', [team.user_id]);
    }
    await conn.commit();
    res.json({ message: 'Team deleted.' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

router.get('/team-squad/:teamId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, ps.final_price, c.country_name, pc.category_name
       FROM Player_Sale ps
       JOIN Players p ON ps.player_id = p.player_id
       LEFT JOIN Countries c ON p.country_id = c.country_id
       LEFT JOIN Player_Category pc ON p.category_id = pc.category_id
       WHERE ps.team_id = ?
       ORDER BY p.name`,
      [req.params.teamId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PLAYERS ───────────────────────────────────────────────────
router.get('/players', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, pc.category_name, c.country_name,
              st.matches, st.runs_scored, st.wickets, st.avg_score, st.strike_rate
       FROM Players p
       LEFT JOIN Player_Category pc ON p.category_id = pc.category_id
       LEFT JOIN Countries c        ON p.country_id  = c.country_id
       LEFT JOIN Player_Stats st    ON p.player_id   = st.player_id
       ORDER BY p.player_id DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/players/available', async (req, res) => {
  const { auction_id } = req.query;
  try {
    const exclude = auction_id
      ? `AND p.player_id NOT IN (SELECT player_id FROM Auction_Pool WHERE auction_id = ${db.escape(auction_id)})`
      : '';
    const [rows] = await db.query(
      `SELECT p.player_id, p.name, p.role, p.base_price, pc.category_name
       FROM Players p
       LEFT JOIN Player_Category pc ON p.category_id = pc.category_id
       WHERE p.status = 'unsold' ${exclude}
       ORDER BY p.name`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/players', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
  const { name, age, role, base_price, country_id, category_id, batting_style, bowling_style, matches, runs_scored, wickets, avg_score, strike_rate } = req.body;
  if (!name || !base_price) return res.status(400).json({ error: 'Name and base price required.' });
  const imageUrl = req.files?.image?.[0] ? `/uploads/${req.files.image[0].filename}` : null;
  const videoUrl = req.files?.video?.[0] ? `/uploads/${req.files.video[0].filename}` : null;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [pRes] = await conn.query(
      `INSERT INTO Players (name, age, role, base_price, country_id, category_id, batting_style, bowling_style, image_url, video_url, added_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, age || null, role, base_price, country_id || null, category_id || null, batting_style || null, bowling_style || null, imageUrl, videoUrl, req.user.user_id]
    );
    const pId = pRes.insertId;
    await conn.query(
      `INSERT INTO Player_Stats (player_id, matches, runs_scored, wickets, avg_score, strike_rate) VALUES (?, ?, ?, ?, ?, ?)`,
      [pId, matches || 0, runs_scored || 0, wickets || 0, avg_score || 0, strike_rate || 0]
    );
    await conn.commit();
    res.json({ message: 'Player added.' });
  } catch (err) { await conn.rollback(); res.status(500).json({ error: err.message }); }
  finally { conn.release(); }
});

router.put('/players/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
  const { name, age, role, base_price, country_id, category_id, batting_style, bowling_style, matches, runs_scored, wickets, avg_score, strike_rate } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    let imageUpdate = '';
    let videoUpdate = '';
    const imageUrl = req.files?.image?.[0] ? `/uploads/${req.files.image[0].filename}` : null;
    const videoUrl = req.files?.video?.[0] ? `/uploads/${req.files.video[0].filename}` : null;

    await conn.query(
      `UPDATE Players SET name=?, age=?, role=?, base_price=?, country_id=?, category_id=?, batting_style=?, bowling_style=?
       ${imageUrl ? ', image_url=?' : ''}
       ${videoUrl ? ', video_url=?' : ''}
       WHERE player_id=?`,
      [name, age || null, role, base_price, country_id || null, category_id || null, batting_style || null, bowling_style || null,
       ...(imageUrl ? [imageUrl] : []), ...(videoUrl ? [videoUrl] : []), req.params.id]
    );

    await conn.query(
      `INSERT INTO Player_Stats (player_id, matches, runs_scored, wickets, avg_score, strike_rate)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE matches=VALUES(matches), runs_scored=VALUES(runs_scored),
       wickets=VALUES(wickets), avg_score=VALUES(avg_score), strike_rate=VALUES(strike_rate)`,
      [req.params.id, matches || 0, runs_scored || 0, wickets || 0, avg_score || 0, strike_rate || 0]
    );
    await conn.commit();
    res.json({ message: 'Player updated.' });
  } catch (err) { await conn.rollback(); res.status(500).json({ error: err.message }); }
  finally { conn.release(); }
});

router.delete('/players/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Players WHERE player_id = ?', [req.params.id]);
    res.json({ message: 'Player deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/players/:id/withdraw', async (req, res) => {
  try {
    await db.query(`UPDATE Players SET status = 'withdrawn' WHERE player_id = ? AND status = 'unsold'`, [req.params.id]);
    await db.query(`INSERT INTO Auction_Log (action, player_id) VALUES ('WITHDRAW', ?)`, [req.params.id]);
    res.json({ message: 'Player withdrawn.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── BIDS ──────────────────────────────────────────────────────
router.get('/bids/:playerId', async (req, res) => {
  const { auction_id } = req.query;
  try {
    const [rows] = await db.query(
      `SELECT b.*, t.team_name FROM Bids b
       JOIN Teams t ON b.team_id = t.team_id
       WHERE b.player_id = ? ${auction_id ? 'AND b.auction_id = ?' : ''}
       ORDER BY b.bid_amount DESC LIMIT 30`,
      auction_id ? [req.params.playerId, auction_id] : [req.params.playerId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── AUCTION POOL ──────────────────────────────────────────────
router.get('/auction-pool', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ap.*, p.name, p.role, p.base_price, pc.category_name
       FROM Auction_Pool ap
       JOIN Players p ON ap.player_id = p.player_id
       LEFT JOIN Player_Category pc ON p.category_id = pc.category_id
       ORDER BY ap.auction_id DESC, ap.lot_number ASC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/auction-pool', async (req, res) => {
  const { player_id, auction_id } = req.body;
  if (!player_id || !auction_id) return res.status(400).json({ error: 'player_id and auction_id required.' });
  try {
    const [[{ maxLot }]] = await db.query('SELECT COALESCE(MAX(lot_number), 0) AS maxLot FROM Auction_Pool WHERE auction_id = ?', [auction_id]);
    await db.query(`INSERT INTO Auction_Pool (auction_id, player_id, lot_number) VALUES (?, ?, ?)`, [auction_id, player_id, maxLot + 1]);
    res.json({ message: 'Player added to auction pool.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/auction-pool/:id', async (req, res) => {
  try {
    await db.query(`DELETE FROM Auction_Pool WHERE pool_id = ? AND status = 'waiting'`, [req.params.id]);
    res.json({ message: 'Removed from pool.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── LIVE CONTROL ──────────────────────────────────────────────
router.get('/live-status', async (req, res) => {
  try {
    const [auctions] = await db.query('SELECT * FROM Auction ORDER BY auction_id DESC LIMIT 1');
    const auction = auctions[0];
    if (!auction) return res.json({ auction: null, current_player: null });

    const [players] = await db.query(
      `SELECT p.*, ap.pool_id, ap.current_bid, ap.highest_bidder_id,
              pc.category_name, c.country_name
       FROM Auction_Pool ap
       JOIN Players p ON ap.player_id = p.player_id
       LEFT JOIN Player_Category pc ON p.category_id = pc.category_id
       LEFT JOIN Countries c ON p.country_id = c.country_id
       WHERE ap.auction_id = ? AND ap.status = 'active'
       LIMIT 1`,
      [auction.auction_id]
    );
    res.json({ auction, current_player: players[0] || null });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/next-player', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [auctions] = await conn.query('SELECT auction_id FROM Auction ORDER BY auction_id DESC LIMIT 1');
    if (!auctions.length) throw new Error('No auction season found.');
    const auction_id = auctions[0].auction_id;

    // Mark current active as processed
    const [active] = await conn.query(`SELECT pool_id, player_id FROM Auction_Pool WHERE auction_id = ? AND status = 'active'`, [auction_id]);
    if (active.length > 0) {
      await conn.query(`UPDATE Auction_Pool SET status = 'processed' WHERE pool_id = ?`, [active[0].pool_id]);
      const [bids] = await conn.query(`SELECT COUNT(*) AS cnt FROM Bids WHERE player_id = ? AND auction_id = ?`, [active[0].player_id, auction_id]);
      if (bids[0].cnt === 0) {
        await conn.query(`UPDATE Players SET status = 'unsold' WHERE player_id = ?`, [active[0].player_id]);
        await conn.query(`INSERT INTO Auction_Log (action, player_id, auction_id) VALUES ('UNSOLD', ?, ?)`, [active[0].player_id, auction_id]);
      }
    }

    // Get next waiting player
    const [next] = await conn.query(
      `SELECT pool_id, player_id FROM Auction_Pool WHERE auction_id = ? AND status = 'waiting' ORDER BY lot_number ASC LIMIT 1`,
      [auction_id]
    );
    if (next.length === 0) {
      await conn.commit();
      return res.json({ message: 'No more players in pool.', done: true });
    }

    const { pool_id, player_id } = next[0];
    const [[player]] = await conn.query('SELECT base_price FROM Players WHERE player_id = ?', [player_id]);
    await conn.query(`UPDATE Auction_Pool SET status = 'active', current_bid = ? WHERE pool_id = ?`, [player.base_price, pool_id]);
    await conn.query(`UPDATE Players SET status = 'in-auction' WHERE player_id = ?`, [player_id]);

    await conn.commit();
    res.json({ message: 'Next player set.' });
  } catch (err) { await conn.rollback(); res.status(500).json({ error: err.message }); }
  finally { conn.release(); }
});

router.post('/sell-player', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [auctions] = await conn.query('SELECT * FROM Auction ORDER BY auction_id DESC LIMIT 1');
    if (!auctions.length) throw new Error('No auction season.');
    const auction = auctions[0];

    const [actives] = await conn.query(`SELECT * FROM Auction_Pool WHERE auction_id = ? AND status = 'active'`, [auction.auction_id]);
    if (!actives.length) throw new Error('No active player.');
    const active = actives[0];
    if (!active.highest_bidder_id) throw new Error('No bids placed yet.');

    await conn.query(`CALL Sell_Player(?, ?, ?, ?, ?)`, [active.player_id, active.highest_bidder_id, auction.auction_id, active.current_bid, auction.season]);
    await conn.commit();
    res.json({ message: 'Player sold!' });
  } catch (err) { await conn.rollback(); res.status(500).json({ error: err.message }); }
  finally { conn.release(); }
});

router.post('/reauction/:playerId', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [auctions] = await conn.query('SELECT auction_id FROM Auction ORDER BY auction_id DESC LIMIT 1');
    if (!auctions.length) throw new Error('No auction season.');
    const auction_id = auctions[0].auction_id;

    // Mark current active as waiting again to re-pool at end
    await conn.query(`UPDATE Auction_Pool SET status = 'waiting', current_bid = NULL, highest_bidder_id = NULL WHERE player_id = ? AND auction_id = ? AND status = 'active'`, [req.params.playerId, auction_id]);
    await conn.query(`UPDATE Players SET status = 'unsold' WHERE player_id = ?`, [req.params.playerId]);
    await conn.query(`DELETE FROM Bids WHERE player_id = ? AND auction_id = ?`, [req.params.playerId, auction_id]);
    await conn.query(`INSERT INTO Auction_Log (action, player_id, auction_id) VALUES ('REAUCTION', ?, ?)`, [req.params.playerId, auction_id]);

    await conn.commit();
    res.json({ message: 'Player re-auctioned.' });
  } catch (err) { await conn.rollback(); res.status(500).json({ error: err.message }); }
  finally { conn.release(); }
});

// ── AUCTION LOG ───────────────────────────────────────────────
router.get('/auction-log', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT al.*, p.name AS player_name, t.team_name, a.season
       FROM Auction_Log al
       LEFT JOIN Players p ON al.player_id = p.player_id
       LEFT JOIN Teams t   ON al.team_id   = t.team_id
       LEFT JOIN Auction a ON al.auction_id = a.auction_id
       ORDER BY al.log_time DESC LIMIT 500`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
