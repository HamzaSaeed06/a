const { getDB, toObjectId } = require("../utils/mongo");
const AppError = require("../utils/AppError");

const listByBand = async (bandId, userId, { page = 1, limit = 20 } = {}) => {
  const db = getDB();
  const oid = toObjectId(bandId);
  if (!oid) throw new AppError("Band not found", 404);

  const band = await db.collection("bands").findOne({ _id: oid });
  if (!band) throw new AppError("Band not found", 404);
  if (band.owner_user_id.toString() !== userId) throw new AppError("Access denied", 403);

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    db
      .collection("activity_logs")
      .find({ band_id: oid })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray(),
    db.collection("activity_logs").countDocuments({ band_id: oid }),
  ]);

  return {
    logs: logs.map((l) => ({
      id: l._id.toString(),
      bandId: l.band_id.toString(),
      userId: l.user_id ? l.user_id.toString() : null,
      type: l.type,
      details: l.details,
      createdAt: l.created_at,
    })),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

const getRecent = async (bandId, userId, limit = 3) => {
  const db = getDB();
  const oid = toObjectId(bandId);
  if (!oid) throw new AppError("Band not found", 404);

  const band = await db.collection("bands").findOne({ _id: oid });
  if (!band) throw new AppError("Band not found", 404);
  if (band.owner_user_id.toString() !== userId) throw new AppError("Access denied", 403);

  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 3));

  const logs = await db
    .collection("activity_logs")
    .find({ band_id: oid })
    .sort({ created_at: -1 })
    .limit(limitNum)
    .toArray();

  return logs.map((l) => ({
    id: l._id.toString(),
    bandId: l.band_id.toString(),
    userId: l.user_id ? l.user_id.toString() : null,
    type: l.type,
    details: l.details,
    createdAt: l.created_at,
  }));
};

module.exports = { listByBand, getRecent };
