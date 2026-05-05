require('dotenv').config();
const db = require('../db');

async function main() {
  try {
    console.log("Altering Wishlist table...");
    await db.query(`
      ALTER TABLE Wishlist 
      ADD COLUMN priority ENUM('primary', 'secondary', 'avoid') DEFAULT 'primary'
    `);
    console.log("Successfully added priority column to Wishlist.");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("Priority column already exists.");
    } else {
      console.error("Error altering table:", err);
    }
  } finally {
    process.exit();
  }
}

main();
