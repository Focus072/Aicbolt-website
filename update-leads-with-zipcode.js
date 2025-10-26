const postgres = require('postgres');

async function updateLeadsWithZipcode() {
  console.log('🚀 Starting leads update with zipcode and category...');
  
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

    // First, let's check if the columns exist
    const columnsExist = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'leads' 
      AND column_name IN ('zipcode', 'category_id')
    `;
    
    console.log('📋 Checking existing columns:', columnsExist);

    // If columns don't exist, add them
    if (columnsExist.length < 2) {
      console.log('🔧 Adding missing columns...');
      
      try {
        await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS zipcode VARCHAR(10)`;
        console.log('✅ Added zipcode column');
      } catch (e) {
        console.log('⚠️ zipcode column might already exist:', e.message);
      }
      
      try {
        await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS category_id INTEGER`;
        console.log('✅ Added category_id column');
      } catch (e) {
        console.log('⚠️ category_id column might already exist:', e.message);
      }
      
      try {
        await sql`CREATE INDEX IF NOT EXISTS idx_leads_zipcode_category ON leads(zipcode, category_id)`;
        console.log('✅ Created index');
      } catch (e) {
        console.log('⚠️ Index might already exist:', e.message);
      }
    }

    // Check how many leads we have
    const totalLeads = await sql`SELECT COUNT(*) as count FROM leads`;
    console.log(`📊 Total leads in database: ${totalLeads[0].count}`);

    // Check how many leads have zipcode and category_id
    const leadsWithData = await sql`
      SELECT COUNT(*) as count 
      FROM leads 
      WHERE zipcode IS NOT NULL AND category_id IS NOT NULL
    `;
    console.log(`📊 Leads with zipcode and category_id: ${leadsWithData[0].count}`);

    // Check how many leads are missing this data
    const leadsMissingData = await sql`
      SELECT COUNT(*) as count 
      FROM leads 
      WHERE zipcode IS NULL OR category_id IS NULL
    `;
    console.log(`📊 Leads missing zipcode/category_id: ${leadsMissingData[0].count}`);

    // Update leads that are missing zipcode/category_id
    // For now, let's set them to a default zipcode and category
    if (leadsMissingData[0].count > 0) {
      console.log('🔧 Updating leads with default zipcode and category...');
      
      // Update leads to have zipcode 93308 and category_id 1 (assuming plumber category)
      const updated = await sql`
        UPDATE leads 
        SET zipcode = '93308', category_id = 1 
        WHERE zipcode IS NULL OR category_id IS NULL
      `;
      
      console.log(`✅ Updated ${updated.count} leads with zipcode 93308 and category_id 1`);
    }

    // Verify the update
    const finalCount = await sql`
      SELECT COUNT(*) as count 
      FROM leads 
      WHERE zipcode IS NOT NULL AND category_id IS NOT NULL
    `;
    console.log(`📊 Final count of leads with zipcode and category_id: ${finalCount[0].count}`);

    // Show some sample leads
    const sampleLeads = await sql`
      SELECT id, title, zipcode, category_id, status, created_at
      FROM leads 
      WHERE zipcode IS NOT NULL AND category_id IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    console.log('📋 Sample leads:');
    sampleLeads.forEach(lead => {
      console.log(`  - ID: ${lead.id}, Title: ${lead.title}, Zipcode: ${lead.zipcode}, Category: ${lead.category_id}, Status: ${lead.status}`);
    });
    
    console.log('🎉 Leads update completed successfully!');
    
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

updateLeadsWithZipcode();
