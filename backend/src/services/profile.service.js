const { getDB, toObjectId } = require("../utils/mongo");
const AppError = require("../utils/AppError");

const getProfile = async (bandId, userId) => {
  const db = getDB();
  const oid = toObjectId(bandId);
  if (!oid) return null;

  const band = await db.collection("bands").findOne({ _id: oid });
  if (!band) throw new AppError("Band not found", 404);
  if (band.owner_user_id.toString() !== userId) throw new AppError("Access denied", 403);

  const profile = await db.collection("child_profiles").findOne({ band_id: oid });
  if (!profile) return null;

  return {
    id: profile._id.toString(),
    bandId: profile.band_id.toString(),
    name: profile.name,
    age: profile.age,
    photoUrl: profile.photo_url,
    notes: profile.notes,
    createdAt: profile.created_at,
  };
};

const upsertProfile = async (bandId, userId, data) => {
  const db = getDB();
  const oid = toObjectId(bandId);
  if (!oid) throw new AppError("Band not found", 404);

  const band = await db.collection("bands").findOne({ _id: oid });
  if (!band) throw new AppError("Band not found", 404);
  if (band.owner_user_id.toString() !== userId) throw new AppError("Access denied", 403);

  const now = new Date();
  const updateFields = { updated_at: now };
  if (data.name !== undefined) updateFields.name = data.name;
  if (data.age !== undefined) updateFields.age = data.age;
  if (data.photoUrl !== undefined) updateFields.photo_url = data.photoUrl;
  if (data.notes !== undefined) updateFields.notes = data.notes;

  await db.collection("child_profiles").updateOne(
    { band_id: oid },
    { $set: updateFields, $setOnInsert: { band_id: oid, created_at: now } },
    { upsert: true }
  );

  const profile = await db.collection("child_profiles").findOne({ band_id: oid });

  const profileCompleted = !!(profile.name && profile.age);
  if (profileCompleted && !band.profile_completed) {
    await db.collection("bands").updateOne(
      { _id: oid },
      { $set: { profile_completed: true, updated_at: now } }
    );

    await db.collection("activity_logs").insertOne({
      band_id: oid,
      profile_id: profile._id,
      user_id: toObjectId(userId),
      type: "profile_completed",
      details: { childName: profile.name },
      created_at: now,
    });
  }

  return {
    id: profile._id.toString(),
    bandId: profile.band_id.toString(),
    name: profile.name,
    age: profile.age,
    photoUrl: profile.photo_url,
    notes: profile.notes,
    createdAt: profile.created_at,
  };
};

module.exports = { getProfile, upsertProfile };
