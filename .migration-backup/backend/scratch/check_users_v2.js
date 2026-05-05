const db = require('../db');

async function checkUsers() {
    try {
        const [rows] = await db.query('SELECT user_id, username, email, is_active FROM Users');
        console.log('All Users:');
        console.table(rows);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit();
    }
}

checkUsers();
