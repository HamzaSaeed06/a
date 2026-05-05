import express, { type Express } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Express + Socket.IO setup ─────────────────────────────────
const app: Express = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.set("io", io);

// ── Middleware ────────────────────────────────────────────────
app.use(pinoHttp({
  logger,
  serializers: {
    req(req) { return { id: req.id, method: req.method, url: req.url?.split("?")[0] }; },
    res(res) { return { statusCode: res.statusCode }; },
  },
}));
app.use(cors({ origin: "*", credentials: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static uploads ────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ── Routes (dynamic import to use ESM .js files) ─────────────
const { default: authRouter }       = await import("./routes/auth.js");
const { default: adminRouter }      = await import("./routes/admin.js");
const { default: franchiseRouter }  = await import("./routes/franchise.js");
const { default: superAdminRouter } = await import("./routes/superadmin.js");

app.use("/api/auth",        authRouter);
app.use("/api/admin",       adminRouter);
app.use("/api/franchise",   franchiseRouter);
app.use("/api/super-admin", superAdminRouter);

app.get("/", (_req, res) => res.json({ message: "🏏 Auction OS API is running!" }));

// ── Socket.IO logic ───────────────────────────────────────────
const { auctionTimers } = await import("./state.js");
const { default: db }   = await import("./db.js");

io.on("connection", (socket) => {
  logger.info({ id: socket.id }, "User connected");

  socket.on("join_auction", (auction_id: number) => {
    socket.join(`auction_${auction_id}`);
    if (auctionTimers[auction_id]) {
      socket.emit("auction_sync", {
        timeLeft:      auctionTimers[auction_id].timeLeft,
        isActive:      auctionTimers[auction_id].isActive,
        currentPlayer: auctionTimers[auction_id].currentPlayer,
        highestBid:    auctionTimers[auction_id].highestBid,
        highestBidder: auctionTimers[auction_id].highestBidder,
      });
    }
  });

  socket.on("place_bid", async (data: any) => {
    try {
      const { auction_id, player_id, team_id, amount } = data;
      await db.query("CALL Place_Bid(?, ?, ?, ?)", [player_id, team_id, auction_id, amount]);
      const [teams]: any = await db.query("SELECT team_name, logo_url FROM Teams WHERE team_id = ?", [team_id]);
      const team_name  = teams[0]?.team_name || "Unknown Team";
      const team_logo  = teams[0]?.logo_url  || null;
      if (auctionTimers[auction_id]) {
        auctionTimers[auction_id].timeLeft     = 60;
        auctionTimers[auction_id].highestBid   = amount;
        auctionTimers[auction_id].highestBidder = { team_id, team_name, team_logo };
      }
      const highestBidderObj = { team_id, team_name, team_logo };
      io.to(`auction_${auction_id}`).emit("bid_updated", { player_id, highestBid: amount, highestBidder: highestBidderObj, amount });
      io.to(`auction_${auction_id}`).emit("timer_update", { timeLeft: 60, isActive: true });
    } catch (err: any) {
      socket.emit("bid_error", { message: err.message });
    }
  });

  socket.on("franchise_bid", async (data: any) => {
    const { auction_id, player_id, team_id, amount } = data;
    const [teams]: any = await db.query("SELECT team_name, logo_url FROM Teams WHERE team_id = ?", [team_id]);
    const team_name = teams[0]?.team_name || "Unknown Team";
    const team_logo = teams[0]?.logo_url  || null;
    const highestBidderObj = { team_id, team_name, team_logo };
    if (auctionTimers[auction_id]) {
      auctionTimers[auction_id].timeLeft      = 60;
      auctionTimers[auction_id].highestBid    = amount;
      auctionTimers[auction_id].highestBidder = highestBidderObj;
    }
    io.to(`auction_${auction_id}`).emit("bid_updated", { player_id, highestBid: amount, highestBidder: highestBidderObj, amount });
    io.to(`auction_${auction_id}`).emit("timer_update", { timeLeft: 60, isActive: true });
  });

  socket.on("admin_start_clock", (auction_id: number) => {
    if (!auctionTimers[auction_id]) {
      auctionTimers[auction_id] = { timeLeft: 60, isActive: true, currentPlayer: null, highestBid: 0, highestBidder: null };
    } else {
      auctionTimers[auction_id].isActive = true;
    }
    startTimer(auction_id);
    io.to(`auction_${auction_id}`).emit("auction_started");
    io.to(`auction_${auction_id}`).emit("timer_update", { timeLeft: auctionTimers[auction_id].timeLeft, isActive: true });
  });

  socket.on("admin_set_player", (data: any) => {
    const { auction_id, player } = data;
    auctionTimers[auction_id] = { timeLeft: 60, isActive: false, currentPlayer: player, highestBid: Number(player.base_price), highestBidder: null };
    io.to(`auction_${auction_id}`).emit("player_changed", player);
    io.to(`auction_${auction_id}`).emit("timer_update", { timeLeft: 60, isActive: false });
  });
});

function startTimer(auction_id: number) {
  if (auctionTimers[auction_id]?.interval) clearInterval(auctionTimers[auction_id].interval);
  auctionTimers[auction_id].interval = setInterval(async () => {
    if (auctionTimers[auction_id].timeLeft > 0 && auctionTimers[auction_id].isActive) {
      auctionTimers[auction_id].timeLeft -= 1;
      io.to(`auction_${auction_id}`).emit("timer_update", { timeLeft: auctionTimers[auction_id].timeLeft, isActive: true });
    } else if (auctionTimers[auction_id].timeLeft === 0) {
      clearInterval(auctionTimers[auction_id].interval);
      auctionTimers[auction_id].isActive = false;
      const state = auctionTimers[auction_id];
      if (state.highestBidder && state.currentPlayer) {
        await handleAutoSell(auction_id, state);
      } else {
        io.to(`auction_${auction_id}`).emit("auction_timeout");
      }
    }
  }, 1000);
}

async function handleAutoSell(auction_id: number, state: any) {
  try {
    const [auctions]: any = await db.query("SELECT season FROM Auction WHERE auction_id = ?", [auction_id]);
    const season = auctions[0]?.season || "2024";
    await db.query("CALL Sell_Player(?, ?, ?, ?, ?)", [state.currentPlayer.player_id, state.highestBidder.team_id, auction_id, state.highestBid, season]);
    io.to(`auction_${auction_id}`).emit("player_sold", { player: state.currentPlayer, team_id: state.highestBidder.team_id, team_name: state.highestBidder.team_name, amount: state.highestBid });
    state.currentPlayer = null;
    state.highestBidder = null;
    state.highestBid    = 0;
  } catch (err: any) {
    io.to(`auction_${auction_id}`).emit("bid_error", { message: "Auto-sell failed: " + err.message });
  }
}

export { httpServer as default };
