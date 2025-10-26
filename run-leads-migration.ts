import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function runMigration() {
  try {
    console.log('Running leads migration...');
    
    // Add zipcode column
    await db.execute(sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS zipcode VARCHAR(10)`);
    console.log('✅ Added zipcode column');
    
    // Add category_id column
    await db.execute(sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id)`);
    console.log('✅ Added category_id column');
    
    // Create index
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_leads_zipcode_category ON leads(zipcode, category_id)`);
    console.log('✅ Created index');
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
