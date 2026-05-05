const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'backend/.env' });

async function migrate() {
  const pool = mysql.createPool({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:     process.env.DB_PORT || 3306,
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Wishlist (
        wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
        player_id INT NOT NULL,
        team_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(player_id, team_id),
        FOREIGN KEY (player_id) REFERENCES Players(player_id) ON DELETE CASCADE,
        FOREIGN KEY (team_id) REFERENCES Teams(team_id) ON DELETE CASCADE
      )
    `);
    console.log("Wishlist table created successfully.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    await pool.end();
  }
}

migrate();
