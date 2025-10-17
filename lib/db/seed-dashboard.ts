import { db } from './drizzle';
import {
  dashboardMetrics,
  dashboardActivities,
  dashboardStats,
  dashboardAutomations,
} from './schema';

export async function seedDashboardData(teamId: number) {
  try {
    // Seed dashboard metrics
    await db.insert(dashboardMetrics).values({
      teamId,
      totalRevenue: 24567,
      activeUsers: 1234,
      automations: 456,
      aiTasks: 89,
      revenueGrowth: '+12%',
      usersGrowth: '+5%',
      automationsGrowth: '+8%',
      aiTasksGrowth: '+3',
    });

    // Seed dashboard activities
    const activities = [
      {
        teamId,
        title: 'New automation created',
        description: 'Email marketing workflow completed',
        icon: 'DollarSign',
        color: 'green',
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 min ago
      },
      {
        teamId,
        title: 'New user registered',
        description: 'john.doe@example.com joined',
        icon: 'Users',
        color: 'blue',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
      },
      {
        teamId,
        title: 'AI task completed',
        description: 'Data analysis automation finished',
        icon: 'Package',
        color: 'purple',
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 min ago
      },
      {
        teamId,
        title: 'System optimization',
        description: 'Performance boost applied',
        icon: 'Activity',
        color: 'orange',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      },
      {
        teamId,
        title: 'New notification',
        description: 'Automation results ready',
        icon: 'Bell',
        color: 'red',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        teamId,
        title: 'Configuration updated',
        description: 'Email settings modified',
        icon: 'Settings',
        color: 'blue',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      },
      {
        teamId,
        title: 'Analytics report generated',
        description: 'Weekly performance metrics ready',
        icon: 'BarChart3',
        color: 'green',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
    ];

    await db.insert(dashboardActivities).values(activities);

    // Seed dashboard stats
    await db.insert(dashboardStats).values({
      teamId,
      automationRate: 87,
      aiAccuracy: 94,
      taskCompletion: 76,
    });

    // Seed dashboard automations
    const automations = [
      { teamId, name: 'Email Marketing', percentage: 63 },
      { teamId, name: 'Data Processing', percentage: 51 },
      { teamId, name: 'Inventory Management', percentage: 41 },
      { teamId, name: 'Customer Support', percentage: 23 },
    ];

    await db.insert(dashboardAutomations).values(automations);

    console.log('Dashboard data seeded successfully for team:', teamId);
    return true;
  } catch (error) {
    console.error('Error seeding dashboard data:', error);
    return false;
  }
}

