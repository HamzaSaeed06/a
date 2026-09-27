const { MongoClient, ObjectId } = require("mongodb");
const config = require("../config");
const logger = require("../config/logger");

let client;
let db;

const connectDB = async () => {
  if (db) return db;

  if (!config.databaseUrl) {
    logger.error("CRITICAL ERROR: DATABASE_URL environment variable is not defined!");
    throw new Error("DATABASE_URL environment variable is missing in Render settings!");
  }

  client = new MongoClient(config.databaseUrl, {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    tls: true,
  });



  await client.connect();
  const urlParts = config.databaseUrl.split("/");
  const lastPart = urlParts[urlParts.length - 1] || "";
  const dbName = lastPart.split("?")[0] || "gps_band_dev";
  db = client.db(dbName);

  logger.info(`Connected to MongoDB database: ${dbName}`);


  process.on("SIGINT", async () => {
    await client.close();
    logger.info("MongoDB connection closed");
    process.exit(0);
  });

  return db;
};

const getDB = () => {
  if (!db) throw new Error("Database not connected. Call connectDB() first.");
  return db;
};

const toObjectId = (id) => {
  if (id instanceof ObjectId) return id;
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
};

module.exports = { connectDB, getDB, ObjectId, toObjectId };
