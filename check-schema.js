const postgres = require('postgres');

const sql = postgres({
  host: 'localhost',
  port: 54322,
  database: 'postgres',
  username: 'postgres',
  password: 'postgres',
});

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking if zipcode and category_id columns exist...');
    
    // Check if columns exist
    const columnCheck = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'leads' 
      AND column_name IN ('zipcode', 'category_id')
      ORDER BY column_name
    `;
    
    console.log(`Found ${columnCheck.length} columns:`);
    columnCheck.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });
    
    if (columnCheck.length === 0) {
      console.log('❌ Columns do not exist! Need to run migration.');
      console.log('Run: node run-leads-migration.js');
    } else if (columnCheck.length === 2) {
      console.log('✅ Both columns exist!');
      
      // Check if there are any leads with zipcode and categoryId
      const leadsWithData = await sql`
        SELECT COUNT(*) as count 
        FROM leads 
        WHERE zipcode IS NOT NULL AND category_id IS NOT NULL
      `;
      
      console.log(`Found ${leadsWithData[0].count} leads with zipcode and categoryId`);
      
      // Show sample data
      const sampleLeads = await sql`
        SELECT id, title, zipcode, category_id, status, created_at 
        FROM leads 
        WHERE zipcode IS NOT NULL AND category_id IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 5
      `;
      
      console.log('\nSample leads with zipcode/categoryId:');
      sampleLeads.forEach(lead => {
        console.log(`- ${lead.title} | ${lead.zipcode} | ${lead.category_id} | ${lead.status}`);
      });
    } else {
      console.log('⚠️  Only some columns exist. Check migration.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Database is not running. Start it with: docker-compose up -d');
    }
  } finally {
    await sql.end();
  }
}

checkDatabaseSchema();
