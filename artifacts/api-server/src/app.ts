import express, { type Express } from "express";
import { createServer } from "http";
import { Server, type Socket } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pinoHttp from "pino-http";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { logger } from "./lib/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface SocketUser extends JwtPayload {
  role: string;
  team_id?: number;
  user_id: number;
}

interface TeamRow {
  team_name: string;
  logo_url: string | null;
}

interface AuctionRow {
  season: string;
}

interface AuthenticatedSocket extends Socket {
  socketUser: SocketUser | null;
}

interface BidData {
  auction_id: number;
  player_id: number;
  team_id: number;
  amount: number;
}

interface SetPlayerData {
  auction_id: number;
  player: Record<string, unknown>;
}

const app: Express = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.set("io", io);

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

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const { default: authRouter }       = await import("./routes/auth.js");
const { default: adminRouter }      = await import("./routes/admin.js");
const { default: franchiseRouter }  = await import("./routes/franchise.js");
const { default: superAdminRouter } = await import("./routes/superadmin.js");

app.use("/api/auth",        authRouter);
app.use("/api/admin",       adminRouter);
app.use("/api/franchise",   franchiseRouter);
app.use("/api/super-admin", superAdminRouter);

app.get("/api/healthz", (_req, res) => res.json({ status: "ok" }));
app.get("/", (_req, res) => res.json({ message: "🏏 Auction OS API is running!" }));

const { auctionTimers } = await import("./state.js");
const { default: db }   = await import("./db.js");

io.use((socket, next) => {
  const raw = socket.handshake.auth as Record<string, string> | undefined;
  const header = socket.handshake.headers?.authorization;
  const token = raw?.token ?? header?.split(" ")[1];
  const authed = socket as AuthenticatedSocket;
  if (!token) { authed.socketUser = null; return next(); }
  try {
    authed.socketUser = jwt.verify(token, process.env.JWT_SECRET as string) as SocketUser;
  } catch {
    authed.socketUser = null;
  }
  next();
});

io.on("connection", (rawSocket) => {
  const socket = rawSocket as AuthenticatedSocket;
  const socketUser = socket.socketUser;
  logger.info({ id: socket.id, role: socketUser?.role }, "User connected");

  socket.on("join_auction", (auction_id: number) => {
    socket.join(`auction_${auction_id}`);
    const timer = auctionTimers[auction_id];
    if (timer) {
      socket.emit("auction_sync", {
        timeLeft:      timer.timeLeft,
        isActive:      timer.isActive,
        currentPlayer: timer.currentPlayer,
        highestBid:    timer.highestBid,
        highestBidder: timer.highestBidder,
      });
    }
  });

  socket.on("place_bid", async (data: BidData) => {
    if (!socketUser) { socket.emit("bid_error", { message: "Authentication required." }); return; }
    if (socketUser.role === "Franchise" && socketUser.team_id !== data.team_id) {
      socket.emit("bid_error", { message: "You can only bid for your own team." }); return;
    }
    try {
      const { auction_id, player_id, team_id, amount } = data;
      await db.query("CALL Place_Bid(?, ?, ?, ?)", [player_id, team_id, auction_id, amount]);
      const [teams] = await db.query("SELECT team_name, logo_url FROM Teams WHERE team_id = ?", [team_id]) as [TeamRow[], unknown];
      const team_name = teams[0]?.team_name ?? "Unknown Team";
      const team_logo = teams[0]?.logo_url ?? null;
      const highestBidder = { team_id, team_name, team_logo };
      const timer = auctionTimers[auction_id];
      if (timer) {
        timer.timeLeft     = 60;
        timer.highestBid   = amount;
        timer.highestBidder = highestBidder;
      }
      io.to(`auction_${auction_id}`).emit("bid_updated", { player_id, highestBid: amount, highestBidder, amount });
      io.to(`auction_${auction_id}`).emit("timer_update", { timeLeft: 60, isActive: true });
    } catch (err) {
      socket.emit("bid_error", { message: (err as Error).message });
    }
  });

  socket.on("franchise_bid", async (data: BidData) => {
    if (!socketUser || socketUser.role !== "Franchise") {
      socket.emit("bid_error", { message: "Franchise access required." }); return;
    }
    if (socketUser.team_id !== data.team_id) {
      socket.emit("bid_error", { message: "You can only bid for your own team." }); return;
    }
    const { auction_id, player_id, team_id, amount } = data;
    const [teams] = await db.query("SELECT team_name, logo_url FROM Teams WHERE team_id = ?", [team_id]) as [TeamRow[], unknown];
    const team_name = teams[0]?.team_name ?? "Unknown Team";
    const team_logo = teams[0]?.logo_url ?? null;
    const highestBidder = { team_id, team_name, team_logo };
    const timer = auctionTimers[auction_id];
    if (timer) {
      timer.timeLeft      = 60;
      timer.highestBid    = amount;
      timer.highestBidder = highestBidder;
    }
    io.to(`auction_${auction_id}`).emit("bid_updated", { player_id, highestBid: amount, highestBidder, amount });
    io.to(`auction_${auction_id}`).emit("timer_update", { timeLeft: 60, isActive: true });
  });

  socket.on("admin_start_clock", (auction_id: number) => {
    if (!socketUser || !["Admin", "Super Admin"].includes(socketUser.role)) {
      socket.emit("bid_error", { message: "Admin access required." }); return;
    }
    if (!auctionTimers[auction_id]) {
      auctionTimers[auction_id] = { timeLeft: 60, isActive: true, currentPlayer: null, highestBid: 0, highestBidder: null };
    } else {
      auctionTimers[auction_id].isActive = true;
    }
    startTimer(auction_id);
    io.to(`auction_${auction_id}`).emit("auction_started");
    io.to(`auction_${auction_id}`).emit("timer_update", { timeLeft: auctionTimers[auction_id].timeLeft, isActive: true });
  });

  socket.on("admin_set_player", (data: SetPlayerData) => {
    if (!socketUser || !["Admin", "Super Admin"].includes(socketUser.role)) {
      socket.emit("bid_error", { message: "Admin access required." }); return;
    }
    const { auction_id, player } = data;
    auctionTimers[auction_id] = {
      timeLeft: 60, isActive: false, currentPlayer: player,
      highestBid: Number((player as Record<string, unknown>).base_price ?? 0),
      highestBidder: null,
    };
    io.to(`auction_${auction_id}`).emit("player_changed", player);
    io.to(`auction_${auction_id}`).emit("timer_update", { timeLeft: 60, isActive: false });
  });
});

