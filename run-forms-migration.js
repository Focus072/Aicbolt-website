const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Running web_form_submissions migration...');

    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'lib/db/migrations/0003_web_form_submissions.sql'),
      'utf8'
    );

    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('   - Created submission_status enum');
    console.log('   - Created web_form_submissions table');
    console.log('   - Created indexes for performance');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

