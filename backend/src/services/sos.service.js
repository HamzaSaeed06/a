const { getDB, toObjectId } = require("../utils/mongo");
const AppError = require("../utils/AppError");
const { computeZoneStatus } = require("./zoneEngine");
const { emit } = require("./wsEmitter");

const triggerSos = async (bandId, userId, lat, lng) => {
  const db = getDB();
  const oid = toObjectId(bandId);
  if (!oid) throw new AppError("Band not found", 404);

  const band = await db.collection("bands").findOne({ _id: oid });
  if (!band) throw new AppError("Band not found", 404);
  if (band.owner_user_id.toString() !== userId) throw new AppError("Access denied", 403);

  const now = new Date();
  const sosLat = lat !== undefined ? lat : (band.last_lat || 37.7749);
  const sosLng = lng !== undefined ? lng : (band.last_lng || -122.4194);

  // Insert SOS event
  const sosResult = await db.collection("sos_events").insertOne({
    band_id: oid,
    user_id: toObjectId(userId),
    triggered_at: now,
    lat: sosLat,
    lng: sosLng,
    resolved_at: null,
    resolved_by_user_id: null,
  });

  // Update band status to sos
  await db.collection("bands").updateOne(
    { _id: oid },
    { $set: { status: "sos", last_lat: sosLat, last_lng: sosLng, last_ping_at: now, updated_at: now } }
  );

  // Log SOS triggered in activity_logs
  await db.collection("activity_logs").insertOne({
    band_id: oid,
    user_id: toObjectId(userId),
    type: "sos_triggered",
    details: { sosEventId: sosResult.insertedId.toString(), lat: sosLat, lng: sosLng },
    created_at: now,
  });

  emit("sos_triggered", {
    bandId,
    sosEventId: sosResult.insertedId.toString(),
    lat: sosLat,
    lng: sosLng,
    timestamp: now,
  });

  emit("band_status_updated", {
    bandId,
    status: "sos",
    previousStatus: band.status,
    lat: sosLat,
    lng: sosLng,
    timestamp: now,
  });

  return {
    sosEventId: sosResult.insertedId.toString(),
    status: "sos",
    lat: sosLat,
    lng: sosLng,
    triggeredAt: now,
  };
};

const resolveSos = async (bandId, userId, sosEventId) => {
  const db = getDB();
  const oid = toObjectId(bandId);
  if (!oid) throw new AppError("Band not found", 404);

  const band = await db.collection("bands").findOne({ _id: oid });
  if (!band) throw new AppError("Band not found", 404);
  if (band.owner_user_id.toString() !== userId) throw new AppError("Access denied", 403);

  const now = new Date();

  // Find the SOS event (by ID if given, else latest unresolved)
  let query = { band_id: oid, resolved_at: null };
  if (sosEventId) {
    const eventOid = toObjectId(sosEventId);
    if (eventOid) query = { _id: eventOid };
  }

  const sosEvent = await db
    .collection("sos_events")
    .findOne(query, { sort: { triggered_at: -1 } });

  if (!sosEvent) {
    // If band status is sos, reset status anyway
    if (band.status === "sos") {
      let newStatus = "offline";
      if (band.last_lat !== null && band.last_lng !== null) {
        newStatus = await computeZoneStatus(oid, band.last_lat, band.last_lng);
      }
      await db.collection("bands").updateOne(
        { _id: oid },
        { $set: { status: newStatus, updated_at: now } }
      );
      return { resolvedAt: now, newStatus };
    }
    throw new AppError("No active SOS event found", 404);
  }

  // Compute zone-based status based on last known location
  let newStatus = "offline";
  if (band.last_lat !== null && band.last_lng !== null) {
    newStatus = await computeZoneStatus(oid, band.last_lat, band.last_lng);
  }

  // Update SOS event
  await db.collection("sos_events").updateOne(
    { _id: sosEvent._id },
    {
      $set: {
        resolved_at: now,
        resolved_by_user_id: toObjectId(userId),
      },
    }
  );

  // Update band status
  await db.collection("bands").updateOne(
    { _id: oid },
    { $set: { status: newStatus, updated_at: now } }
  );

  // Log SOS resolved
  await db.collection("activity_logs").insertOne({
    band_id: oid,
    user_id: toObjectId(userId),
    type: "sos_resolved",
    details: {
      sosEventId: sosEvent._id.toString(),
      resolvedStatus: newStatus,
      lat: band.last_lat,
      lng: band.last_lng,
    },
    created_at: now,
  });

  // Broadcast events
  emit("sos_resolved", {
    bandId: bandId,
    sosEventId: sosEvent._id.toString(),
    resolvedBy: userId,
    newStatus,
    timestamp: now,
  });

  emit("band_status_updated", {
    bandId: bandId,
    status: newStatus,
    previousStatus: "sos",
    timestamp: now,
  });

  return {
    sosEventId: sosEvent._id.toString(),
    resolvedAt: now,
    newStatus,
    lat: band.last_lat,
    lng: band.last_lng,
  };
};

module.exports = { triggerSos, resolveSos };

