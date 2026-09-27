const AppError = require("./AppError");

const validatePingPayload = (body) => {
  const { lat, lng, battery_pct, timestamp, nonce } = body;
  const errors = [];

  if (lat === undefined || lat === null || typeof lat !== "number" || lat < -90 || lat > 90) {
    errors.push({ field: "lat", message: "Number between -90 and 90 required" });
  }
  if (lng === undefined || lng === null || typeof lng !== "number" || lng < -180 || lng > 180) {
    errors.push({ field: "lng", message: "Number between -180 and 180 required" });
  }
  if (battery_pct === undefined || battery_pct === null || typeof battery_pct !== "number" ||
      !Number.isInteger(battery_pct) || battery_pct < 0 || battery_pct > 100) {
    errors.push({ field: "battery_pct", message: "Integer between 0 and 100 required" });
  }
  if (!timestamp) {
    errors.push({ field: "timestamp", message: "ISO 8601 timestamp required" });
  } else {
    const ts = new Date(timestamp);
    if (isNaN(ts.getTime())) {
      errors.push({ field: "timestamp", message: "Invalid ISO 8601 timestamp" });
    } else {
      const now = Date.now();
      const skew = Math.abs(ts.getTime() - now);
      if (skew > 120000) {
        errors.push({ field: "timestamp", message: "Timestamp too far from server time (>2min)" });
      }
    }
  }
  if (!nonce || typeof nonce !== "string" || nonce.length < 8) {
    errors.push({ field: "nonce", message: "Nonce string (min 8 chars) required" });
  }

  if (errors.length > 0) {
    throw new AppError("Validation failed", 400, errors);
  }

  return {
    lat: Number(lat),
    lng: Number(lng),
    battery_pct: Math.round(battery_pct),
    timestamp: new Date(timestamp),
    nonce,
  };
};

const validateSosPayload = (body) => {
  const { lat, lng, timestamp, nonce } = body;
  const errors = [];

  if (lat === undefined || lat === null || typeof lat !== "number" || lat < -90 || lat > 90) {
    errors.push({ field: "lat", message: "Number between -90 and 90 required" });
  }
  if (lng === undefined || lng === null || typeof lng !== "number" || lng < -180 || lng > 180) {
    errors.push({ field: "lng", message: "Number between -180 and 180 required" });
  }
  if (!timestamp) {
    errors.push({ field: "timestamp", message: "ISO 8601 timestamp required" });
  } else {
    const ts = new Date(timestamp);
    if (isNaN(ts.getTime())) {
      errors.push({ field: "timestamp", message: "Invalid ISO 8601 timestamp" });
    } else {
      const now = Date.now();
      const skew = Math.abs(ts.getTime() - now);
      if (skew > 120000) {
        errors.push({ field: "timestamp", message: "Timestamp too far from server time (>2min)" });
      }
    }
  }
  if (!nonce || typeof nonce !== "string" || nonce.length < 8) {
    errors.push({ field: "nonce", message: "Nonce string (min 8 chars) required" });
  }

  if (errors.length > 0) {
    throw new AppError("Validation failed", 400, errors);
  }

  return {
    lat: Number(lat),
    lng: Number(lng),
    timestamp: new Date(timestamp),
    nonce,
  };
};

module.exports = { validatePingPayload, validateSosPayload };
