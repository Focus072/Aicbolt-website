const postgres = require('postgres');
require('dotenv').config();

async function backupData() {
  console.log('📦 Creating data backup...');

  const sql = postgres(process.env.POSTGRES_URL || 'postgresql://postgres:postgres@localhost:54322/postgres');

  try {
    console.log('✅ Connected to PostgreSQL');

    // Backup revenue table
    const revenueData = await sql`SELECT * FROM revenue`;
    console.log('💰 Revenue records backed up:', revenueData.length);
    console.log(JSON.stringify(revenueData, null, 2));

    // Backup invoices table
    const invoicesData = await sql`SELECT * FROM invoices`;
    console.log('📄 Invoice records backed up:', invoicesData.length);
    console.log(JSON.stringify(invoicesData, null, 2));

    // Backup clients table
    const clientsData = await sql`SELECT * FROM clients`;
    console.log('👥 Client records backed up:', clientsData.length);
    console.log(JSON.stringify(clientsData, null, 2));

    console.log('\n✅ Backup complete! Copy this output to a safe place.');
    console.log('You can now proceed with the migration.');

  } catch (error) {
    console.error('❌ Error backing up data:', error);
  } finally {
    await sql.end();
  }
}

backupData();

