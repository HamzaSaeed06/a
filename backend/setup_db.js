const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runSetup() {
  try {
    const connection = await mysql.createConnection({
      host:     process.env.DB_HOST,
      port:     process.env.DB_PORT || 3306,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL Server');

    const sqlFile = path.join(__dirname, '..', 'database', 'auction_db_complete.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    console.log('⏳ Running full database setup...');

    // mysql2 does not support DELIMITER keyword — strip it out
    const cleanSql = sqlContent
      .replace(/DELIMITER \$\$/g, '')
      .replace(/DELIMITER ;/g, '')
      .replace(/\$\$/g, ';');

    await connection.query(cleanSql);

    console.log('🎉 Auction Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

runSetup();
