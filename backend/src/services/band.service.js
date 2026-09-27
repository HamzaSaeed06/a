const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { getDB, toObjectId } = require("../utils/mongo");
const config = require("../config");
const AppError = require("../utils/AppError");

const generateDeviceSecret = () => {
  return crypto.randomBytes(config.deviceSecretLength).toString("hex");
};

const register = async (userId, { nickname, deviceType = "simulator" }) => {
  const db = getDB();
  const now = new Date();

  const bandResult = await db.collection("bands").insertOne({
    nickname,
    owner_user_id: toObjectId(userId),
    status: "offline",
    safe_radius_m: 100,
    warning_radius_m: 300,
    last_lat: null,
    last_lng: null,
    battery_pct: null,
    last_ping_at: null,
    profile_completed: false,
    created_at: now,
    updated_at: now,
  });

  const bandId = bandResult.insertedId;
  const plainSecret = generateDeviceSecret();
  const hashedSecret = await bcrypt.hash(plainSecret, 12);

  await db.collection("device_credentials").insertOne({
    band_id: bandId,
    device_secret: hashedSecret,
    device_type: deviceType,
    status: "active",
    last_used_at: null,
    created_at: now,
  });

  return {
    band: {
      id: bandId.toString(),
      nickname,
      ownerId: userId,
      status: "offline",
      safeRadiusM: 100,
      warningRadiusM: 300,
      lastLat: null,
      lastLng: null,
      batteryPct: null,
      lastPingAt: null,
      profileCompleted: false,
      createdAt: now,
    },
    device: {
      bandId: bandId.toString(),
      deviceSecret: plainSecret,
      deviceType,
    },
  };
};

const listByOwner = async (userId) => {
  const db = getDB();
  const bands = await db
    .collection("bands")
    .find({ owner_user_id: toObjectId(userId) })
    .sort({ created_at: -1 })
    .toArray();

  return bands.map((b) => ({
    id: b._id.toString(),
    nickname: b.nickname,
    ownerId: b.owner_user_id.toString(),
    status: b.status,
    safeRadiusM: b.safe_radius_m,
    warningRadiusM: b.warning_radius_m,
    lastLat: b.last_lat,
    lastLng: b.last_lng,
    batteryPct: b.battery_pct,
    lastPingAt: b.last_ping_at,
    profileCompleted: b.profile_completed,
    createdAt: b.created_at,
  }));
};

const getById = async (bandId, userId) => {
  const db = getDB();
  const oid = toObjectId(bandId);
  if (!oid) throw new AppError("Band not found", 404);

  const b = await db.collection("bands").findOne({ _id: oid });
  if (!b) throw new AppError("Band not found", 404);
  if (b.owner_user_id.toString() !== userId) throw new AppError("Access denied", 403);

  const cred = await db.collection("device_credentials").findOne({ band_id: oid });

  return {
    id: b._id.toString(),
    nickname: b.nickname,
    ownerId: b.owner_user_id.toString(),
    status: b.status,
    safeRadiusM: b.safe_radius_m,
    warningRadiusM: b.warning_radius_m,
    lastLat: b.last_lat,
    lastLng: b.last_lng,
    batteryPct: b.battery_pct,
    lastPingAt: b.last_ping_at,
    profileCompleted: b.profile_completed,
    createdAt: b.created_at,
    deviceCreds: cred
      ? [{ deviceType: cred.device_type, status: cred.status }]
      : [],
  };
};

const update = async (bandId, userId, data) => {
  const db = getDB();
  const oid = toObjectId(bandId);
  if (!oid) throw new AppError("Band not found", 404);

  const b = await db.collection("bands").findOne({ _id: oid });
  if (!b) throw new AppError("Band not found", 404);
  if (b.owner_user_id.toString() !== userId) throw new AppError("Access denied", 403);

  const updateFields = { updated_at: new Date() };
  if (data.nickname !== undefined) updateFields.nickname = data.nickname;
  if (data.safeRadiusM !== undefined) updateFields.safe_radius_m = data.safeRadiusM;
  if (data.warningRadiusM !== undefined) updateFields.warning_radius_m = data.warningRadiusM;

  await db.collection("bands").updateOne({ _id: oid }, { $set: updateFields });

  const updated = await db.collection("bands").findOne({ _id: oid });
  return {
    id: updated._id.toString(),
    nickname: updated.nickname,
    ownerId: updated.owner_user_id.toString(),
    status: updated.status,
    safeRadiusM: updated.safe_radius_m,
    warningRadiusM: updated.warning_radius_m,
    lastLat: updated.last_lat,
    lastLng: updated.last_lng,
    batteryPct: updated.battery_pct,
    lastPingAt: updated.last_ping_at,
    profileCompleted: updated.profile_completed,
    createdAt: updated.created_at,
  };
};

const remove = async (bandId, userId) => {
  const db = getDB();
  const oid = toObjectId(bandId);
  if (!oid) throw new AppError("Band not found", 404);

  const b = await db.collection("bands").findOne({ _id: oid });
  if (!b) throw new AppError("Band not found", 404);
  if (b.owner_user_id.toString() !== userId) throw new AppError("Access denied", 403);

  await db.collection("bands").deleteOne({ _id: oid });
  await db.collection("device_credentials").deleteMany({ band_id: oid });
  await db.collection("child_profiles").deleteMany({ band_id: oid });
  await db.collection("saved_locations").deleteMany({ band_id: oid });
  await db.collection("location_pings").deleteMany({ band_id: oid });
  await db.collection("sos_events").deleteMany({ band_id: oid });
  await db.collection("activity_logs").deleteMany({ band_id: oid });

  return { message: "Band deleted successfully" };
};

module.exports = { register, listByOwner, getById, update, remove };
