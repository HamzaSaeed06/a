const mysql = require('mysql2/promise');
require('dotenv').config();

async function update() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  await conn.query("UPDATE Countries SET country_code = 'PK' WHERE country_name = 'Pakistan'");
  console.log('Updated Pakistan code to PK');
  process.exit(0);
}

update().catch(err => {
  console.error(err);
  process.exit(1);
});
