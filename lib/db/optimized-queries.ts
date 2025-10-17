import { db } from './drizzle';
import { users, clients, projects, revenue, expenses } from './schema';
import { eq, desc, sql, count, sum } from 'drizzle-orm';

// Optimized queries with better performance
export async function getOptimizedUser() {
  return await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      role: users.role,
      allowedPages: users.allowedPages,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.isActive, true))
    .limit(1);
}

export async function getOptimizedClients() {
  return await db
    .select({
      id: clients.id,
      name: clients.name,
      email: clients.email,
      phone: clients.phone,
      company: clients.company,
      createdAt: clients.createdAt,
    })
    .from(clients)
    .orderBy(desc(clients.createdAt))
    .limit(10);
}

export async function getOptimizedProjects() {
  return await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      clientId: projects.clientId,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .orderBy(desc(projects.createdAt))
    .limit(10);
}

export async function getOptimizedAnalytics() {
  // Use a single query with aggregations instead of multiple queries
  const [revenueData, expensesData, clientCount, projectCount] = await Promise.all([
    db.select({
      total: sum(revenue.amount).as('total'),
    }).from(revenue),
    
    db.select({
      total: sum(expenses.amount).as('total'),
    }).from(expenses),
    
    db.select({
      count: count().as('count'),
    }).from(clients),
    
    db.select({
      count: count().as('count'),
    }).from(projects),
  ]);

  const totalRevenue = revenueData[0]?.total || 0;
  const totalExpenses = expensesData[0]?.total || 0;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue: Number(totalRevenue),
    totalExpenses: Number(totalExpenses),
    netProfit: Number(netProfit),
    clientCount: Number(clientCount[0]?.count || 0),
    activeProjects: Number(projectCount[0]?.count || 0),
    completedProjects: 0, // Add logic if needed
    profitMargin: Number(profitMargin),
  };
}
