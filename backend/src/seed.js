require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const bcrypt = require("bcryptjs");
const { connectDB, getDB } = require("./utils/mongo");
const logger = require("./config/logger");

const seedDatabase = async () => {
  try {
    const db = await connectDB();
    logger.info("Starting database seed...");

    // Clear existing collections
    const collections = [
      "users", "bands", "device_credentials", "child_profiles",
      "saved_locations", "location_pings", "sos_events", "activity_logs"
    ];
    for (const col of collections) {
      await db.collection(col).deleteMany({});
    }

    const now = new Date();

    // ─── 1. Parent User ────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash("password123", 12);
    const userResult = await db.collection("users").insertOne({
      email: "sarah@example.com",
      password: hashedPassword,
      name: "Sarah Chen",
      phone: "+1 (415) 555-0182",
      role: "parent",
      created_at: now,
      updated_at: now,
    });
    const parentId = userResult.insertedId;
    logger.info(`✔ Parent user seeded: sarah@example.com`);

    // ─── 2. Band #1 — Sophia ──────────────────────────────────────
    const band1 = await db.collection("bands").insertOne({
      nickname: "Sophia Band Pro",
      owner_user_id: parentId,
      status: "safe",
      safe_radius_m: 150,
      warning_radius_m: 350,
      last_lat: 37.7749,
      last_lng: -122.4194,
      battery_pct: 88,
      last_ping_at: now,
      profile_completed: true,
      created_at: now,
      updated_at: now,
    });
    const band1Id = band1.insertedId;

    const secret1 = await bcrypt.hash("device-secret-sophia-001", 12);
    await db.collection("device_credentials").insertOne({
      band_id: band1Id,
      device_secret: secret1,
      device_type: "simulator",
      status: "active",
      last_used_at: now,
      created_at: now,
    });

    await db.collection("child_profiles").insertOne({
      band_id: band1Id,
      name: "Sophia Chen",
      age: 8,
      photo_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&h=120&fit=crop&auto=format",
      notes: "Asthma - Inhaler in school backpack",
      created_at: now,
      updated_at: now,
    });
    logger.info(`✔ Band #1 seeded: Sophia Band Pro`);

    // ─── 3. Band #2 — Liam ────────────────────────────────────────
    const band2 = await db.collection("bands").insertOne({
      nickname: "Liam Watch Band",
      owner_user_id: parentId,
      status: "safe",
      safe_radius_m: 200,
      warning_radius_m: 400,
      last_lat: 37.7752,
      last_lng: -122.4201,
      battery_pct: 92,
      last_ping_at: now,
      profile_completed: true,
      created_at: now,
      updated_at: now,
    });
    const band2Id = band2.insertedId;

    const secret2 = await bcrypt.hash("device-secret-liam-002", 12);
    await db.collection("device_credentials").insertOne({
      band_id: band2Id,
      device_secret: secret2,
      device_type: "simulator",
      status: "active",
      last_used_at: now,
      created_at: now,
    });

    await db.collection("child_profiles").insertOne({
      band_id: band2Id,
      name: "Liam Chen",
      age: 5,
      photo_url: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=120&h=120&fit=crop&auto=format",
      notes: "Peanut allergy",
      created_at: now,
      updated_at: now,
    });
    logger.info(`✔ Band #2 seeded: Liam Watch Band`);

    // ─── 4. Saved Locations (Safe Zones) ───────────────────────────
    await db.collection("saved_locations").insertMany([
      {
        band_id: band1Id,
        name: "Lincoln Elementary School",
        lat: 37.7749,
        lng: -122.4194,
        radius_m: 150,
        safe_radius_m: null,
        warning_radius_m: null,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        band_id: band1Id,
        name: "Home — Pine Ave",
        lat: 37.7833,
        lng: -122.4167,
        radius_m: 100,
        safe_radius_m: null,
        warning_radius_m: null,
        is_active: false,
        created_at: now,
        updated_at: now,
      },
      {
        band_id: band2Id,
        name: "Sunshine Preschool",
        lat: 37.7752,
        lng: -122.4201,
        radius_m: 200,
        safe_radius_m: null,
        warning_radius_m: null,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);
    logger.info(`✔ 3 saved locations (safe zones) seeded`);

    // ─── 5. Location Pings (initial telemetry) ────────────────────
    await db.collection("location_pings").insertMany([
      {
        band_id: band1Id, lat: 37.7749, lng: -122.4194,
        battery_pct: 88, timestamp: now, received_at: now,
      },
      {
        band_id: band2Id, lat: 37.7752, lng: -122.4201,
        battery_pct: 92, timestamp: now, received_at: now,
      },
    ]);
    logger.info(`✔ 2 initial location pings seeded`);

    // ─── 6. Activity Logs ──────────────────────────────────────────
    await db.collection("activity_logs").insertMany([
      {
        band_id: band1Id,
        user_id: parentId,
        type: "zone_entered_safe",
        details: { fromStatus: "offline", toStatus: "safe", lat: 37.7749, lng: -122.4194 },
        created_at: new Date(Date.now() - 3600000),
      },
      {
        band_id: band2Id,
        user_id: parentId,
        type: "zone_entered_safe",
        details: { fromStatus: "offline", toStatus: "safe", lat: 37.7752, lng: -122.4201 },
        created_at: new Date(Date.now() - 7200000),
      },
      {
        band_id: band1Id,
        user_id: parentId,
        type: "profile_completed",
        details: { childName: "Sophia Chen" },
        created_at: new Date(Date.now() - 86400000),
      },
      {
        band_id: band2Id,
        user_id: parentId,
        type: "profile_completed",
        details: { childName: "Liam Chen" },
        created_at: new Date(Date.now() - 86400000),
      },
    ]);
    logger.info(`✔ 4 activity logs seeded`);

    // ─── Done ──────────────────────────────────────────────────────
    logger.info("════════════════════════════════════════");
    logger.info("  DATABASE SEED COMPLETED SUCCESSFULLY");
    logger.info("════════════════════════════════════════");
    logger.info(`  Parent:  sarah@example.com / password123`);
    logger.info(`  Bands:   Sophia Band Pro, Liam Watch Band`);
    logger.info(`  Zones:   Lincoln School (active), Home, Sunshine Preschool (active)`);
    logger.info("════════════════════════════════════════");

    process.exit(0);
  } catch (error) {
    logger.error("Seed failed:", error);
    process.exit(1);
  }
};

seedDatabase();
