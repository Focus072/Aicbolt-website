// Test script to add leads with zipcode and categoryId for testing
const postgres = require('postgres');

const sql = postgres({
  host: 'localhost',
  port: 54322,
  database: 'postgres',
  username: 'postgres',
  password: 'postgres',
});

async function addTestLeads() {
  try {
    console.log('🧪 Adding test leads with zipcode and categoryId...');
    
    const testLeads = [
      {
        place_id: 'test_place_1_' + Date.now(),
        title: 'Test Plumbing Co 1',
        phone: '(555) 111-1111',
        website: 'https://test1.com',
        zipcode: '93308',
        category_id: 1,
        status: 'new'
      },
      {
        place_id: 'test_place_2_' + Date.now(),
        title: 'Test Plumbing Co 2',
        phone: '(555) 222-2222',
        website: 'https://test2.com',
        zipcode: '93308',
        category_id: 1,
        status: 'called'
      },
      {
        place_id: 'test_place_3_' + Date.now(),
        title: 'Test HVAC Co',
        phone: '(555) 333-3333',
        website: 'https://test3.com',
        zipcode: '93309',
        category_id: 2,
        status: 'new'
      }
    ];
    
    for (const lead of testLeads) {
      const result = await sql`
        INSERT INTO leads (place_id, title, phone, website, zipcode, category_id, status, created_at)
        VALUES (${lead.place_id}, ${lead.title}, ${lead.phone}, ${lead.website}, ${lead.zipcode}, ${lead.category_id}, ${lead.status}, NOW())
        ON CONFLICT (place_id) DO UPDATE SET
          title = EXCLUDED.title,
          phone = EXCLUDED.phone,
          website = EXCLUDED.website,
          zipcode = EXCLUDED.zipcode,
          category_id = EXCLUDED.category_id,
          status = EXCLUDED.status
        RETURNING id, title, zipcode, category_id
      `;
      
      console.log(`✅ Added lead: ${result[0].title} | ${result[0].zipcode} | ${result[0].category_id}`);
    }
    
    console.log('\n🎉 Test leads added successfully!');
    console.log('Now check http://localhost:3000/leads-grouped to see them grouped!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Database is not running. Start it with: docker-compose up -d');
    }
  } finally {
    await sql.end();
  }
}

addTestLeads();
