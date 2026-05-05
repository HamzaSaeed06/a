const mysql = require('mysql2/promise');
require('dotenv').config();

async function describeTable() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await db.query('DESCRIBE Users');
        console.log('Users Table Structure:');
        console.table(rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await db.end();
    }
}

describeTable();
