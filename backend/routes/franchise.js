const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.use((req, res, next) => {
  if (req.user.role !== 'Franchise') return res.status(403).json({ error: 'Franchise access only.' });
  next();
});

// ── MY TEAM ───────────────────────────────────────────────────
router.get('/my-team', async (req, res) => {
  try {
    const team_id = req.user.team_id;
    if (!team_id) return res.status(404).json({ error: 'No team assigned.' });
    const [rows] = await db.query('SELECT * FROM Teams WHERE team_id = ?', [team_id]);
    if (!rows.length) return res.status(404).json({ error: 'Team not found.' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── MY SQUAD ──────────────────────────────────────────────────
router.get('/my-squad', async (req, res) => {
  try {
    const team_id = req.user.team_id;
    if (!team_id) return res.json([]);
    const [rows] = await db.query(
      `SELECT p.*, ps.final_price, c.country_name, c.country_code, pc.category_name
       FROM Player_Sale ps
       JOIN Players p ON ps.player_id = p.player_id
       LEFT JOIN Countries c ON p.country_id = c.country_id
       LEFT JOIN Player_Category pc ON p.category_id = pc.category_id
       WHERE ps.team_id = ?
       ORDER BY p.role, p.name`,
      [team_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PLACE BID ─────────────────────────────────────────────────
router.post('/bid', async (req, res) => {
  const { player_id, auction_id, bid_amount } = req.body;
  const team_id = req.user.team_id;
  if (!team_id) return res.status(403).json({ error: 'No team assigned to your account.' });
  if (!player_id || !auction_id || !bid_amount) return res.status(400).json({ error: 'Missing fields.' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Validate via stored procedure
    await conn.query('CALL Place_Bid(?, ?, ?, ?)', [player_id, team_id, auction_id, bid_amount]);

    // Update auction pool highest bidder
    await conn.query(
      `UPDATE Auction_Pool SET current_bid = ?, highest_bidder_id = ?
       WHERE player_id = ? AND auction_id = ? AND status = 'active'`,
      [bid_amount, team_id, player_id, auction_id]
    );

    await conn.commit();
    res.json({ message: 'Bid placed!' });
  } catch (err) { await conn.rollback(); res.status(400).json({ error: err.message }); }
  finally { conn.release(); }
});

module.exports = router;
