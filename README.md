## Cricket Auction OS - Production Ready

Your application is running clean and ready!

### Project Structure
```
/vercel/share/v0-project/
├── src/
│   ├── pages/              (App pages - Login, Admin, Franchise, Super Admin)
│   ├── components/         (React components)
│   │   ├── animations/     (Framer Motion animated components)
│   │   └── ui/             (UI building blocks)
│   ├── lib/                (Utilities - API, Auth, Socket, Formatting)
│   ├── hooks/              (Custom React hooks)
│   ├── App.tsx             (Main app router)
│   ├── main.tsx            (React entry point)
│   └── index.css           (Global styles + Tailwind)
├── public/                 (Static assets)
├── package.json            (Dependencies)
├── vite.config.ts          (Vite build config)
├── tsconfig.json           (TypeScript config)
├── tailwind.config.ts      (Tailwind CSS config)
└── index.html              (HTML template)
```

### What's Inside
- **Pages**: Login, Admin Dashboard, Live Auction, Players, Pool, Teams (Admin + Franchise views)
- **Animations**: Staggered cards, animated numbers, page transitions, timer glows
- **Real-time**: Socket.io integration for live bidding
- **Styling**: Tailwind CSS with premium dark theme (blue/gold/purple)
- **Components**: 60+ UI components with shadcn/ui foundation

### Running the Project
```bash
cd /vercel/share/v0-project
pnpm run dev          # Start dev server (http://localhost:5173)
pnpm run build        # Build for production
pnpm run preview      # Preview built version
```

### Key Features
✅ Premium animations with Framer Motion
✅ Real-time bidding with Socket.io
✅ Multiple user roles (Admin, Franchise, Super Admin)
✅ Advanced UI with smooth transitions
✅ No unnecessary files or bloat
✅ Production-grade code structure

The project is clean, fast, and ready for deployment!
