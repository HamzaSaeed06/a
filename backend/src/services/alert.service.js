const { getDB, toObjectId } = require("../utils/mongo");

const getAlerts = async (userId) => {
  const db = getDB();
  const userOid = toObjectId(userId);

  // Get user bands
  const bands = await db.collection("bands").find({ owner_user_id: userOid }).toArray();
  const bandOids = bands.map((b) => b._id);

  if (bandOids.length === 0) return [];

  const bandMap = {};
  bands.forEach((b) => {
    bandMap[b._id.toString()] = b;
  });

  // Fetch sos_events
  const sosEvents = await db
    .collection("sos_events")
    .find({ band_id: { $in: bandOids } })
    .sort({ triggered_at: -1 })
    .limit(20)
    .toArray();

  // Fetch activity logs
  const activityLogs = await db
    .collection("activity_logs")
    .find({ band_id: { $in: bandOids } })
    .sort({ created_at: -1 })
    .limit(30)
    .toArray();

  const alerts = [];

  // Map sos_events to alerts format
  sosEvents.forEach((sos) => {
    const band = bandMap[sos.band_id.toString()] || {};
    alerts.push({
      id: sos._id.toString(),
      childId: sos.band_id.toString(),
      childName: band.nickname || "Child Band",
      avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&h=120&fit=crop&auto=format",
      type: "Emergency SOS",
      typeColor: "#DC2626",
      typeBg: "#FEE2E2",
      location: `Lat: ${sos.lat?.toFixed(4) || "37.7749"}, Lng: ${sos.lng?.toFixed(4) || "-122.4194"}`,
      timestamp: new Date(sos.triggered_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
      status: sos.resolved_at ? "resolved" : "active",
      severity: "critical",
      details: sos.resolved_at
        ? `SOS triggered and resolved at ${new Date(sos.resolved_at).toLocaleTimeString()}`
        : "Emergency SOS triggered from mobile or smart band!",
    });
  });

  // Map activity_logs to alerts format
  activityLogs.forEach((log) => {
    const band = bandMap[log.band_id.toString()] || {};
    let typeName = "Activity Log";
    let typeColor = "#3B82F6";
    let typeBg = "#DBEAFE";
    let severity = "low";

    if (log.type === "zone_entered_warning") {
      typeName = "Zone Warning";
      typeColor = "#B45309";
      typeBg = "#FEF3C7";
      severity = "medium";
    } else if (log.type === "zone_entered_danger") {
      typeName = "Zone Exceeded";
      typeColor = "#C2410C";
      typeBg = "#FFEDD5";
      severity = "high";
    } else if (log.type === "battery_low") {
      typeName = "Low Battery";
      typeColor = "#475569";
      typeBg = "#E2E8F0";
      severity = "medium";
    }

    if (log.type !== "sos_triggered" && log.type !== "sos_resolved") {
      alerts.push({
        id: log._id.toString(),
        childId: log.band_id.toString(),
        childName: band.nickname || "Child Band",
        avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&h=120&fit=crop&auto=format",
        type: typeName,
        typeColor,
        typeBg,
        location: log.details?.lat ? `Lat: ${log.details.lat.toFixed(4)}, Lng: ${log.details.lng.toFixed(4)}` : "Live Geofence Boundary",
        timestamp: new Date(log.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
        status: "active",
        severity,
        details: log.details ? JSON.stringify(log.details) : "Safety event logged",
      });
    }
  });

  return alerts;
};

module.exports = { getAlerts };
