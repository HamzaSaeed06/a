require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../db');

async function fixColumn() {
  try {
    console.log('⏳ Altering Countries table...');
    await db.query('ALTER TABLE Countries MODIFY COLUMN country_code VARCHAR(20)');
    console.log('✅ Successfully increased country_code length to 20.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error altering table:', err.message);
    process.exit(1);
  }
}

fixColumn();
