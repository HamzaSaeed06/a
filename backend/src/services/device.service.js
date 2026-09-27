const { getDB, toObjectId } = require("../utils/mongo");
const AppError = require("../utils/AppError");
const logger = require("../config/logger");
const { validatePingPayload, validateSosPayload } = require("../utils/ingestionValidator");
const { checkNonce } = require("../utils/replayProtection");
const { computeZoneStatus } = require("./zoneEngine");
const { haversine } = require("../utils/geo");
const { broadcastToBandOwners } = require("../utils/websocket");

const handlePing = async (bandId, body) => {
  const validated = validatePingPayload(body);

  if (!checkNonce(bandId, validated.nonce)) {
    throw new AppError("Replay detected: nonce already used", 422);
  }

  const db = getDB();
  const oid = toObjectId(bandId);
  const now = new Date();

  // Record the ping
  await db.collection("location_pings").insertOne({
    band_id: oid,
    lat: validated.lat,
    lng: validated.lng,
    battery_pct: validated.battery_pct,
    timestamp: validated.timestamp,
    received_at: now,
  });

  // Compute zone status
  const newStatus = await computeZoneStatus(oid, validated.lat, validated.lng);

  // Get current band state for change detection
  const band = await db.collection("bands").findOne({ _id: oid });
  if (!band) throw new AppError("Band not found", 404);

  const previousStatus = band.status;
  const statusChanged = newStatus !== previousStatus && previousStatus !== "sos";

  // Update band with latest ping data
  const updateFields = {
    last_lat: validated.lat,
    last_lng: validated.lng,
    battery_pct: validated.battery_pct,
    last_ping_at: now,
    updated_at: now,
  };

  if (statusChanged) {
    updateFields.status = newStatus;
  }

  // Check for battery low
  if (validated.battery_pct <= 15 && (!band.battery_pct || band.battery_pct > 15)) {
    await db.collection("activity_logs").insertOne({
      band_id: oid,
      user_id: band.owner_user_id,
      type: "battery_low",
      details: { batteryPct: validated.battery_pct },
      created_at: now,
    });

    broadcastToBandOwners(bandId, {
      type: "activity_logged",
      bandId,
      activityType: "battery_low",
      details: { batteryPct: validated.battery_pct },
      timestamp: now,
    });
  }

  // Anomaly detection: implausible speed
  if (band.last_lat !== null && band.last_lng !== null && band.last_ping_at) {
    const timeDiff = (now - band.last_ping_at) / 1000; // seconds
    if (timeDiff > 0) {
      const dist = haversine(band.last_lat, band.last_lng, validated.lat, validated.lng);
      const speedKmh = (dist / timeDiff) * 3.6;
      if (speedKmh > 200) {
        logger.warn(`Anomaly: band ${bandId} speed ${speedKmh.toFixed(1)} km/h between pings`);
        await db.collection("activity_logs").insertOne({
          band_id: oid,
          user_id: band.owner_user_id,
          type: "anomaly_detected",
          details: {
            speedKmh: Math.round(speedKmh),
            fromLat: band.last_lat,
            fromLng: band.last_lng,
            toLat: validated.lat,
            toLng: validated.lng,
          },
          created_at: now,
        });
      }
    }
  }

  await db.collection("bands").updateOne({ _id: oid }, { $set: updateFields });

  // Log zone transition
  if (statusChanged) {
    const zoneType = newStatus === "safe" ? "zone_entered_safe"
      : newStatus === "warning" ? "zone_entered_warning"
      : "zone_entered_danger";

    await db.collection("activity_logs").insertOne({
      band_id: oid,
      user_id: band.owner_user_id,
      type: zoneType,
      details: {
        fromStatus: previousStatus,
        toStatus: newStatus,
        lat: validated.lat,
        lng: validated.lng,
      },
      created_at: now,
    });

    broadcastToBandOwners(bandId, {
      type: "band_status_updated",
      bandId,
      status: newStatus,
      previousStatus,
      lat: validated.lat,
      lng: validated.lng,
      batteryPct: validated.battery_pct,
      timestamp: now,
    });
  } else if (newStatus === "danger" || newStatus === "sos") {
    // Live map update for danger/sos on every ping
    broadcastToBandOwners(bandId, {
      type: "band_status_updated",
      bandId,
      status: newStatus,
      previousStatus,
      lat: validated.lat,
      lng: validated.lng,
      batteryPct: validated.battery_pct,
      timestamp: now,
    });
  }

  return {
    status: statusChanged ? newStatus : previousStatus,
    statusChanged,
    lat: validated.lat,
    lng: validated.lng,
    batteryPct: validated.battery_pct,
    receivedAt: now,
  };
};

const handleSos = async (bandId, body) => {
  const validated = validateSosPayload(body);

  if (!checkNonce(bandId, validated.nonce)) {
    throw new AppError("Replay detected: nonce already used", 422);
  }

  const db = getDB();
  const oid = toObjectId(bandId);
  const now = new Date();

  const band = await db.collection("bands").findOne({ _id: oid });
  if (!band) throw new AppError("Band not found", 404);

  // Create SOS event
  const sosResult = await db.collection("sos_events").insertOne({
    band_id: oid,
    user_id: band.owner_user_id,
    triggered_at: now,
    lat: validated.lat,
    lng: validated.lng,
    resolved_at: null,
    resolved_by_user_id: null,
  });

  // Update band status to sos
  await db.collection("bands").updateOne(
    { _id: oid },
    { $set: { status: "sos", last_lat: validated.lat, last_lng: validated.lng, last_ping_at: now, updated_at: now } }
  );

  // Log SOS triggered
  await db.collection("activity_logs").insertOne({
    band_id: oid,
    user_id: band.owner_user_id,
    type: "sos_triggered",
    details: { sosEventId: sosResult.insertedId.toString(), lat: validated.lat, lng: validated.lng },
    created_at: now,
  });

  broadcastToBandOwners(bandId, {
    type: "sos_triggered",
    bandId,
    sosEventId: sosResult.insertedId.toString(),
    lat: validated.lat,
    lng: validated.lng,
    timestamp: now,
  });

  broadcastToBandOwners(bandId, {
    type: "band_status_updated",
    bandId,
    status: "sos",
    previousStatus: band.status,
    lat: validated.lat,
    lng: validated.lng,
    timestamp: now,
  });

  return {
    sosEventId: sosResult.insertedId.toString(),
    status: "sos",
    lat: validated.lat,
    lng: validated.lng,
    triggeredAt: now,
  };
};

module.exports = { handlePing, handleSos };
