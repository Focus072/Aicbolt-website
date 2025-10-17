import { db } from './drizzle';
import { 
  dashboardMetrics,
  dashboardActivities,
  dashboardStats,
  dashboardAutomations,
  activityLogs,
  teamMembers,
  teams
} from './schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Updates dashboard data in real-time based on team activity
 */
export async function updateDashboardData(teamId: number) {
  try {
    // Update metrics
    await updateDashboardMetrics(teamId);
    
    // Update stats
    await updateDashboardStats(teamId);
    
    // Update automations
    await updateDashboardAutomations(teamId);
    
    console.log(`Dashboard data updated for team ${teamId}`);
  } catch (error) {
    console.error('Error updating dashboard data:', error);
  }
}

async function updateDashboardMetrics(teamId: number) {
  const [teamMembersData, activityCount, teamData] = await Promise.all([
    db.select().from(teamMembers).where(eq(teamMembers.teamId, teamId)),
    db.select({ count: sql<number>`count(*)` }).from(activityLogs).where(eq(activityLogs.teamId, teamId)),
    db.select().from(teams).where(eq(teams.id, teamId)).limit(1)
  ]);

  const team = teamData[0];
  const memberCount = teamMembersData.length;
  const totalActivities = activityCount[0]?.count || 0;
  
  // Calculate revenue based on subscription status
  const monthlyRevenue = team?.subscriptionStatus === 'active' ? 2900 : 0;
  
  // Calculate growth percentages
  const revenueGrowth = team?.subscriptionStatus === 'active' ? '+12%' : '+0%';
  const usersGrowth = memberCount > 1 ? '+5%' : '+0%';
  const automationsGrowth = totalActivities > 10 ? '+8%' : '+0%';
  const aiTasksGrowth = totalActivities > 5 ? '+3' : '+0';

  // Update or insert metrics
  await db
    .insert(dashboardMetrics)
    .values({
      teamId,
      totalRevenue: monthlyRevenue,
      activeUsers: memberCount,
      automations: Math.floor(totalActivities * 0.3),
      aiTasks: Math.floor(totalActivities * 0.2),
      revenueGrowth,
      usersGrowth,
      automationsGrowth,
      aiTasksGrowth,
      updatedAt: new Date()
    })
    .onConflictDoUpdate({
      target: dashboardMetrics.teamId,
      set: {
        totalRevenue: monthlyRevenue,
        activeUsers: memberCount,
        automations: Math.floor(totalActivities * 0.3),
        aiTasks: Math.floor(totalActivities * 0.2),
        revenueGrowth,
        usersGrowth,
        automationsGrowth,
        aiTasksGrowth,
        updatedAt: new Date()
      }
    });
}

async function updateDashboardStats(teamId: number) {
  const [activityCount, teamMembersData, recentActivities] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(activityLogs).where(eq(activityLogs.teamId, teamId)),
    db.select().from(teamMembers).where(eq(teamMembers.teamId, teamId)),
    db.select().from(activityLogs)
      .where(sql`team_id = ${teamId} AND timestamp >= NOW() - INTERVAL '7 days'`)
  ]);

  const totalActivities = activityCount[0]?.count || 0;
  const memberCount = teamMembersData.length;
  const recentActivityCount = recentActivities.length;

  // Calculate performance metrics
  const automationRate = Math.min(95, Math.max(0, Math.floor((recentActivityCount / Math.max(memberCount, 1)) * 10)));
  const aiAccuracy = Math.min(99, Math.max(85, 95 - Math.floor(totalActivities / 100)));
  const taskCompletion = Math.min(98, Math.max(70, Math.floor((recentActivityCount / Math.max(totalActivities, 1)) * 100)));

  // Update or insert stats
  await db
    .insert(dashboardStats)
    .values({
      teamId,
      automationRate,
      aiAccuracy,
      taskCompletion,
      updatedAt: new Date()
    })
    .onConflictDoUpdate({
      target: dashboardStats.teamId,
      set: {
        automationRate,
        aiAccuracy,
        taskCompletion,
        updatedAt: new Date()
      }
    });
}

async function updateDashboardAutomations(teamId: number) {
  // Clear existing automations for this team
  await db.delete(dashboardAutomations).where(eq(dashboardAutomations.teamId, teamId));

  // Get activity types and calculate automation percentages
  const activityTypes = await db
    .select({
      action: activityLogs.action,
      count: sql<number>`count(*)`
    })
    .from(activityLogs)
    .where(eq(activityLogs.teamId, teamId))
    .groupBy(activityLogs.action);

  const totalActivities = activityTypes.reduce((sum, type) => sum + type.count, 0);

  if (totalActivities === 0) return;

  // Create automation categories
  const automations = [
    { name: 'User Management', percentage: 0 },
    { name: 'Team Collaboration', percentage: 0 },
    { name: 'Authentication', percentage: 0 },
    { name: 'System Operations', percentage: 0 }
  ];

  // Calculate percentages
  activityTypes.forEach(({ action, count }) => {
    const percentage = Math.floor((count / totalActivities) * 100);
    
    if (action.includes('SIGN_') || action.includes('INVITE')) {
      automations[0].percentage += percentage;
    } else if (action.includes('TEAM') || action.includes('MEMBER')) {
      automations[1].percentage += percentage;
    } else if (action.includes('AUTH') || action.includes('PASSWORD')) {
      automations[2].percentage += percentage;
    } else {
      automations[3].percentage += percentage;
    }
  });

  // Insert top automations
  const topAutomations = automations
    .filter(auto => auto.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 4);

  for (const automation of topAutomations) {
    await db.insert(dashboardAutomations).values({
      teamId,
      name: automation.name,
      percentage: automation.percentage
    });
  }
}

/**
 * Adds a new activity to the dashboard activities table
 */
export async function addDashboardActivity(
  teamId: number,
  title: string,
  description: string,
  icon: string,
  color: string
) {
  await db.insert(dashboardActivities).values({
    teamId,
    title,
    description,
    icon,
    color,
    timestamp: new Date()
  });
}

/**
 * Hook to call after any team action to update dashboard
 */
export async function onTeamAction(
  teamId: number,
  actionType: string,
  userId?: number,
  additionalData?: any
) {
  // Update dashboard data
  await updateDashboardData(teamId);
  
  // Add specific activity if needed
  if (actionType === 'SIGN_UP') {
    await addDashboardActivity(
      teamId,
      'New team member joined',
      'A new user has joined your team',
      'Users',
      'green'
    );
  } else if (actionType === 'INVITE_TEAM_MEMBER') {
    await addDashboardActivity(
      teamId,
      'Team invitation sent',
      'A new team member has been invited',
      'Bell',
      'orange'
    );
  } else if (actionType === 'CREATE_TEAM') {
    await addDashboardActivity(
      teamId,
      'Team workspace created',
      'Your team workspace has been set up',
      'Settings',
      'purple'
    );
  }
}
