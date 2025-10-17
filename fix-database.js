const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

async function fixDatabase() {
  console.log('🔧 Fixing database schema...');

  // Use the same connection config as your app
  const sql = postgres(process.env.POSTGRES_URL || 'postgresql://postgres:postgres@localhost:54322/postgres');

  try {
    console.log('✅ Connected to PostgreSQL');

    // Read and execute the business migration
    const migrationPath = path.join(__dirname, 'lib', 'db', 'migrations', '0002_business_control_center.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Creating business tables...');
    await sql.unsafe(migrationSQL);
    console.log('✅ Business tables created successfully!');

    // Check if we have teams and seed data if needed
    const teamsResult = await sql`SELECT id, name FROM teams LIMIT 1`;

    if (teamsResult.length > 0) {
      const team = teamsResult[0];
      console.log(`👥 Found team: ${team.name} (ID: ${team.id})`);

      // Check if sample data already exists
      const existingClients = await sql`SELECT id FROM clients WHERE team_id = ${team.id}`;

      if (existingClients.length === 0) {
        console.log('🌱 Seeding sample business data...');

        // Insert sample clients
        await sql`
          INSERT INTO clients (team_id, name, email, company, phone, status, lifetime_value, notes)
          VALUES
            (${team.id}, 'Acme Corporation', 'contact@acme.com', 'Acme Corp', '555-0001', 'active', 50000, 'Major client - voice AI project'),
            (${team.id}, 'TechStart Inc', 'hello@techstart.io', 'TechStart', '555-0002', 'active', 25000, 'Automation workflows client'),
            (${team.id}, 'Real Estate Plus', 'info@realestate.com', 'RE Plus', '555-0003', 'lead', 0, 'Potential property management bot client')
        `;

        const clients = await sql`SELECT id FROM clients WHERE team_id = ${team.id}`;

        // Insert sample revenue
        await sql`
          INSERT INTO revenue (team_id, client_id, amount, description, payment_status, payment_date)
          VALUES
            (${team.id}, ${clients[0].id}, 500000, 'Voice AI Agent Development', 'paid', NOW() - INTERVAL '15 days'),
            (${team.id}, ${clients[1].id}, 350000, 'Automation Workflow Setup', 'paid', NOW() - INTERVAL '30 days'),
            (${team.id}, ${clients[0].id}, 200000, 'Monthly Maintenance Fee', 'pending', NULL)
        `;

        // Insert sample expenses
        await sql`
          INSERT INTO expenses (team_id, amount, description, category, vendor, expense_date)
          VALUES
            (${team.id}, 9900, 'Vapi API Credits', 'Subscriptions / SaaS', 'Vapi', NOW() - INTERVAL '5 days'),
            (${team.id}, 4900, 'Google Ads Campaign', 'Marketing', 'Google', NOW() - INTERVAL '10 days'),
            (${team.id}, 150000, 'Developer Payment', 'Salaries / Contractors', 'Freelancer', NOW() - INTERVAL '20 days'),
            (${team.id}, 2000, 'Twilio Credits', 'Client Projects', 'Twilio', NOW() - INTERVAL '3 days')
        `;

        // Insert sample projects
        await sql`
          INSERT INTO projects (team_id, client_id, name, description, project_type, status, stack, monthly_roi, budget, progress_percentage)
          VALUES
            (${team.id}, ${clients[0].id}, 'Customer Service Voice Bot', 'AI phone agent for customer support', 'Voice AI Agents', 'In Progress', 'Vapi, Twilio, OpenAI', 800000, 500000, 65),
            (${team.id}, ${clients[1].id}, 'Invoice Processing Automation', 'Automated invoice data extraction', 'Data Extraction & Parsing', 'Deployed', 'n8n, OCR, Airtable', 500000, 350000, 100),
            (${team.id}, ${clients[0].id}, 'CRM Integration', 'Connect systems to CRM', 'Custom Integrations', 'Planning', 'Zapier, APIs', 300000, 200000, 10)
        `;

        // Insert sample invoices
        await sql`
          INSERT INTO invoices (team_id, client_id, invoice_number, amount, status, issue_date, due_date)
          VALUES
            (${team.id}, ${clients[0].id}, 'INV-001', 500000, 'paid', NOW() - INTERVAL '30 days', NOW() - INTERVAL '15 days'),
            (${team.id}, ${clients[1].id}, 'INV-002', 350000, 'paid', NOW() - INTERVAL '45 days', NOW() - INTERVAL '30 days'),
            (${team.id}, ${clients[0].id}, 'INV-003', 200000, 'pending', NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days')
        `;

        console.log('✅ Sample business data seeded successfully!');
      } else {
        console.log('ℹ️  Business data already exists for this team.');
      }
    } else {
      console.log('⚠️ No teams found. Please create a team first to seed business data.');
    }

    console.log('');
    console.log('🎉 Database fix completed successfully!');
    console.log('🚀 You can now access your dashboard at http://localhost:3000/dashboard');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Make sure PostgreSQL is running: docker-compose up -d');
    }
  } finally {
    await sql.end();
  }
}

fixDatabase();
