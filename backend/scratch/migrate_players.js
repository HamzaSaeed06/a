const db = require('../db');

async function migrate() {
  try {
    console.log("Adding action_image_url to Players table...");
    await db.query("ALTER TABLE Players ADD COLUMN action_image_url VARCHAR(255) AFTER image_url");
    console.log("Migration successful!");
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log("Column already exists.");
      process.exit(0);
    }
    console.error("Migration failed:", err.message);
    process.exit(1);
  }
}

migrate();