function startTimer(auction_id: number) {
  if (auctionTimers[auction_id]?.interval) clearInterval(auctionTimers[auction_id].interval);
  auctionTimers[auction_id].interval = setInterval(async () => {
    const timer = auctionTimers[auction_id];
    if (!timer) return;
    if (timer.timeLeft > 0 && timer.isActive) {
      timer.timeLeft -= 1;
      io.to(`auction_${auction_id}`).emit("timer_update", { timeLeft: timer.timeLeft, isActive: true });
    } else if (timer.timeLeft === 0) {
      clearInterval(timer.interval);
      timer.isActive = false;
      if (timer.highestBidder && timer.currentPlayer) {
        await handleAutoSell(auction_id, timer);
      } else {
        io.to(`auction_${auction_id}`).emit("auction_timeout");
      }
    }
  }, 1000);
}

interface TimerState {
  currentPlayer: Record<string, unknown> | null;
  highestBidder: { team_id: number; team_name: string; team_logo: string | null } | null;
  highestBid: number;
  timeLeft: number;
  isActive: boolean;
  interval?: ReturnType<typeof setInterval>;
}

async function handleAutoSell(auction_id: number, state: TimerState) {
  try {
    const [auctions] = await db.query("SELECT season FROM Auction WHERE auction_id = ?", [auction_id]) as [AuctionRow[], unknown];
    const season = auctions[0]?.season ?? "2024";
    const player = state.currentPlayer as Record<string, unknown>;
    const bidder = state.highestBidder!;
    await db.query("CALL Sell_Player(?, ?, ?, ?, ?)", [player.player_id, bidder.team_id, auction_id, state.highestBid, season]);
    io.to(`auction_${auction_id}`).emit("player_sold", {
      player: state.currentPlayer,
      team_id: bidder.team_id,
      team_name: bidder.team_name,
      amount: state.highestBid,
    });
    state.currentPlayer = null;
    state.highestBidder = null;
    state.highestBid    = 0;
  } catch (err) {
    io.to(`auction_${auction_id}`).emit("bid_error", { message: "Auto-sell failed: " + (err as Error).message });
  }
}

export { httpServer as default };
