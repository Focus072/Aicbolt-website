const postgres = require('postgres');

async function fixDatabase() {
  console.log('🔧 Fixing database schema...');

  // Use the same connection as your app
  const sql = postgres(process.env.POSTGRES_URL || 'postgresql://postgres:postgres@localhost:54322/postgres');

  try {
    console.log('✅ Connected to PostgreSQL');

    // Add missing columns one by one
    const fixes = [
      // Clients table fixes
      "ALTER TABLE clients ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'active' NOT NULL",
      "ALTER TABLE clients ADD COLUMN IF NOT EXISTS lifetime_value integer DEFAULT 0",
      
      // Projects table fixes  
      "ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type varchar(100) NOT NULL DEFAULT 'Voice AI Agents'",
      "ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget integer DEFAULT 0",
      "ALTER TABLE projects ADD COLUMN IF NOT EXISTS monthly_roi integer DEFAULT 0",
      "ALTER TABLE projects ADD COLUMN IF NOT EXISTS progress_percentage integer DEFAULT 0",
      "ALTER TABLE projects ADD COLUMN IF NOT EXISTS stack text",
      "ALTER TABLE projects ADD COLUMN IF NOT EXISTS assigned_to varchar(255)",
      "ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date timestamp",
      "ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date timestamp",
      "ALTER TABLE projects ADD COLUMN IF NOT EXISTS notes text",
      
      // Revenue table fixes
      "ALTER TABLE revenue ADD COLUMN IF NOT EXISTS payment_status varchar(20) DEFAULT 'pending' NOT NULL",
      "ALTER TABLE revenue ADD COLUMN IF NOT EXISTS category varchar(100) DEFAULT 'General'",
      "ALTER TABLE revenue ADD COLUMN IF NOT EXISTS payment_date timestamp",
      "ALTER TABLE revenue ADD COLUMN IF NOT EXISTS invoice_number varchar(100)",
      "ALTER TABLE revenue ADD COLUMN IF NOT EXISTS notes text",
    ];

    for (const fix of fixes) {
      try {
        await sql.unsafe(fix);
        console.log(`✅ Applied: ${fix.split(' ')[2]} column`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️  Column already exists: ${fix.split(' ')[2]}`);
        } else {
          console.log(`⚠️  Error with ${fix.split(' ')[2]}: ${error.message}`);
        }
      }
    }

    console.log('');
    console.log('🎉 Database schema fixed successfully!');
    console.log('🚀 You can now access your dashboard at http://localhost:3000/dashboard');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Make sure PostgreSQL is running: docker-compose up -d');
    }
  } finally {
    await sql.end();
  }
}

fixDatabase();
