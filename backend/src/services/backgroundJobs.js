const { getDB, toObjectId } = require("../utils/mongo");
const logger = require("../config/logger");
const { computeZoneStatus } = require("./zoneEngine");
const { emit } = require("./wsEmitter");

const DISCONNECT_TIMEOUT_MS = 90000; // 90 seconds — no ping = offline
const CHECK_INTERVAL_MS = 30000;     // check every 30 seconds

let intervalId = null;

const checkDisconnectedBands = async () => {
  try {
    const db = getDB();
    const now = new Date();
    const cutoff = new Date(now.getTime() - DISCONNECT_TIMEOUT_MS);

    // Find bands that are not offline/sos but haven't pinged recently
    const staleBands = await db
      .collection("bands")
      .find({
        status: { $nin: ["offline", "sos"] },
        last_ping_at: { $ne: null, $lt: cutoff },
      })
      .toArray();

    for (const band of staleBands) {
      const oid = band._id;
      const statusAtDisconnect = band.status;

      await db.collection("bands").updateOne(
        { _id: oid },
        { $set: { status: "offline", updated_at: now } }
      );

      await db.collection("activity_logs").insertOne({
        band_id: oid,
        user_id: band.owner_user_id,
        type: "band_disconnected",
        details: {
          lastPingAt: band.last_ping_at,
          previousStatus: statusAtDisconnect,
        },
        created_at: now,
      });

      logger.warn(`Band ${oid.toString()} disconnected (no ping since ${band.last_ping_at})`);

      emit("band_status_updated", {
        bandId: oid.toString(),
        status: "offline",
        previousStatus: statusAtDisconnect,
        timestamp: now,
      });
    }

    // Also mark bands that have never pinged but are not offline as offline
    // (only if they were created more than DISCONNECT_TIMEOUT_MS ago)
    const neverPingedBands = await db
      .collection("bands")
      .find({
        status: { $nin: ["offline", "sos"] },
        last_ping_at: null,
        created_at: { $lt: cutoff },
      })
      .toArray();

    for (const band of neverPingedBands) {
      const oid = band._id;

      await db.collection("bands").updateOne(
        { _id: oid },
        { $set: { status: "offline", updated_at: now } }
      );

      await db.collection("activity_logs").insertOne({
        band_id: oid,
        user_id: band.owner_user_id,
        type: "band_disconnected",
        details: { previousStatus: band.status, neverPinged: true },
        created_at: now,
      });

      logger.warn(`Band ${oid.toString()} marked offline (never received ping)`);

      emit("band_status_updated", {
        bandId: oid.toString(),
        status: "offline",
        previousStatus: band.status,
        timestamp: now,
      });
    }
  } catch (err) {
    logger.error("Error in disconnect check job:", err);
  }
};

const start = () => {
  if (intervalId) return;
  intervalId = setInterval(checkDisconnectedBands, CHECK_INTERVAL_MS);
  logger.info(`Band disconnect monitor started (interval: ${CHECK_INTERVAL_MS / 1000}s, timeout: ${DISCONNECT_TIMEOUT_MS / 1000}s)`);
};

const stop = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    logger.info("Band disconnect monitor stopped");
  }
};

module.exports = { start, stop, checkDisconnectedBands };
