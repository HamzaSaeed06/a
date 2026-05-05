const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsers() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await db.query('SELECT user_id, username, email, is_active FROM Users LIMIT 10');
        console.log('Sample Users:');
        console.table(rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await db.end();
    }
}

checkUsers();
