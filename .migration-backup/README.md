# Cricket Auction Management System

Real-time cricket auction platform — generic, no hardcoded data. Admin adds everything dynamically.

---

## Setup Status

| Step | Status |
|------|--------|
| Backend (Node.js + Express + Socket.io) | ✅ Done |
| Database schema (MySQL on Railway) | ✅ Done — SQL imported via CLI |
| Railway MySQL secrets in Replit | ⏳ Update 5 secrets (see below) |
| Frontend (React + Vite + Tailwind) | 🔨 Building |

---

## Replit Secrets Required

Railway → MySQL service → Variables tab:

| Replit Secret | Railway Variable |
|---|---|
| `DB_HOST` | `MYSQLHOST` |
| `DB_PORT` | `MYSQLPORT` |
| `DB_USER` | `MYSQLUSER` |
| `DB_PASSWORD` | `MYSQLPASSWORD` |
| `DB_NAME` | `MYSQLDATABASE` |
| `JWT_SECRET` | Already set ✅ |

---

## Default Logins

| Username | Password | Role |
|---|---|---|
| superadmin | admin123 | Super Admin |
| admin | admin123 | Admin |
| (franchise) | set by admin | Franchise |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express + Socket.io |
| Database | MySQL 8 on Railway |
| Auth | JWT + bcryptjs |
| Uploads | Multer (player images/videos) |

---

## Admin Flow (all dynamic — zero demo data)

1. **Super Admin** → Add Countries, Player Categories, Auction Seasons
2. **Admin** → Create Teams (franchise login auto-created), Add Players (image/video), Build Auction Pool, Run Live Auction
3. **Franchise** → Login, place real-time bids during live auction

---

## Project Structure

```
backend/
  server.js        — Express + Socket.io (port 5000)
  db.js            — MySQL2 pool (reads from Replit Secrets)
  .env             — PORT=5000 only
  setup_db.js      — One-time DB setup helper
  middleware/auth.js
  routes/
    auth.js        — POST /login, GET /me
    admin.js       — Players, Teams, Auction Pool, Live Control
    franchise.js   — My Team, My Squad, Place Bid
    superadmin.js  — Categories, Countries, Seasons, Users

frontend/
  src/
    App.jsx        — Routes + role-based protection
    context/AuthContext.jsx
    lib/api.js     — Axios with JWT interceptor
    components/    — Sidebar, Layout, Modal, StatCard, FormField
    pages/
      Login.jsx
      admin/       — Dashboard, Players, Teams, AuctionPool, LiveControl, AuctionLog
      franchise/   — LiveAuction, MySquad
      superadmin/  — Overview, Categories, Countries, Seasons

database/
  auction_db_complete.sql  — Full schema, stored procs, triggers, views (no demo data)
```

---

## Stored Procedures

| Procedure | Description |
|---|---|
| `Place_Bid` | Validates and records a bid |
| `Sell_Player` | Marks player sold, updates team budget |
| `Auto_Sell_Highest_Bidder` | Sells to current top bidder |
| `Reauction_Player` | Returns player to pool |
| `Transfer_Player` | Transfers player between teams |

---

## Real-Time Auction Flow

1. Super Admin creates an Auction Season
2. Admin registers Players and Teams (franchise accounts auto-created)
3. Admin adds players to Auction Pool
4. Franchise users join Live Auction page
5. Admin clicks "Next Player" → broadcasts to all
6. Admin clicks "Start Timer" → 15-second countdown
7. Franchises click bid buttons → bids broadcast live
8. Admin clicks "Sell Player" → sold, squad updated
9. Or "Re-Auction" → player returns to pool
