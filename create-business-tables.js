const postgres = require('postgres');

// Connect to the database
const sql = postgres('postgresql://postgres:postgres@localhost:54322/postgres');

async function createBusinessTables() {
  try {
    console.log('Creating business tables...');
    
    // Create revenue table (drop and recreate to ensure correct schema)
    await sql`DROP TABLE IF EXISTS revenue CASCADE;`;
    await sql`
      CREATE TABLE revenue (
        id SERIAL PRIMARY KEY,
        team_id INTEGER NOT NULL REFERENCES teams(id),
        amount INTEGER NOT NULL,
        date TIMESTAMP NOT NULL,
        source VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log('✅ Revenue table created');
    
    // Create expenses table (drop and recreate to ensure correct schema)
    await sql`DROP TABLE IF EXISTS expenses CASCADE;`;
    await sql`
      CREATE TABLE expenses (
        id SERIAL PRIMARY KEY,
        team_id INTEGER NOT NULL REFERENCES teams(id),
        amount INTEGER NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        vendor VARCHAR(255),
        payment_method VARCHAR(50),
        receipt_url TEXT,
        is_recurring BOOLEAN DEFAULT FALSE,
        expense_date TIMESTAMP NOT NULL,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log('✅ Expenses table created');
    
    // Create clients table (drop and recreate to ensure correct schema)
    await sql`DROP TABLE IF EXISTS clients CASCADE;`;
    await sql`
      CREATE TABLE clients (
        id SERIAL PRIMARY KEY,
        team_id INTEGER NOT NULL REFERENCES teams(id),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        company VARCHAR(255),
        address TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log('✅ Clients table created');
    
    // Create projects table (drop and recreate to ensure correct schema)
    await sql`DROP TABLE IF EXISTS projects CASCADE;`;
    await sql`
      CREATE TABLE projects (
        id SERIAL PRIMARY KEY,
        team_id INTEGER NOT NULL REFERENCES teams(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Planning',
        client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
        assigned_to VARCHAR(255),
        stack TEXT,
        monthly_roi DECIMAL(10,2),
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log('✅ Projects table created');
    
    // Insert some sample data for testing
    console.log('Inserting sample data...');
    
    // Get the first team ID
    const teams = await sql`SELECT id FROM teams LIMIT 1`;
    if (teams.length > 0) {
      const teamId = teams[0].id;
      
      // Insert sample client
      await sql`
        INSERT INTO clients (team_id, name, email, company) 
        VALUES (${teamId}, 'Sample Client', 'client@example.com', 'Sample Company')
        ON CONFLICT DO NOTHING;
      `;
      
      // Get the client ID
      const clients = await sql`SELECT id FROM clients WHERE team_id = ${teamId} LIMIT 1`;
      const clientId = clients.length > 0 ? clients[0].id : null;
      
      // Insert sample revenue
      await sql`
        INSERT INTO revenue (team_id, amount, date, source, description, client_id) 
        VALUES (${teamId}, 50000, NOW(), 'Sample Project', 'Initial project payment', ${clientId});
      `;
      
      // Insert sample expenses
      await sql`
        INSERT INTO expenses (team_id, amount, description, category, vendor, expense_date) 
        VALUES 
          (${teamId}, 4900, 'Google Ads Campaign', 'Marketing', 'Google', NOW()),
          (${teamId}, 150000, 'Developer Payment', 'Salaries / Contractors', 'Freelancer', NOW());
      `;
      
      console.log('✅ Sample data inserted');
    }
    
    console.log('🎉 All business tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    await sql.end();
  }
}

createBusinessTables();
