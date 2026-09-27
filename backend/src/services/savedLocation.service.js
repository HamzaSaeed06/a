const { getDB, toObjectId } = require("../utils/mongo");
const AppError = require("../utils/AppError");

const listByBand = async (bandId, userId) => {
  const db = getDB();
  const oid = toObjectId(bandId);
  if (!oid) throw new AppError("Invalid band ID", 400);

  const band = await db.collection("bands").findOne({ _id: oid });
  if (!band) throw new AppError("Band not found", 404);
  if (band.owner_user_id.toString() !== userId) throw new AppError("Access denied", 403);

  const locations = await db
    .collection("saved_locations")
    .find({ band_id: oid })
    .sort({ is_active: -1, created_at: -1 })
    .toArray();

  return locations.map((loc) => ({
    id: loc._id.toString(),
    bandId: loc.band_id.toString(),
    name: loc.name,
    lat: loc.lat,
    lng: loc.lng,
    radiusM: loc.radius_m,
    safeRadiusM: loc.safe_radius_m,
    warningRadiusM: loc.warning_radius_m,
    isActive: loc.is_active,
    createdAt: loc.created_at,
  }));
};

const create = async (bandId, userId, { name, lat, lng, radiusM, safeRadiusM, warningRadiusM }) => {
  const db = getDB();
  const oid = toObjectId(bandId);
  if (!oid) throw new AppError("Invalid band ID", 400);

  const band = await db.collection("bands").findOne({ _id: oid });
  if (!band) throw new AppError("Band not found", 404);
  if (band.owner_user_id.toString() !== userId) throw new AppError("Access denied", 403);

  const now = new Date();
  const result = await db.collection("saved_locations").insertOne({
    band_id: oid,
    name,
    lat,
    lng,
    radius_m: radiusM || 100,
    safe_radius_m: safeRadiusM || null,
    warning_radius_m: warningRadiusM || null,
    is_active: false,
    created_at: now,
    updated_at: now,
  });

  return {
    id: result.insertedId.toString(),
    bandId: bandId,
    name,
    lat,
    lng,
    radiusM: radiusM || 100,
    safeRadiusM: safeRadiusM || null,
    warningRadiusM: warningRadiusM || null,
    isActive: false,
    createdAt: now,
  };
};

const update = async (locationId, userId, data) => {
  const db = getDB();
  const locOid = toObjectId(locationId);
  if (!locOid) throw new AppError("Location not found", 404);

  const location = await db.collection("saved_locations").findOne({ _id: locOid });
  if (!location) throw new AppError("Location not found", 404);

  const band = await db.collection("bands").findOne({ _id: location.band_id });
  if (!band) throw new AppError("Band not found", 404);
  if (band.owner_user_id.toString() !== userId) throw new AppError("Access denied", 403);

  const updateFields = { updated_at: new Date() };
  if (data.name !== undefined) updateFields.name = data.name;
  if (data.lat !== undefined) updateFields.lat = data.lat;
  if (data.lng !== undefined) updateFields.lng = data.lng;
  if (data.radiusM !== undefined) updateFields.radius_m = data.radiusM;
  if (data.safeRadiusM !== undefined) updateFields.safe_radius_m = data.safeRadiusM;
  if (data.warningRadiusM !== undefined) updateFields.warning_radius_m = data.warningRadiusM;

  await db.collection("saved_locations").updateOne({ _id: locOid }, { $set: updateFields });

  const updated = await db.collection("saved_locations").findOne({ _id: locOid });
  return {
    id: updated._id.toString(),
    bandId: updated.band_id.toString(),
    name: updated.name,
    lat: updated.lat,
    lng: updated.lng,
    radiusM: updated.radius_m,
    safeRadiusM: updated.safe_radius_m,
    warningRadiusM: updated.warning_radius_m,
    isActive: updated.is_active,
    createdAt: updated.created_at,
  };
};

const remove = async (locationId, userId) => {
  const db = getDB();
  const locOid = toObjectId(locationId);
  if (!locOid) throw new AppError("Location not found", 404);

  const location = await db.collection("saved_locations").findOne({ _id: locOid });
  if (!location) throw new AppError("Location not found", 404);

  const band = await db.collection("bands").findOne({ _id: location.band_id });
  if (!band) throw new AppError("Band not found", 404);
  if (band.owner_user_id.toString() !== userId) throw new AppError("Access denied", 403);

  await db.collection("saved_locations").deleteOne({ _id: locOid });

  return { message: "Location deleted successfully" };
};

const activate = async (locationId, userId) => {
  const db = getDB();
  const locOid = toObjectId(locationId);
  if (!locOid) throw new AppError("Location not found", 404);

  const location = await db.collection("saved_locations").findOne({ _id: locOid });
  if (!location) throw new AppError("Location not found", 404);

  const band = await db.collection("bands").findOne({ _id: location.band_id });
  if (!band) throw new AppError("Band not found", 404);
  if (band.owner_user_id.toString() !== userId) throw new AppError("Access denied", 403);

  const now = new Date();

  // Deactivate all other locations for this band, then activate this one — atomic
  await db.collection("saved_locations").updateMany(
    { band_id: location.band_id },
    { $set: { is_active: false, updated_at: now } }
  );
  await db.collection("saved_locations").updateOne(
    { _id: locOid },
    { $set: { is_active: true, updated_at: now } }
  );

  const updated = await db.collection("saved_locations").findOne({ _id: locOid });

  // Log the active location change
  await db.collection("activity_logs").insertOne({
    band_id: location.band_id,
    user_id: toObjectId(userId),
    type: "active_location_changed",
    details: { locationName: updated.name, locationId: locationId },
    created_at: now,
  });

  return {
    id: updated._id.toString(),
    bandId: updated.band_id.toString(),
    name: updated.name,
    lat: updated.lat,
    lng: updated.lng,
    radiusM: updated.radius_m,
    safeRadiusM: updated.safe_radius_m,
    warningRadiusM: updated.warning_radius_m,
    isActive: updated.is_active,
    createdAt: updated.created_at,
  };
};

module.exports = { listByBand, create, update, remove, activate };
