const { WebSocketServer } = require("ws");
const jwt = require("jsonwebtoken");
const { getDB, toObjectId } = require("../utils/mongo");
const config = require("../config");
const logger = require("../config/logger");

let wss;
const userSockets = new Map(); // userId -> Set<WebSocket>

const setupWebSocket = (server) => {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", async (ws, req) => {
    try {
      // Authenticate from query string or first message
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get("token");

      if (!token) {
        ws.close(4001, "Token required");
        return;
      }

      let decoded;
      try {
        decoded = jwt.verify(token, config.jwt.secret);
      } catch {
        ws.close(4002, "Invalid token");
        return;
      }

      const db = getDB();
      const user = await db.collection("users").findOne({ _id: toObjectId(decoded.userId) });
      if (!user) {
        ws.close(4003, "User not found");
        return;
      }

      const userId = user._id.toString();
      ws.userId = userId;
      ws.isAlive = true;

      // Track this socket
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(ws);

      logger.info(`WebSocket connected: user ${userId}`);

      // Send welcome
      ws.send(JSON.stringify({ type: "connected", userId }));

      // Heartbeat
      ws.on("pong", () => { ws.isAlive = true; });

      ws.on("message", (raw) => {
        try {
          const msg = JSON.parse(raw);
          if (msg.type === "ping") {
            ws.send(JSON.stringify({ type: "pong", timestamp: new Date().toISOString() }));
          }
        } catch {
          // ignore malformed
        }
      });

      ws.on("close", () => {
        const sockets = userSockets.get(userId);
        if (sockets) {
          sockets.delete(ws);
          if (sockets.size === 0) userSockets.delete(userId);
        }
        logger.info(`WebSocket disconnected: user ${userId}`);
      });

      ws.on("error", (err) => {
        logger.error(`WebSocket error for user ${userId}:`, err.message);
      });
    } catch (err) {
      logger.error("WebSocket connection error:", err);
      ws.close(4000, "Connection error");
    }
  });

  // Heartbeat interval — ping all clients, terminate dead ones
  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(heartbeat));

  logger.info("WebSocket server ready on /ws");
};

const broadcastToUser = (userId, data) => {
  const sockets = userSockets.get(userId);
  if (!sockets) return;
  const msg = JSON.stringify(data);
  for (const ws of sockets) {
    if (ws.readyState === 1) {
      ws.send(msg);
    }
  }
};

const broadcastToBandOwners = async (bandId, data) => {
  const db = getDB();
  const oid = toObjectId(bandId);
  if (!oid) return;

  const band = await db.collection("bands").findOne({ _id: oid });
  if (!band) return;

  broadcastToUser(band.owner_user_id.toString(), data);
};

const getConnectedUsers = () => {
  return Array.from(userSockets.keys());
};

module.exports = { setupWebSocket, broadcastToUser, broadcastToBandOwners, getConnectedUsers };
