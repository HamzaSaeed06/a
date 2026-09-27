const { getDB, toObjectId } = require("./mongo");
const logger = require("../config/logger");

const REPLAY_WINDOW_MS = 120000; // 2 minutes
const NONCE_CLEANUP_INTERVAL_MS = 300000; // 5 minutes

let nonceStore = new Map(); // band_id -> Set of { nonce, timestamp }
let lastCleanup = Date.now();

const cleanup = () => {
  const now = Date.now();
  if (now - lastCleanup < NONCE_CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [bandId, entries] of nonceStore) {
    for (const entry of entries) {
      if (now - entry.timestamp > REPLAY_WINDOW_MS) {
        entries.delete(entry);
      }
    }
    if (entries.size === 0) {
      nonceStore.delete(bandId);
    }
  }
  logger.debug(`Replay store cleanup: ${nonceStore.size} bands tracked`);
};

const checkNonce = (bandId, nonce) => {
  cleanup();

  if (!nonceStore.has(bandId)) {
    nonceStore.set(bandId, new Set());
  }

  const entries = nonceStore.get(bandId);
  const now = Date.now();

  // Clean old entries for this band
  for (const entry of entries) {
    if (now - entry.timestamp > REPLAY_WINDOW_MS) {
      entries.delete(entry);
    }
  }

  // Check if nonce already used
  for (const entry of entries) {
    if (entry.nonce === nonce) {
      logger.warn(`Replay detected: nonce "${nonce}" reused for band ${bandId}`);
      return false;
    }
  }

  entries.add({ nonce, timestamp: now });
  return true;
};

module.exports = { checkNonce };
