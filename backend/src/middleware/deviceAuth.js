const bcrypt = require("bcryptjs");
const { getDB, toObjectId } = require("../utils/mongo");
const AppError = require("../utils/AppError");
const logger = require("../config/logger");

const authenticateDevice = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Device ")) {
      throw new AppError("Device authentication required", 401);
    }

    const credentials = authHeader.split(" ")[1];
    const [bandId, secret] = credentials.split(":");
    if (!bandId || !secret) {
      throw new AppError("Invalid device credentials format", 401);
    }

    const db = getDB();
    const oid = toObjectId(bandId);
    if (!oid) throw new AppError("Device not found", 401);

    const deviceCred = await db.collection("device_credentials").findOne({ band_id: oid });

    if (!deviceCred) {
      throw new AppError("Device not found", 401);
    }

    if (deviceCred.status !== "active") {
      throw new AppError("Device revoked", 403);
    }

    const isValid = await bcrypt.compare(secret, deviceCred.device_secret);
    if (!isValid) {
      logger.warn(`Invalid device secret for band ${bandId}`);
      throw new AppError("Invalid device credentials", 401);
    }

    await db.collection("device_credentials").updateOne(
      { _id: deviceCred._id },
      { $set: { last_used_at: new Date() } }
    );

    req.bandId = bandId;
    req.deviceCred = {
      id: deviceCred._id.toString(),
      bandId: deviceCred.band_id.toString(),
      deviceType: deviceCred.device_type,
      status: deviceCred.status,
    };
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authenticateDevice };
