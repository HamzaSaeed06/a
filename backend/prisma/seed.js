const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const SALT_ROUNDS = 12;

async function seed() {
  const client = new MongoClient(process.env.DATABASE_URL);
  await client.connect();

  const urlParts = process.env.DATABASE_URL.split("/");
  const dbName = urlParts[urlParts.length - 1].split("?")[0];
  const db = client.db(dbName);

  console.log(`Seeding database: ${dbName}`);

  const existing = await db.collection("users").findOne({ email: "admin@example.com" });
  if (existing) {
    console.log("Admin user already exists, skipping seed.");
    await client.close();
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", SALT_ROUNDS);
  const now = new Date();

  const result = await db.collection("users").insertOne({
    email: "admin@example.com",
    password: hashedPassword,
    name: "Admin User",
    created_at: now,
    updated_at: now,
  });

  console.log(`Admin user created: ${result.insertedId}`);
  await client.close();
  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
