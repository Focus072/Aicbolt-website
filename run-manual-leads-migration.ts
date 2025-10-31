import { db } from './lib/db/drizzle';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    console.log('Running migration: Add is_manual column to leads table...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'lib/db/migrations/0005_add_is_manual_to_leads.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await db.execute(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('- Added is_manual column to leads table');
    console.log('- Created index for better performance');
    console.log('- Updated existing leads to mark them as non-manual');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

