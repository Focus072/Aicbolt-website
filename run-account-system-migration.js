const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigrations() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await client.connect();
    console.log('✓ Connected to database\n');

    // Migration 1: Recreate leads table
    console.log('📊 Step 1: Setting up leads table...');
    const leadsMigration = fs.readFileSync(
      path.join(__dirname, 'lib', 'db', 'migrations', '0003_recreate_leads_table.sql'),
      'utf8'
    );
    await client.query(leadsMigration);
    console.log('✓ Leads table created\n');

    // Migration 2: Add user permissions
    console.log('👥 Step 2: Adding user permission fields...');
    const usersMigration = fs.readFileSync(
      path.join(__dirname, 'lib', 'db', 'migrations', '0004_add_user_permissions.sql'),
      'utf8'
    );
    await client.query(usersMigration);
    console.log('✓ User permissions added\n');

    console.log('✅ All migrations completed successfully!');
    console.log('\n📌 Next Steps:');
    console.log('1. Set SCRAPER_API_KEY in your .env.local file');
    console.log('2. Access /account page to create user accounts');
    console.log('3. Configure your n8n scraper to send data to /api/leads');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    throw error;
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

runMigrations().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


