const { getDB, toObjectId } = require("../utils/mongo");
const AppError = require("../utils/AppError");

const checkBandOwnership = async (req, _res, next) => {
  try {
    const bandId = req.params.id;
    if (!bandId) return next();

    const oid = toObjectId(bandId);
    if (!oid) throw new AppError("Band not found", 404);

    const db = getDB();
    const band = await db.collection("bands").findOne({ _id: oid });
    if (!band) {
      throw new AppError("Band not found", 404);
    }

    if (band.owner_user_id.toString() !== req.user.id) {
      throw new AppError("Access denied", 403);
    }

    req.band = {
      id: band._id.toString(),
      nickname: band.nickname,
      ownerId: band.owner_user_id.toString(),
      status: band.status,
      safeRadiusM: band.safe_radius_m,
      warningRadiusM: band.warning_radius_m,
      lastLat: band.last_lat,
      lastLng: band.last_lng,
      batteryPct: band.battery_pct,
      lastPingAt: band.last_ping_at,
      profileCompleted: band.profile_completed,
      createdAt: band.created_at,
    };
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { checkBandOwnership };
