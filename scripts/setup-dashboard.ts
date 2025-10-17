import { seedDashboardData } from '../lib/db/seed-dashboard';
import { getTeamForUser } from '../lib/db/queries';

async function main() {
  try {
    console.log('Setting up dashboard data...');
    
    // Get the current user's team
    const team = await getTeamForUser();
    
    if (!team) {
      console.error('No team found. Please create a team first.');
      process.exit(1);
    }

    console.log(`Found team: ${team.name} (ID: ${team.id})`);
    
    // Seed dashboard data for the team
    const success = await seedDashboardData(team.id);
    
    if (success) {
      console.log('✅ Dashboard data setup complete!');
      process.exit(0);
    } else {
      console.error('❌ Failed to setup dashboard data');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();

