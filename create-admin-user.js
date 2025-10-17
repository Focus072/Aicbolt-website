const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    console.log('🔐 Creating admin user...');

    // Hash the password
    const passwordHash = await bcrypt.hash('admin123', 10);

    // First, create a team for the admin
    const teamResult = await pool.query(`
      INSERT INTO teams (name, created_at, updated_at) 
      VALUES ('Admin Team', NOW(), NOW()) 
      ON CONFLICT DO NOTHING
      RETURNING id
    `);

    let teamId;
    if (teamResult.rows.length > 0) {
      teamId = teamResult.rows[0].id;
    } else {
      // Get existing team ID
      const existingTeam = await pool.query('SELECT id FROM teams LIMIT 1');
      teamId = existingTeam.rows[0].id;
    }

    // Create the admin user
    const userResult = await pool.query(`
      INSERT INTO users (username, name, password_hash, role, organization_id, is_active, created_at, updated_at)
      VALUES ('admin', 'Admin User', $1, 'admin', $2, true, NOW(), NOW())
      ON CONFLICT (username) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
      RETURNING id
    `, [passwordHash, teamId]);

    const userId = userResult.rows[0].id;

    // Add user to team
    await pool.query(`
      INSERT INTO team_members (user_id, team_id, role, joined_at)
      VALUES ($1, $2, 'admin', NOW())
      ON CONFLICT DO NOTHING
    `, [userId, teamId]);

    console.log('✅ Admin user created successfully!');
    console.log('📧 Username: admin');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

createAdminUser();
