const postgres = require('postgres');

// Database connection based on docker-compose.yml configuration
const sql = postgres('postgresql://postgres:postgres@localhost:54322/postgres', {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

async function fixForeignKeys() {
  console.log('🔧 Fixing foreign key constraints...');
  
  try {
    // Drop existing foreign key constraints
    console.log('🗑️ Dropping existing foreign key constraints...');
    
    await sql`
      ALTER TABLE revenue 
      DROP CONSTRAINT IF EXISTS revenue_client_id_fkey;
    `;
    
    await sql`
      ALTER TABLE projects 
      DROP CONSTRAINT IF EXISTS projects_client_id_fkey;
    `;
    
    await sql`
      ALTER TABLE invoices 
      DROP CONSTRAINT IF EXISTS invoices_client_id_fkey;
    `;
    
    await sql`
      ALTER TABLE client_contacts 
      DROP CONSTRAINT IF EXISTS client_contacts_client_id_fkey;
    `;
    
    console.log('✅ Dropped existing constraints');
    
    // Add new constraints with CASCADE DELETE
    console.log('➕ Adding new constraints with CASCADE DELETE...');
    
    await sql`
      ALTER TABLE revenue 
      ADD CONSTRAINT revenue_client_id_fkey 
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
    `;
    
    await sql`
      ALTER TABLE projects 
      ADD CONSTRAINT projects_client_id_fkey 
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
    `;
    
    await sql`
      ALTER TABLE invoices 
      ADD CONSTRAINT invoices_client_id_fkey 
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
    `;
    
    await sql`
      ALTER TABLE client_contacts 
      ADD CONSTRAINT client_contacts_client_id_fkey 
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
    `;
    
    console.log('✅ Added new constraints with CASCADE DELETE');
    console.log('🎉 Foreign key constraints fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing foreign keys:', error);
  } finally {
    await sql.end();
  }
}

fixForeignKeys();
