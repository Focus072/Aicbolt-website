const postgres = require('postgres');

const sql = postgres({
  host: 'localhost',
  port: 54322,
  database: 'postgres',
  username: 'postgres',
  password: 'postgres',
});

async function checkLeads() {
  try {
    console.log('🔍 Checking leads with zipcode 93308 and categoryId 1...');
    const leads = await sql`
      SELECT id, title, zipcode, category_id, status, created_at 
      FROM leads 
      WHERE zipcode = '93308' AND category_id = 1
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    console.log(`Found ${leads.length} leads:`);
    leads.forEach(lead => {
      console.log(`- ${lead.title} | ${lead.zipcode} | ${lead.category_id} | ${lead.status} | ${lead.created_at}`);
    });
    
    console.log('\n🔍 Checking all leads with zipcode 93308...');
    const all93308 = await sql`
      SELECT id, title, zipcode, category_id, status, created_at 
      FROM leads 
      WHERE zipcode = '93308'
      ORDER BY created_at DESC
    `;
    
    console.log(`Found ${all93308.length} total leads for zipcode 93308:`);
    all93308.forEach(lead => {
      console.log(`- ${lead.title} | ${lead.zipcode} | ${lead.category_id} | ${lead.status} | ${lead.created_at}`);
    });

    console.log('\n🔍 Checking recent leads (last 5)...');
    const recent = await sql`
      SELECT id, title, zipcode, category_id, status, created_at 
      FROM leads 
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    console.log(`Found ${recent.length} recent leads:`);
    recent.forEach(lead => {
      console.log(`- ${lead.title} | ${lead.zipcode} | ${lead.category_id} | ${lead.status} | ${lead.created_at}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
}

checkLeads();

