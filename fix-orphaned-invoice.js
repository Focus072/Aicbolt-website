const postgres = require('postgres');
require('dotenv').config();

async function fixOrphanedInvoice() {
  console.log('🔧 Fixing orphaned invoice record...');

  const sql = postgres(process.env.POSTGRES_URL || 'postgresql://postgres:postgres@localhost:54322/postgres');

  try {
    console.log('✅ Connected to PostgreSQL');

    // Check what invoices exist
    console.log('\n📄 Checking invoices table:');
    const invoices = await sql`SELECT * FROM invoices`;
    console.log('Invoices found:', invoices.length);
    console.log(JSON.stringify(invoices, null, 2));

    // Check what clients exist
    console.log('\n👥 Checking clients table:');
    const clients = await sql`SELECT * FROM clients`;
    console.log('Clients found:', clients.length);
    console.log(JSON.stringify(clients, null, 2));

    // Find orphaned invoices (invoices with client_id that doesn't exist in clients)
    const orphanedInvoices = await sql`
      SELECT i.* 
      FROM invoices i 
      LEFT JOIN clients c ON i.client_id = c.id 
      WHERE i.client_id IS NOT NULL AND c.id IS NULL
    `;

    if (orphanedInvoices.length > 0) {
      console.log('\n⚠️  Found orphaned invoices:', orphanedInvoices.length);
      console.log(JSON.stringify(orphanedInvoices, null, 2));

      // Option 1: Delete orphaned invoices
      console.log('\n🗑️  Deleting orphaned invoices...');
      for (const invoice of orphanedInvoices) {
        await sql`DELETE FROM invoices WHERE id = ${invoice.id}`;
        console.log(`✅ Deleted invoice ${invoice.id} (referenced non-existent client_id: ${invoice.client_id})`);
      }
    } else {
      console.log('\n✅ No orphaned invoices found!');
    }

    console.log('\n✅ Database fix complete!');
    console.log('\nYou can now run: npm run db:push');

  } catch (error) {
    console.error('❌ Error fixing database:', error);
  } finally {
    await sql.end();
  }
}

fixOrphanedInvoice();

