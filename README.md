# Cricket Auction OS

A full-stack auction management system for cricket leagues.

## Project Structure

```
├── artifacts/
│   ├── api-server/          # Backend (Express + MySQL)
│   │   ├── src/
│   │   │   ├── routes/      # API routes (auth, admin, franchise, superadmin)
│   │   │   ├── middleware/  # Auth middleware
│   │   │   ├── db.js        # Database connection
│   │   │   └── state.js     # Auction state management
│   │   └── package.json
│   │
│   └── auction-os/          # Frontend (React + Vite + Tailwind)
│       ├── src/
│       │   ├── pages/       # Login, Admin, Franchise, Super Admin pages
│       │   ├── components/  # React components + animations
│       │   └── lib/         # API, Auth, Socket utilities
│       └── package.json
│
└── package.json             # Root scripts
```

## Running the Project

### Frontend
```bash
cd artifacts/auction-os
pnpm install
pnpm dev
```

### Backend
```bash
cd artifacts/api-server
pnpm install
pnpm dev
```

## Environment Variables (Backend)

Create `.env` in `artifacts/api-server/`:

```env
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=auction_db
JWT_SECRET=your-secret-key
PORT=5000
```

## Features

- Multi-role authentication (Admin, Franchise, Super Admin)
- Live auction with real-time bidding (Socket.io)
- Player management and pool creation
- Team and franchise management
- Premium UI with Framer Motion animations
