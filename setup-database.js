const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection config
const client = new Client({
  host: 'localhost',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
});

async function setupDatabase() {
  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    console.log('Connected successfully!');

    // Read and execute the migration
    console.log('Running dashboard tables migration...');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'lib', 'db', 'migrations', '0001_dashboard_tables.sql'),
      'utf8'
    );
    
    await client.query(migrationSQL);
    console.log('✅ Dashboard tables created successfully!');

    // Check if we have any teams
    const teamsResult = await client.query('SELECT id, name FROM teams LIMIT 1');
    
    if (teamsResult.rows.length > 0) {
      const team = teamsResult.rows[0];
      console.log(`Found team: ${team.name} (ID: ${team.id})`);
      
      // Check if dashboard data already exists
      const existingMetrics = await client.query(
        'SELECT id FROM dashboard_metrics WHERE team_id = $1',
        [team.id]
      );
      
      if (existingMetrics.rows.length === 0) {
        console.log('Seeding dashboard data...');
        
        // Insert dashboard metrics
        await client.query(`
          INSERT INTO dashboard_metrics (team_id, total_revenue, active_users, automations, ai_tasks, revenue_growth, users_growth, automations_growth, ai_tasks_growth)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [team.id, 24567, 1234, 456, 89, '+12%', '+5%', '+8%', '+3']);

        // Insert dashboard activities
        const activities = [
          [team.id, 'New automation created', 'Email marketing workflow completed', 'DollarSign', 'green'],
          [team.id, 'New user registered', 'john.doe@example.com joined', 'Users', 'blue'],
          [team.id, 'AI task completed', 'Data analysis automation finished', 'Package', 'purple'],
          [team.id, 'System optimization', 'Performance boost applied', 'Activity', 'orange'],
          [team.id, 'New notification', 'Automation results ready', 'Bell', 'red'],
          [team.id, 'Configuration updated', 'Email settings modified', 'Settings', 'blue'],
          [team.id, 'Analytics report generated', 'Weekly performance metrics ready', 'BarChart3', 'green']
        ];

        for (const activity of activities) {
          await client.query(`
            INSERT INTO dashboard_activities (team_id, title, description, icon, color)
            VALUES ($1, $2, $3, $4, $5)
          `, activity);
        }

        // Insert dashboard stats
        await client.query(`
          INSERT INTO dashboard_stats (team_id, automation_rate, ai_accuracy, task_completion)
          VALUES ($1, $2, $3, $4)
        `, [team.id, 87, 94, 76]);

        // Insert dashboard automations
        const automations = [
          [team.id, 'Email Marketing', 63],
          [team.id, 'Data Processing', 51],
          [team.id, 'Inventory Management', 41],
          [team.id, 'Customer Support', 23]
        ];

        for (const automation of automations) {
          await client.query(`
            INSERT INTO dashboard_automations (team_id, name, percentage)
            VALUES ($1, $2, $3)
          `, automation);
        }

        console.log('✅ Dashboard data seeded successfully!');
      } else {
        console.log('Dashboard data already exists for this team.');
      }
    } else {
      console.log('No teams found. Please create a user account first.');
    }

    console.log('🎉 Database setup complete!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

setupDatabase();
