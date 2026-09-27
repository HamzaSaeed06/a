const AppError = require("../utils/AppError");
const logger = require("../config/logger");

const pingWindows = new Map(); // band_id -> { count, windowStart }
const sosWindows = new Map(); // band_id -> { count, windowStart }

const PING_WINDOW_MS = 5000;
const PING_MAX = 2;
const SOS_WINDOW_MS = 30000;
const SOS_MAX = 1;

const deviceRateLimit = (type) => (req, _res, next) => {
  const bandId = req.deviceCred?.bandId;
  if (!bandId) return next();

  const now = Date.now();
  const store = type === "ping" ? pingWindows : sosWindows;
  const windowMs = type === "ping" ? PING_WINDOW_MS : SOS_WINDOW_MS;
  const max = type === "ping" ? PING_MAX : SOS_MAX;

  const entry = store.get(bandId);
  if (!entry || now - entry.windowStart > windowMs) {
    store.set(bandId, { count: 1, windowStart: now });
    return next();
  }

  entry.count++;
  if (entry.count > max) {
    logger.warn(`Rate limit exceeded: band ${bandId} on /device/${type} (${entry.count}/${max})`);
    throw new AppError("Rate limit exceeded", 429);
  }

  next();
};

module.exports = { deviceRateLimit };
