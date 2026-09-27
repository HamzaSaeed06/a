const { getDB } = require("../utils/mongo");
const { haversine } = require("../utils/geo");

const computeZoneStatus = async (bandOid, lat, lng) => {
  const db = getDB();

  const band = await db.collection("bands").findOne({ _id: bandOid });
  if (!band) return "offline";

  // If SOS is active, status stays sos regardless of zone
  if (band.status === "sos") return "sos";

  // Find the active saved location for this band
  const activeLocation = await db.collection("saved_locations").findOne({
    band_id: bandOid,
    is_active: true,
  });

  if (!activeLocation) {
    // No active location means band is always "danger" if ping is received
    return "danger";
  }

  const distance = haversine(lat, lng, activeLocation.lat, activeLocation.lng);

  // Use per-location radius overrides if set, otherwise use band-level radii
  const safeRadius = activeLocation.safe_radius_m ?? band.safe_radius_m;
  const warningRadius = activeLocation.warning_radius_m ?? band.warning_radius_m;

  if (distance <= safeRadius) {
    return "safe";
  } else if (distance <= warningRadius) {
    return "warning";
  } else {
    return "danger";
  }
};

module.exports = { computeZoneStatus };
