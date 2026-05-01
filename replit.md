# PSL Live Cricket Auction Platform

A real-time auction management system for cricket. Role-based access (Super Admin, Admin, Franchise), live bidding via Socket.io, player image/video uploads, 15-second countdown timer, ICC broadcast-style player stats overlay, full auction control.

## Architecture

- **Backend**: Node.js + Express + Socket.io — port 8000 (console workflow)
- **Frontend**: Next.js (App Router, JSX only) + Tailwind + Framer Motion — port 5000 (webview)
- **Database**: MySQL 8.x (hosted on Railway) — database: `Auction_DB`
- **Auth**: JWT + bcryptjs (custom role-based auth, tokens stored in localStorage)
- **Uploads**: Multer → `backend/uploads/` (served as static, proxied via Next.js rewrite)

## Design System

- **Light mode** with 3-color palette:
  - `--cream` (#F7F5F0) — background
  - `--navy` (#1C1C2E) — sidebar, headings, primary buttons
  - `--gold` (#C9940A) — accent, bid highlights, icons
- **Icons**: Phosphor Icons (`@phosphor-icons/react`)
- **Animations**: Framer Motion throughout (page transitions, modals, stats overlay)

## Workflows

- `Backend API` — `cd backend && PORT=8000 node server.js` (console, port 8000)
- `Start application` — `cd frontend && npm run dev -- --port 5000` (webview, port 5000)

## Environment Variables & Secrets

| Key         | Where     | Notes                                    |
|-------------|-----------|------------------------------------------|
| DB_HOST     | shared    | switchyard.proxy.rlwy.net                |
| DB_PORT     | shared    | 45954                                    |
| DB_USER     | shared    | root                                     |
| DB_NAME     | shared    | Auction_DB                               |
| JWT_SECRET  | shared    | ipl_auction_jwt_secret_2024_replit_secure_key |
| DB_PASSWORD | secret    | Railway MySQL password                   |

## Database Connection (Railway MySQL)

The backend uses `mysql2` connecting to a Railway-hosted MySQL instance. The `db.js` creates a pool using env vars. Connection verified on startup.

## Default Logins (after DB import)

| Username   | Password  | Role        |
|------------|-----------|-------------|
| superadmin | admin123  | Super Admin |
| admin      | admin123  | Admin       |
| (franchise)| set by admin | Franchise |

## Frontend Routes (Next.js App Router, JSX)

| Route                         | Access            | Description                            |
|-------------------------------|-------------------|----------------------------------------|
| `/`                          | Public            | Login page                             |
| `/super-admin`               | Super Admin       | Overview stats                         |
| `/super-admin/users`         | Super Admin       | User management (CRUD + toggle active) |
| `/super-admin/categories`    | Super Admin       | Player category CRUD                   |
| `/super-admin/countries`     | Super Admin       | Country CRUD                           |
| `/super-admin/seasons`       | Super Admin       | Auction season CRUD                    |
| `/admin`                     | Admin, Super Admin| Dashboard + recent auction log         |
| `/admin/teams`               | Admin, Super Admin| Team management                        |
| `/admin/players`             | Admin, Super Admin| Player CRUD + image/video upload       |
| `/admin/pool`                | Admin, Super Admin| Auction pool management                |
| `/admin/live-auction`        | Admin, Super Admin| Live auction control panel             |
| `/franchise`                 | Franchise         | My squad overview                      |
| `/franchise/live-auction`    | Franchise         | Live bidding view                      |

## API Proxy (Next.js → Backend)

Configured in `frontend/next.config.ts`:
- `/api/*` → `http://localhost:8000/api/*`
- `/uploads/*` → `http://localhost:8000/uploads/*`
- Socket.io connects directly to port 8000 via `window.location.hostname:8000`

## Key Backend Endpoints

- `POST /api/auth/login` — JWT login
- `GET /api/admin/live-status` — current auction player
- `POST /api/admin/next-player` — advance to next player
- `POST /api/admin/sell-player` — sell current player to highest bidder
- `POST /api/admin/reauction/:id` — re-queue player
- `GET /api/admin/auction-pool` — get all pool entries
- `POST /api/franchise/bid` — place bid (`player_id`, `auction_id`, `bid_amount`)
- `GET/POST/PUT/DELETE /api/super-admin/auctions` — auction season CRUD

## Project Structure

```
backend/
  server.js           — Express + Socket.io (PORT=8000)
  db.js               — MySQL2 connection pool
  routes/
    auth.js           — POST /login, GET /me
    admin.js          — Admin API + Multer file uploads
    franchise.js      — Franchise API + bid placement
    superadmin.js     — Super Admin CRUD APIs
  uploads/            — Player images/videos (served as static)

frontend/
  app/
    layout.jsx        — Root layout + AuthProvider
    globals.css       — Design system (cream + navy + gold)
    page.jsx          — Login page
    lib/
      auth.jsx        — Auth context (JWT, localStorage)
      api.js          — Typed fetch helper with JWT header
      socket.js       — Socket.io client (connects to :8000)
    components/
      DashboardLayout.jsx    — Auth guard + animated main wrapper
      Sidebar.jsx            — Collapsible role-based navigation
      PlayerStatsOverlay.jsx — ICC-style animated player stats
      UI.jsx                 — StatCard, Modal, Field, Toast, etc.
    super-admin/
      page.jsx, users/, categories/, countries/, seasons/
    admin/
      page.jsx, teams/, players/, pool/, live-auction/
    franchise/
      page.jsx, live-auction/

database/
  auction_db_complete.sql  — Full schema, procedures, triggers
```

## Socket.io Events

- `join_auction(id)` — join auction room
- `admin_set_player({auction_id, player})` — broadcast new player
- `admin_start_clock(auction_id)` — start 15s countdown
- `franchise_bid({...})` — broadcast bid update
- Emitted: `bid_updated`, `timer_update`, `player_changed`, `auction_timeout`, `auction_sync`
