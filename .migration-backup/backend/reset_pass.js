const bcrypt = require('bcryptjs');
const db = require('./db');

async function reset() {
    const hash = await bcrypt.hash('password123', 12);
    await db.query('UPDATE Users SET password_hash = ? WHERE username = "superadmin"', [hash]);
    console.log("✅ Super Admin password reset to: password123");
    process.exit();
}
reset();
