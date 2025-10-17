const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🚀 Starting database migration...');
  
  // Database connection
  const sql = postgres({
    host: 'localhost',
    port: 54322,
    database: 'postgres',
    username: 'postgres',
    password: 'postgres',
  });

  try {
    console.log('✅ Connected to PostgreSQL');

    // Read migration file
    const migrationPath = path.join(__dirname, 'lib', 'db', 'migrations', '0001_dashboard_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Running dashboard tables migration...');
    await sql.unsafe(migrationSQL);
    console.log('✅ Dashboard tables created successfully!');

    // Check for existing teams
    const teamsResult = await sql`SELECT id, name FROM teams LIMIT 1`;
    
    if (teamsResult.length > 0) {
      const team = teamsResult[0];
      console.log(`👥 Found team: ${team.name} (ID: ${team.id})`);
      
      // Check if dashboard data exists
      const existingData = await sql`
        SELECT id FROM dashboard_metrics WHERE team_id = ${team.id}
      `;
      
      if (existingData.length === 0) {
        console.log('🌱 Seeding dashboard data...');
        
        // Insert sample data
        await sql`
          INSERT INTO dashboard_metrics (team_id, total_revenue, active_users, automations, ai_tasks, revenue_growth, users_growth, automations_growth, ai_tasks_growth)
          VALUES (${team.id}, ${24567}, ${1234}, ${456}, ${89}, ${'+12%'}, ${'+5%'}, ${'+8%'}, ${'+3'})
        `;

        // Insert activities
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
          await sql`
            INSERT INTO dashboard_activities (team_id, title, description, icon, color)
            VALUES (${activity[0]}, ${activity[1]}, ${activity[2]}, ${activity[3]}, ${activity[4]})
          `;
        }

        // Insert stats
        await sql`
          INSERT INTO dashboard_stats (team_id, automation_rate, ai_accuracy, task_completion)
          VALUES (${team.id}, ${87}, ${94}, ${76})
        `;

        // Insert automations
        const automations = [
          [team.id, 'Email Marketing', 63],
          [team.id, 'Data Processing', 51],
          [team.id, 'Inventory Management', 41],
          [team.id, 'Customer Support', 23]
        ];

        for (const automation of automations) {
          await sql`
            INSERT INTO dashboard_automations (team_id, name, percentage)
            VALUES (${automation[0]}, ${automation[1]}, ${automation[2]})
          `;
        }

        console.log('✅ Dashboard data seeded successfully!');
      } else {
        console.log('ℹ️  Dashboard data already exists for this team.');
      }
    } else {
      console.log('⚠️  No teams found. Please create a user account first.');
    }

    console.log('🎉 Migration completed successfully!');
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

runMigration();
