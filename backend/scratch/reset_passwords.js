const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetPasswords() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const newPass = '12345678';
        const hash = await bcrypt.hash(newPass, 10);
        
        const usersToReset = ['superadmin', 'admin', 'islamabadunited', 'lahoreqalandars', 'karachiking'];
        
        for (const username of usersToReset) {
            await db.query('UPDATE Users SET password_hash = ? WHERE username = ?', [hash, username]);
            console.log(`Password reset for ${username} to: ${newPass}`);
        }
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await db.end();
    }
}

resetPasswords();
