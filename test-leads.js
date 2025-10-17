const { db } = require('./lib/db/drizzle');
const { leads } = require('./lib/db/schema');

async function testLeads() {
  try {
    console.log('Testing leads table access...');
    
    const result = await db.select().from(leads).limit(1);
    console.log('✅ Leads table exists, found', result.length, 'records');
    
    if (result.length > 0) {
      console.log('Sample lead:', result[0]);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error accessing leads table:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
}

testLeads();

