const postgres = require('postgres');

// Connect to the database
const sql = postgres('postgresql://postgres:postgres@localhost:54322/postgres');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('revenue', 'expenses', 'clients', 'projects')
      ORDER BY table_name;
    `;
    
    console.log('Existing tables:', tables);
    
    // Test if we can query the expenses table
    if (tables.some(t => t.table_name === 'expenses')) {
      console.log('Testing expenses table...');
      const expenseCount = await sql`SELECT COUNT(*) FROM expenses`;
      console.log('Expenses count:', expenseCount[0].count);
    }
    
    // Test if we can query the revenue table
    if (tables.some(t => t.table_name === 'revenue')) {
      console.log('Testing revenue table...');
      const revenueCount = await sql`SELECT COUNT(*) FROM revenue`;
      console.log('Revenue count:', revenueCount[0].count);
    }
    
    // Test if we can query the clients table
    if (tables.some(t => t.table_name === 'clients')) {
      console.log('Testing clients table...');
      const clientCount = await sql`SELECT COUNT(*) FROM clients`;
      console.log('Clients count:', clientCount[0].count);
    }
    
  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    await sql.end();
  }
}

testDatabase();
