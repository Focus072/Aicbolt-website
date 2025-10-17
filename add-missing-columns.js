const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

async function addMissingColumns() {
  console.log('🔧 Adding missing columns to existing tables...');

  // Use the same connection config as your app
  const sql = postgres(process.env.POSTGRES_URL || 'postgresql://postgres:postgres@localhost:54322/postgres');

  try {
    console.log('✅ Connected to PostgreSQL');

    // Add missing columns to existing tables
    console.log('📝 Adding missing columns...');

    // Add status column to clients table if it doesn't exist
    try {
      await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'active' NOT NULL`;
      console.log('✅ Added status column to clients table');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  status column already exists in clients table');
      } else {
        console.log('⚠️  Could not add status to clients:', error.message);
      }
    }

    // Add project_type column to projects table if it doesn't exist
    try {
      await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type varchar(100) NOT NULL DEFAULT 'Voice AI Agents'`;
      console.log('✅ Added project_type column to projects table');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  project_type column already exists in projects table');
      } else {
        console.log('⚠️  Could not add project_type to projects:', error.message);
      }
    }

    // Add payment_status column to revenue table if it doesn't exist
    try {
      await sql`ALTER TABLE revenue ADD COLUMN IF NOT EXISTS payment_status varchar(20) DEFAULT 'pending' NOT NULL`;
      console.log('✅ Added payment_status column to revenue table');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  payment_status column already exists in revenue table');
      } else {
        console.log('⚠️  Could not add payment_status to revenue:', error.message);
      }
    }

    // Add budget column to projects table if it doesn't exist
    try {
      await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget integer DEFAULT 0`;
      console.log('✅ Added budget column to projects table');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  budget column already exists in projects table');
      } else {
        console.log('⚠️  Could not add budget to projects:', error.message);
      }
    }

    // Add category column to revenue table if it doesn't exist
    try {
      await sql`ALTER TABLE revenue ADD COLUMN IF NOT EXISTS category varchar(100) DEFAULT 'General'`;
      console.log('✅ Added category column to revenue table');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  category column already exists in revenue table');
      } else {
        console.log('⚠️  Could not add category to revenue:', error.message);
      }
    }

    // Add other missing columns that might be needed
    try {
      await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS monthly_roi integer DEFAULT 0`;
      console.log('✅ Added monthly_roi column to projects table');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  monthly_roi column already exists in projects table');
      }
    }

    try {
      await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS progress_percentage integer DEFAULT 0`;
      console.log('✅ Added progress_percentage column to projects table');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  progress_percentage column already exists in projects table');
      }
    }

    try {
      await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS stack text`;
      console.log('✅ Added stack column to projects table');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  stack column already exists in projects table');
      }
    }

    try {
      await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS assigned_to varchar(255)`;
      console.log('✅ Added assigned_to column to projects table');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  assigned_to column already exists in projects table');
      }
    }

    try {
      await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date timestamp`;
      console.log('✅ Added start_date column to projects table');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  start_date column already exists in projects table');
      }
    }

    try {
      await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date timestamp`;
      console.log('✅ Added end_date column to projects table');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  end_date column already exists in projects table');
      }
    }

    try {
      await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS notes text`;
      console.log('✅ Added notes column to projects table');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  notes column already exists in projects table');
      }
    }

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
    console.log('🎉 Database columns added successfully!');
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

addMissingColumns();
