const postgres = require('postgres');

async function runMigration() {
  console.log('🚀 Starting leads migration...');
  
  // Database connection
  const sql = postgres({
    host: 'localhost',
    port: 54322,
    database: 'postgres',
    username: 'postgres',
    password: 'postgres',
  });

  try {
    console.log('✅ Connected to PostgreSQL');

    // Add zipcode column
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS zipcode VARCHAR(10)`;
    console.log('✅ Added zipcode column');
    
    // Add category_id column
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id)`;
    console.log('✅ Added category_id column');
    
    // Create index
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_zipcode_category ON leads(zipcode, category_id)`;
    console.log('✅ Created index');
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
