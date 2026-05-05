const express = require('express');
const router  = express.Router();
const db      = require('../db');
const multer  = require('multer');
const path    = require('path');
const { verifyToken } = require('../middleware/auth');

// ── Multer (image upload) ──────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    ok ? cb(null, true) : cb(new Error('Images only'));
  }
});

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

// ── UPDATE PROFILE ────────────────────────────────────────────
router.put('/my-team', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'owner_image', maxCount: 1 }
]), async (req, res) => {
  const team_id = req.user.team_id;
  if (!team_id) return res.status(403).json({ error: 'No team assigned.' });

  try {
    const { team_name, city, home_ground, owner_name } = req.body;
    const logoFile       = req.files?.logo?.[0];
    const ownerImageFile = req.files?.owner_image?.[0];

    let updates = [];
    let values  = [];

    if (team_name)   { updates.push('team_name = ?');   values.push(team_name); }
    if (city)        { updates.push('city = ?');         values.push(city); }
    if (home_ground) { updates.push('home_ground = ?');  values.push(home_ground); }
    if (owner_name)  { updates.push('owner_name = ?');   values.push(owner_name); }
    if (logoFile)    { updates.push('logo_url = ?');     values.push(`/uploads/${logoFile.filename}`); }
    // owner_image stored in logo_url2 — add column if needed, for now use a separate approach
    if (ownerImageFile) { updates.push('owner_image_url = ?'); values.push(`/uploads/${ownerImageFile.filename}`); }

    if (!updates.length) return res.status(400).json({ error: 'Nothing to update.' });

    values.push(team_id);
    await db.query(`UPDATE Teams SET ${updates.join(', ')} WHERE team_id = ?`, values);

    const [rows] = await db.query('SELECT * FROM Teams WHERE team_id = ?', [team_id]);
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

// ── BID HISTORY ───────────────────────────────────────────────
router.get('/bid-log', async (req, res) => {
  try {
    const team_id = req.user.team_id;
    if (!team_id) return res.json([]);
    const [rows] = await db.query(
      `SELECT b.bid_id, b.bid_amount, b.bid_time, p.name AS player_name, p.image_url
       FROM Bids b
       JOIN Players p ON b.player_id = p.player_id
       WHERE b.team_id = ?
       ORDER BY b.bid_time DESC
       LIMIT 15`,
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
    // Minimum Purse Validator logic
    const [teamInfo] = await conn.query('SELECT remaining_budget FROM Teams WHERE team_id = ?', [team_id]);
    const [squadInfo] = await conn.query('SELECT COUNT(*) as squadSize FROM Team_Squad WHERE team_id = ?', [team_id]);
    
    const remainingBudget = Number(teamInfo[0]?.remaining_budget || 0);
    const currentSquadSize = Number(squadInfo[0]?.squadSize || 0);
    const neededPlayers = Math.max(0, 16 - currentSquadSize - 1); // We need 16 total. This bid is for 1.
    const minimumReserve = neededPlayers * 25000;
    
    if (remainingBudget - bid_amount < minimumReserve) {
      await conn.release();
      return res.status(400).json({ 
        error: `Budget Danger: You must reserve at least ₨${minimumReserve.toLocaleString()} for the remaining ${neededPlayers} mandatory squad slots.` 
      });
    }

    await conn.beginTransaction();
    await conn.query('CALL Place_Bid(?, ?, ?, ?)', [player_id, team_id, auction_id, bid_amount]);
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

// ── WISHLIST ──────────────────────────────────────────────────
router.get('/wishlist', async (req, res) => {
  try {
    const team_id = req.user.team_id;
    if (!team_id) return res.json([]);
    const [rows] = await db.query(
      `SELECT p.*, c.country_name, c.country_code, pc.category_name, w.max_bid, w.priority
       FROM Wishlist w
       JOIN Players p ON w.player_id = p.player_id
       LEFT JOIN Countries c ON p.country_id = c.country_id
       LEFT JOIN Player_Category pc ON p.category_id = pc.category_id
       WHERE w.team_id = ?`,
      [team_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/wishlist/toggle', async (req, res) => {
  const { player_id } = req.body;
  const team_id = req.user.team_id;
  if (!team_id || !player_id) return res.status(400).json({ error: 'Missing data.' });
  try {
    const [existing] = await db.query('SELECT * FROM Wishlist WHERE player_id = ? AND team_id = ?', [player_id, team_id]);
    if (existing.length) {
      await db.query('DELETE FROM Wishlist WHERE player_id = ? AND team_id = ?', [player_id, team_id]);
      res.json({ action: 'removed' });
    } else {
      await db.query('INSERT INTO Wishlist (player_id, team_id) VALUES (?, ?)', [player_id, team_id]);
      res.json({ action: 'added' });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Set max bid for a wishlist entry
router.patch('/wishlist/max-bid', async (req, res) => {
  const { player_id, max_bid } = req.body;
  const team_id = req.user.team_id;
  if (!team_id || !player_id) return res.status(400).json({ error: 'Missing data.' });
  try {
    await db.query(
      'UPDATE Wishlist SET max_bid = ? WHERE player_id = ? AND team_id = ?',
      [max_bid || null, player_id, team_id]
    );
    res.json({ message: 'Max bid updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── AUCTION POOL ──────────────────────────────────────────────
router.get('/pool', async (req, res) => {
  try {
    const team_id = req.user.team_id;
    const [rows] = await db.query(
      `SELECT ap.*, p.name, p.role, p.base_price, p.image_url, c.country_name, c.country_code, pc.category_name,
              (SELECT COUNT(*) FROM Wishlist WHERE player_id = p.player_id AND team_id = ?) as is_wishlisted,
              (SELECT priority FROM Wishlist WHERE player_id = p.player_id AND team_id = ?) as wishlist_priority
       FROM Auction_Pool ap
       JOIN Players p ON ap.player_id = p.player_id
       LEFT JOIN Countries c ON p.country_id = c.country_id
       LEFT JOIN Player_Category pc ON p.category_id = pc.category_id
       ORDER BY ap.lot_number`,
      [team_id, team_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update priority for a wishlist entry
router.patch('/wishlist/priority', async (req, res) => {
  const { player_id, priority } = req.body;
  const team_id = req.user.team_id;
  if (!team_id || !player_id || !priority) return res.status(400).json({ error: 'Missing data.' });
  try {
    await db.query(
      'UPDATE Wishlist SET priority = ? WHERE player_id = ? AND team_id = ?',
      [priority, player_id, team_id]
    );
    res.json({ message: 'Priority updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── COMPETITOR ANALYSIS ───────────────────────────────────────
router.get('/competitors', async (req, res) => {
  try {
    const my_team_id = req.user.team_id;
    // Get all teams
    const [teams] = await db.query(
      `SELECT team_id, team_name, total_budget, remaining_budget, logo_url 
       FROM Teams 
       WHERE team_id != ?`,
      [my_team_id || 0]
    );

    // Get squad counts by role for all teams
    const [squads] = await db.query(
      `SELECT ts.team_id, p.role, COUNT(*) as count
       FROM Team_Squad ts
       JOIN Players p ON ts.player_id = p.player_id
       GROUP BY ts.team_id, p.role`
    );

    // Group the squad counts into the teams array
    const result = teams.map(team => {
      const teamSquadInfo = squads.filter(s => s.team_id === team.team_id);
      const squadByRole = {};
      let totalSquadSize = 0;
      teamSquadInfo.forEach(info => {
        const role = info.role || 'Unassigned';
        squadByRole[role] = info.count;
        totalSquadSize += info.count;
      });
      return {
        ...team,
        squadSize: totalSquadSize,
        squadByRole
      };
    });

    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── AUCTION SEASONS ──────────────────────────────────────────
router.get('/auctions', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT auction_id, auction_name, season, status, description 
       FROM Auction ORDER BY season DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
