# Workspace

## Overview

pnpm workspace monorepo. Two main artifacts: `auction-os` (Vite + React frontend) and `api-server` (Express + Socket.IO backend). Together they form the Auction OS cricket auction platform.

## Architecture

### Frontend: `artifacts/auction-os`
- **Framework**: Vite + React (JSX)
- **Routing**: Wouter
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Animations**: Framer Motion
- **Icons**: @phosphor-icons/react
- **Toast**: react-hot-toast
- **Charts**: recharts
- **Scroll**: lenis
- **Socket**: socket.io-client
- **Image crop**: react-easy-crop
- **Auth**: JWT stored in localStorage via `AuthProvider` (lib/auth.jsx)

### Backend: `artifacts/api-server`
- **Framework**: Express 5 + Socket.IO
- **Database**: MySQL2 (requires external MySQL)
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **File uploads**: multer → `artifacts/api-server/uploads/`
- **Build**: esbuild (ESM bundle)

## Key Directory Structure

```
artifacts/
  auction-os/
    src/
      App.tsx               — wouter routes + AuthProvider + Toaster
      index.css             — Tailwind + custom utility classes
      lib/
        api.js              — apiFetch() wrapper
        auth.jsx            — AuthProvider, useAuth
        countries.js        — country data for autocomplete
        format.js           — formatCurrency, formatDate, cn()
        image.js            — getCroppedImg for react-easy-crop
        socket.js           — singleton socket.io-client
      components/
        UI.jsx              — full component library (Button, Input, Modal, Table, etc.)
        DashboardLayout.jsx — role-gated layout with Sidebar
        Sidebar.jsx         — role-aware nav links
        PlayerStatsOverlay.jsx — broadcast overlay for live auction
      pages/
        Login.jsx
        admin/
          Dashboard.jsx, Teams.jsx, Players.jsx, Pool.jsx, LiveAuction.jsx
        franchise/
          Dashboard.jsx, Competitors.jsx, Pool.jsx, LiveAuction.jsx, Profile.jsx
        super-admin/
          Overview.jsx, Users.jsx, Categories.jsx, Countries.jsx, Seasons.jsx
  api-server/
    src/
      app.ts        — Express + Socket.IO setup, timer logic
      index.ts      — httpServer.listen(PORT)
      db.js         — MySQL2 pool
      state.js      — in-memory auctionTimers
      middleware/
        auth.js     — verifyToken, pcbOnly, franchiseOnly
      routes/
        auth.js     — login, /me, update-profile
        admin.js    — teams, players, pool, live auction, stats
        franchise.js— my-team, squad, pool, wishlist, bids
        superadmin.js — users, categories, countries, auctions
```

## Roles & Routes
| Role | Default Landing | Access |
|------|----------------|--------|
| Super Admin | /super-admin | All pages |
| Admin | /admin | Admin + shared pages |
| Franchise | /franchise | Franchise pages only |

## Environment Variables (api-server)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — MySQL credentials
- `JWT_SECRET` — token signing secret
- `PORT` — server port (set by Replit workflow)

## Environment Variables (auction-os)
- `PORT` — Vite dev server port
- `BASE_PATH` — base URL path
- `API_PORT` — api-server port for Vite proxy (defaults to 3001)

## Vite Proxy
Frontend proxies `/api`, `/uploads`, and `/socket.io` → api-server (`localhost:$API_PORT`).

## Socket.IO Events
- Admin emits: `admin_start_clock`, `admin_set_player`
- Franchise emits: `franchise_bid`, `place_bid`
- Server broadcasts: `bid_updated`, `timer_update`, `player_changed`, `player_sold`, `auction_timeout`, `auction_started`, `auction_sync`
