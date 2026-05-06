import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';
import { auctionTimers } from '../state.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename:    (req, file, cb) => { const ext = path.extname(file.originalname); cb(null, `${file.fieldname}_${Date.now()}${ext}`); }
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

const router = Router();
router.use(verifyToken);
router.use((req, res, next) => {
  if (req.user.role !== 'Franchise') return res.status(403).json({ error: 'Franchise access only.' });
  next();
});

router.get('/my-team', async (req, res) => {
  try {
    const team_id = req.user.team_id;
    if (!team_id) return res.status(404).json({ error: 'No team assigned.' });
    const [rows] = await db.query('SELECT * FROM Teams WHERE team_id = ?', [team_id]);
    if (!rows.length) return res.status(404).json({ error: 'Team not found.' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/my-team', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'owner_image', maxCount: 1 }]), async (req, res) => {
  const team_id = req.user.team_id;
  if (!team_id) return res.status(403).json({ error: 'No team assigned.' });
  try {
    const { team_name, city, home_ground, owner_name } = req.body;
    const logoFile       = req.files?.logo?.[0];
    const ownerImageFile = req.files?.owner_image?.[0];
    let updates = []; let values = [];
    if (team_name)   { updates.push('team_name = ?');      values.push(team_name); }
    if (city)        { updates.push('city = ?');            values.push(city); }
    if (home_ground) { updates.push('home_ground = ?');     values.push(home_ground); }
    if (owner_name)  { updates.push('owner_name = ?');      values.push(owner_name); }
    if (logoFile)    { updates.push('logo_url = ?');        values.push(`/uploads/${logoFile.filename}`); }
    if (ownerImageFile) { updates.push('owner_image_url = ?'); values.push(`/uploads/${ownerImageFile.filename}`); }
    if (!updates.length) return res.status(400).json({ error: 'Nothing to update.' });
    values.push(team_id);
    await db.query(`UPDATE Teams SET ${updates.join(', ')} WHERE team_id = ?`, values);
    const [rows] = await db.query('SELECT * FROM Teams WHERE team_id = ?', [team_id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

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
       WHERE ps.team_id = ? ORDER BY p.role, p.name`,
      [team_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/bid-log', async (req, res) => {
  try {
    const team_id = req.user.team_id;
    if (!team_id) return res.json([]);
    const [rows] = await db.query(
      `SELECT b.bid_id, b.bid_amount, b.bid_time, p.name AS player_name, p.image_url
       FROM Bids b JOIN Players p ON b.player_id = p.player_id
       WHERE b.team_id = ? ORDER BY b.bid_time DESC LIMIT 15`,
      [team_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/bid', async (req, res) => {
  const { player_id, auction_id, bid_amount } = req.body;
  const team_id = req.user.team_id;
  if (!team_id) return res.status(403).json({ error: 'No team assigned to your account.' });
  if (!player_id || !auction_id || !bid_amount) return res.status(400).json({ error: 'Missing fields.' });
  const conn = await db.getConnection();
  try {
    const [teamInfo] = await conn.query('SELECT remaining_budget, team_name, logo_url FROM Teams WHERE team_id = ?', [team_id]);
    const [squadInfo] = await conn.query('SELECT COUNT(*) as squadSize FROM Team_Squad WHERE team_id = ?', [team_id]);
    const remainingBudget   = Number(teamInfo[0]?.remaining_budget || 0);
    const teamName          = teamInfo[0]?.team_name || 'Unknown';
    const teamLogo          = teamInfo[0]?.logo_url || null;
    const currentSquadSize  = Number(squadInfo[0]?.squadSize || 0);
    const neededPlayers     = Math.max(0, 16 - currentSquadSize - 1);
    const minimumReserve    = neededPlayers * 25000;
    if (remainingBudget - bid_amount < minimumReserve) {
      conn.release();
      return res.status(400).json({ error: `Budget Danger: You must reserve at least ₨${minimumReserve.toLocaleString()} for the remaining ${neededPlayers} mandatory squad slots.` });
    }
    await conn.beginTransaction();
    await conn.query('CALL Place_Bid(?, ?, ?, ?)', [player_id, team_id, auction_id, bid_amount]);
    await conn.query(`UPDATE Auction_Pool SET current_bid = ?, highest_bidder_id = ? WHERE player_id = ? AND auction_id = ? AND status = 'active'`, [bid_amount, team_id, player_id, auction_id]);
    await conn.commit();
    if (auctionTimers[auction_id]) {
      auctionTimers[auction_id].timeLeft = 60;
      auctionTimers[auction_id].highestBid = bid_amount;
      auctionTimers[auction_id].highestBidder = { team_id, team_name: teamName, team_logo: teamLogo };
    }
    const io = req.app.get('io');
    const highestBidderObj = { team_id, team_name: teamName, team_logo: teamLogo };
    if (io) {
      io.to(`auction_${auction_id}`).emit('bid_updated', { player_id, highestBid: bid_amount, highestBidder: highestBidderObj, amount: bid_amount });
      io.to(`auction_${auction_id}`).emit('timer_update', { timeLeft: 60, isActive: true });
    }
    res.json({ message: 'Bid placed!', success: true });
  } catch (err) {
    if (conn) await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally { if (conn) conn.release(); }
});

router.get('/wishlist', async (req, res) => {
  try {
    const team_id = req.user.team_id;
    if (!team_id) return res.json([]);
    const [rows] = await db.query(
      `SELECT p.*, c.country_name, c.country_code, pc.category_name, w.max_bid, w.priority
       FROM Wishlist w JOIN Players p ON w.player_id = p.player_id
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

router.patch('/wishlist/max-bid', async (req, res) => {
  const { player_id, max_bid } = req.body;
  const team_id = req.user.team_id;
  if (!team_id || !player_id) return res.status(400).json({ error: 'Missing data.' });
  try {
    await db.query('UPDATE Wishlist SET max_bid = ? WHERE player_id = ? AND team_id = ?', [max_bid || null, player_id, team_id]);
    res.json({ message: 'Max bid updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/wishlist/priority', async (req, res) => {
  const { player_id, priority } = req.body;
  const team_id = req.user.team_id;
  if (!team_id || !player_id || !priority) return res.status(400).json({ error: 'Missing data.' });
  try {
    await db.query('UPDATE Wishlist SET priority = ? WHERE player_id = ? AND team_id = ?', [priority, player_id, team_id]);
    res.json({ message: 'Priority updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/pool', async (req, res) => {
  try {
    const team_id = req.user.team_id;
    const [rows] = await db.query(
      `SELECT ap.*, p.name, p.role, p.base_price, p.image_url, c.country_name, c.country_code, pc.category_name,
              (SELECT COUNT(*) FROM Wishlist WHERE player_id = p.player_id AND team_id = ?) as is_wishlisted,
              (SELECT priority FROM Wishlist WHERE player_id = p.player_id AND team_id = ?) as wishlist_priority
       FROM Auction_Pool ap JOIN Players p ON ap.player_id = p.player_id
       LEFT JOIN Countries c ON p.country_id = c.country_id
       LEFT JOIN Player_Category pc ON p.category_id = pc.category_id
       ORDER BY ap.lot_number`,
      [team_id, team_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/competitors', async (req, res) => {
  try {
    const my_team_id = req.user.team_id;
    const [teams] = await db.query(`SELECT team_id, team_name, total_budget, remaining_budget, logo_url FROM Teams WHERE team_id != ?`, [my_team_id || 0]);
    const [squads] = await db.query(`SELECT ps.team_id, p.role, COUNT(*) as count FROM Player_Sale ps JOIN Players p ON ps.player_id = p.player_id GROUP BY ps.team_id, p.role`);
    const result = teams.map(team => {
      const teamSquadInfo = squads.filter(s => s.team_id === team.team_id);
      const squadByRole = {};
      let totalSquadSize = 0;
      teamSquadInfo.forEach(info => { const role = info.role || 'Unassigned'; squadByRole[role] = info.count; totalSquadSize += info.count; });
      return { ...team, squadSize: totalSquadSize, squadByRole };
    });
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/squad-stats', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT t.team_id, t.team_name, t.logo_url, COUNT(ps.sale_id) as count FROM Teams t LEFT JOIN Player_Sale ps ON t.team_id = ps.team_id GROUP BY t.team_id, t.team_name, t.logo_url`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/recently-sold', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT p.name, p.role, ps.final_price as amount, t.team_name, t.logo_url as team_logo FROM Player_Sale ps JOIN Players p ON ps.player_id = p.player_id JOIN Teams t ON ps.team_id = t.team_id ORDER BY ps.sale_id DESC LIMIT 10`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/live-status', async (req, res) => {
  try {
    const [auctions] = await db.query('SELECT * FROM Auction ORDER BY auction_id DESC LIMIT 1');
    const auction = auctions[0];
    if (!auction) return res.json({ auction: null, current_player: null });
    const [players] = await db.query(
      `SELECT p.*, ap.pool_id, ap.current_bid, ap.highest_bidder_id, pc.category_name, c.country_name, c.country_code
       FROM Auction_Pool ap JOIN Players p ON ap.player_id = p.player_id
       LEFT JOIN Player_Category pc ON p.category_id = pc.category_id
       LEFT JOIN Countries c ON p.country_id = c.country_id
       WHERE ap.auction_id = ? AND ap.status = 'active' LIMIT 1`,
      [auction.auction_id]
    );
    res.json({ auction, current_player: players[0] || null });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
