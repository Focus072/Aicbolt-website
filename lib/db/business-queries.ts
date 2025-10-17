import { db } from './drizzle';
import {
  clients,
  revenue,
  expenses,
  projects,
  invoices,
  invoiceItems,
  clientContacts,
  projectTasks,
  type Client,
  type NewClient,
  type Revenue,
  type NewRevenue,
  type Expense,
  type NewExpense,
  type Project,
  type NewProject,
  type Invoice,
  type NewInvoice,
} from './schema';
import { desc, eq, and, gte, lte, sql } from 'drizzle-orm';
import { getTeamForUser } from './queries';

// ==================== CLIENT QUERIES ====================

export async function getClients(status?: string) {
  const team = await getTeamForUser();
  if (!team) return [];

  try {
    if (status) {
      return await db
        .select()
        .from(clients)
        .where(and(eq(clients.teamId, team.id), eq(clients.status, status)))
        .orderBy(desc(clients.createdAt));
    }

    return await db
      .select()
      .from(clients)
      .where(eq(clients.teamId, team.id))
      .orderBy(desc(clients.createdAt));
  } catch (error) {
    console.error('Error in getClients:', error);
    // Return basic client data without problematic columns
    return await db
      .select({
        id: clients.id,
        teamId: clients.teamId,
        name: clients.name,
        email: clients.email,
        company: clients.company,
        phone: clients.phone,
        address: clients.address,
        notes: clients.notes,
        createdAt: clients.createdAt,
        updatedAt: clients.updatedAt,
      })
      .from(clients)
      .where(eq(clients.teamId, team.id))
      .orderBy(desc(clients.createdAt));
  }
}

export async function getClientById(id: number) {
  const team = await getTeamForUser();
  if (!team) return null;

  const result = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.teamId, team.id)))
    .limit(1);

  return result[0] || null;
}

export async function createClient(data: NewClient) {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  const [client] = await db
    .insert(clients)
    .values({ ...data, teamId: team.id })
    .returning();

  return client;
}

export async function updateClient(id: number, data: Partial<NewClient>) {
  console.log('updateClient called with:', { id, data });
  
  const team = await getTeamForUser();
  console.log('Team found:', team);
  
  if (!team) throw new Error('No team found');

  const [updated] = await db
    .update(clients)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(clients.id, id), eq(clients.teamId, team.id)))
    .returning();

  console.log('Update result:', updated);
  
  if (!updated) {
    throw new Error(`Client with ID ${id} not found or not accessible`);
  }

  return updated;
}

export async function deleteClient(id: number) {
  console.log('deleteClient called with ID:', id);
  
  const team = await getTeamForUser();
  console.log('Team found for delete:', team);
  
  if (!team) throw new Error('No team found');

  // First check if client exists
  const existingClient = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.teamId, team.id)))
    .limit(1);
    
  console.log('Existing client found:', existingClient);

  if (existingClient.length === 0) {
    throw new Error(`Client with ID ${id} not found or not accessible`);
  }

  const result = await db
    .delete(clients)
    .where(and(eq(clients.id, id), eq(clients.teamId, team.id)));

  console.log('Delete result:', result);

  return { success: true };
}

// ==================== REVENUE QUERIES ====================

export async function getRevenue(startDate?: Date, endDate?: Date) {
  const team = await getTeamForUser();
  if (!team) return [];

  try {
    let conditions = [eq(revenue.teamId, team.id)];

    if (startDate) {
      conditions.push(gte(revenue.createdAt, startDate));
    }
    if (endDate) {
      conditions.push(lte(revenue.createdAt, endDate));
    }

    const result = await db
      .select({
        id: revenue.id,
        amount: revenue.amount,
        source: revenue.source,
        date: revenue.date,
        description: revenue.description,
        clientId: revenue.clientId,
        clientName: clients.name,
        createdAt: revenue.createdAt,
        updatedAt: revenue.updatedAt,
      })
      .from(revenue)
      .leftJoin(clients, eq(revenue.clientId, clients.id))
      .where(and(...conditions))
      .orderBy(desc(revenue.createdAt));
    
    console.log('getRevenue result:', result, 'Type:', typeof result, 'Is Array:', Array.isArray(result));
    return result || [];
  } catch (error) {
    console.error('Error in getRevenue:', error);
    return [];
  }
}

export async function createRevenue(data: NewRevenue) {
  console.log('createRevenue called with data:', data);
  
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');
  
  console.log('Team found:', team.id);

  // Validate clientId if provided
  if (data.clientId) {
    console.log('Validating client ID:', data.clientId);
    const clientExists = await db
      .select({ id: clients.id })
      .from(clients)
      .where(and(eq(clients.id, data.clientId), eq(clients.teamId, team.id)))
      .limit(1);
    
    console.log('Client validation result:', clientExists);
    
    if (clientExists.length === 0) {
      throw new Error(`Client with ID ${data.clientId} not found or doesn't belong to your team`);
    }
  }

  const insertData = { ...data, teamId: team.id };
  console.log('Inserting revenue with data:', insertData);

  const [revenueEntry] = await db
    .insert(revenue)
    .values(insertData)
    .returning();

  console.log('Revenue created successfully:', revenueEntry);
  return revenueEntry;
}

export async function updateRevenue(id: number, data: Partial<NewRevenue>) {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  // Validate clientId if provided
  if (data.clientId) {
    const clientExists = await db
      .select({ id: clients.id })
      .from(clients)
      .where(and(eq(clients.id, data.clientId), eq(clients.teamId, team.id)))
      .limit(1);
    
    if (clientExists.length === 0) {
      throw new Error(`Client with ID ${data.clientId} not found or doesn't belong to your team`);
    }
  }

  const [updated] = await db
    .update(revenue)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(revenue.id, id), eq(revenue.teamId, team.id)))
    .returning();

  return updated;
}

export async function getRevenueById(id: number) {
  const team = await getTeamForUser();
  if (!team) return null;

  const result = await db
    .select()
    .from(revenue)
    .where(and(eq(revenue.id, id), eq(revenue.teamId, team.id)))
    .limit(1);

  return result[0] || null;
}

export async function deleteRevenue(id: number) {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  await db
    .delete(revenue)
    .where(and(eq(revenue.id, id), eq(revenue.teamId, team.id)));

  return { success: true };
}

// ==================== EXPENSE QUERIES ====================

export async function getExpenses(category?: string, startDate?: Date, endDate?: Date) {
  const team = await getTeamForUser();
  if (!team) return [];

  try {
    let conditions = [eq(expenses.teamId, team.id)];

    if (category) {
      conditions.push(eq(expenses.category, category));
    }
    if (startDate) {
      conditions.push(gte(expenses.expenseDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(expenses.expenseDate, endDate));
    }

    const result = await db
      .select()
      .from(expenses)
      .where(and(...conditions))
      .orderBy(desc(expenses.expenseDate));
    
    console.log('getExpenses result:', result, 'Type:', typeof result, 'Is Array:', Array.isArray(result));
    return result || [];
  } catch (error) {
    console.error('Error in getExpenses:', error);
    return [];
  }
}

export async function createExpense(data: NewExpense) {
  console.log('createExpense called with data:', data);
  
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');
  
  console.log('Team found:', team.id);

  const insertData = { ...data, teamId: team.id };
  console.log('Inserting expense with data:', insertData);

  const [expense] = await db
    .insert(expenses)
    .values(insertData)
    .returning();

  console.log('Expense created successfully:', expense);
  return expense;
}

export async function updateExpense(id: number, data: Partial<NewExpense>) {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  const [updated] = await db
    .update(expenses)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(expenses.id, id), eq(expenses.teamId, team.id)))
    .returning();

  return updated;
}

export async function getExpenseById(id: number) {
  const team = await getTeamForUser();
  if (!team) return null;

  const result = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.teamId, team.id)))
    .limit(1);

  return result[0] || null;
}

export async function deleteExpense(id: number) {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  await db
    .delete(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.teamId, team.id)));

  return { success: true };
}

// ==================== PROJECT QUERIES ====================

export async function getProjects(status?: string) {
  const team = await getTeamForUser();
  if (!team) return [];

  let query = db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      projectType: projects.projectType,
      status: projects.status,
      stack: projects.stack,
      monthlyRoi: projects.monthlyRoi,
      budget: projects.budget,
      assignedTo: projects.assignedTo,
      clientId: projects.clientId,
      clientName: clients.name,
      startDate: projects.startDate,
      endDate: projects.endDate,
      progressPercentage: projects.progressPercentage,
      notes: projects.notes,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .where(eq(projects.teamId, team.id))
    .$dynamic();

  if (status) {
    query = query.where(and(eq(projects.teamId, team.id), eq(projects.status, status)));
  }

  return await query.orderBy(desc(projects.createdAt));
}

export async function getProjectById(id: number) {
  const team = await getTeamForUser();
  if (!team) return null;

  const result = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      projectType: projects.projectType,
      status: projects.status,
      stack: projects.stack,
      monthlyRoi: projects.monthlyRoi,
      budget: projects.budget,
      assignedTo: projects.assignedTo,
      clientId: projects.clientId,
      clientName: clients.name,
      startDate: projects.startDate,
      endDate: projects.endDate,
      progressPercentage: projects.progressPercentage,
      notes: projects.notes,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .where(and(eq(projects.id, id), eq(projects.teamId, team.id)))
    .limit(1);

  return result[0] || null;
}

export async function createProject(data: NewProject) {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  const [project] = await db
    .insert(projects)
    .values({ ...data, teamId: team.id })
    .returning();

  return project;
}

export async function updateProject(id: number, data: Partial<NewProject>) {
  console.log('updateProject called with:', { id, data });
  
  const team = await getTeamForUser();
  console.log('Team found:', team);
  
  if (!team) throw new Error('No team found');

  const [updated] = await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.teamId, team.id)))
    .returning();

  console.log('Update result:', updated);
  
  if (!updated) {
    throw new Error(`Project with ID ${id} not found or not accessible`);
  }

  return updated;
}

export async function deleteProject(id: number) {
  console.log('deleteProject called with ID:', id);
  
  const team = await getTeamForUser();
  console.log('Team found for delete:', team);
  
  if (!team) throw new Error('No team found');

  // First check if project exists
  const existingProject = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.teamId, team.id)))
    .limit(1);
    
  console.log('Existing project found:', existingProject);

  if (existingProject.length === 0) {
    throw new Error(`Project with ID ${id} not found or not accessible`);
  }

  const result = await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.teamId, team.id)));

  console.log('Delete result:', result);

  return { success: true };
}

// ==================== INVOICE QUERIES ====================

export async function getInvoices(status?: string) {
  const team = await getTeamForUser();
  if (!team) return [];

  let query = db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      clientId: invoices.clientId,
      clientName: clients.name,
      amount: invoices.amount,
      status: invoices.status,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      paidDate: invoices.paidDate,
      notes: invoices.notes,
      createdAt: invoices.createdAt,
      updatedAt: invoices.updatedAt,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .where(eq(invoices.teamId, team.id))
    .$dynamic();

  if (status) {
    query = query.where(and(eq(invoices.teamId, team.id), eq(invoices.status, status)));
  }

  return await query.orderBy(desc(invoices.issueDate));
}

export async function createInvoice(data: NewInvoice) {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  const [invoice] = await db
    .insert(invoices)
    .values({ ...data, teamId: team.id })
    .returning();

  return invoice;
}

export async function updateInvoice(id: number, data: Partial<NewInvoice>) {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  const [updated] = await db
    .update(invoices)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(invoices.id, id), eq(invoices.teamId, team.id)))
    .returning();

  return updated;
}

export async function deleteInvoice(id: number) {
  const team = await getTeamForUser();
  if (!team) throw new Error('No team found');

  await db
    .delete(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.teamId, team.id)));

  return { success: true };
}

// ==================== ANALYTICS QUERIES ====================

export async function getBusinessAnalytics() {
  const team = await getTeamForUser();
  if (!team) return null;

  try {
    const [
      totalRevenueResult,
      totalExpensesResult,
      clientCount,
      activeProjectsCount,
      completedProjectsCount,
      totalProjectsCount,
      totalBudgetResult,
      totalRoiResult,
      averageProgressResult,
      pendingInvoicesResult,
    ] = await Promise.all([
      db
        .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
        .from(revenue)
        .where(and(eq(revenue.teamId, team.id), eq(revenue.paymentStatus, 'paid'))),
      db
        .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
        .from(expenses)
        .where(eq(expenses.teamId, team.id)),
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(clients)
        .where(and(eq(clients.teamId, team.id), eq(clients.status, 'active'))),
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(projects)
        .where(and(eq(projects.teamId, team.id), eq(projects.status, 'In Progress'))),
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(projects)
        .where(and(eq(projects.teamId, team.id), eq(projects.status, 'Completed'))),
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(projects)
        .where(eq(projects.teamId, team.id)),
      db
        .select({ total: sql<number>`COALESCE(SUM(budget), 0)` })
        .from(projects)
        .where(eq(projects.teamId, team.id)),
      db
        .select({ total: sql<number>`COALESCE(SUM(monthly_roi), 0)` })
        .from(projects)
        .where(eq(projects.teamId, team.id)),
      db
        .select({ average: sql<number>`COALESCE(AVG(progress_percentage), 0)` })
        .from(projects)
        .where(eq(projects.teamId, team.id)),
      db
        .select({ total: sql<number>`COALESCE(SUM(amount), 0)`, count: sql<number>`COUNT(*)` })
        .from(invoices)
        .where(and(eq(invoices.teamId, team.id), eq(invoices.status, 'pending'))),
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;
    const totalExpenses = totalExpensesResult[0]?.total || 0;
    const profit = totalRevenue - totalExpenses;

    return {
      totalRevenue,
      totalExpenses,
      profit,
      profitMargin: totalRevenue > 0 ? Math.round((profit / totalRevenue) * 100) : 0,
      clientCount: clientCount[0]?.count || 0,
      activeProjects: activeProjectsCount[0]?.count || 0,
      completedProjects: completedProjectsCount[0]?.count || 0,
      projectCount: totalProjectsCount[0]?.count || 0,
      totalBudget: totalBudgetResult[0]?.total || 0,
      totalRoi: totalRoiResult[0]?.total || 0,
      averageProgress: Math.round(averageProgressResult[0]?.average || 0),
      pendingInvoices: {
        count: pendingInvoicesResult[0]?.count || 0,
        total: pendingInvoicesResult[0]?.total || 0,
      },
    };
  } catch (error) {
    console.error('Error in getBusinessAnalytics:', error);
    // Return basic analytics without problematic columns
    try {
      const [totalRevenueResult, totalExpensesResult, clientCount, projectCount] = await Promise.all([
        db
          .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
          .from(revenue)
          .where(eq(revenue.teamId, team.id)),
        db
          .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
          .from(expenses)
          .where(eq(expenses.teamId, team.id)),
        db
          .select({ count: sql<number>`COUNT(*)` })
          .from(clients)
          .where(eq(clients.teamId, team.id)),
        db
          .select({ count: sql<number>`COUNT(*)` })
          .from(projects)
          .where(eq(projects.teamId, team.id)),
      ]);

      const totalRevenue = totalRevenueResult[0]?.total || 0;
      const totalExpenses = totalExpensesResult[0]?.total || 0;
      const profit = totalRevenue - totalExpenses;

      return {
        totalRevenue,
        totalExpenses,
        profit,
        profitMargin: totalRevenue > 0 ? Math.round((profit / totalRevenue) * 100) : 0,
        clientCount: clientCount[0]?.count || 0,
        activeProjects: 0,
        completedProjects: 0,
        projectCount: projectCount[0]?.count || 0,
        totalBudget: 0,
        totalRoi: 0,
        averageProgress: 0,
        pendingInvoices: {
          count: 0,
          total: 0,
        },
      };
    } catch (fallbackError) {
      console.error('Error in fallback analytics:', fallbackError);
      return {
        totalRevenue: 0,
        totalExpenses: 0,
        profit: 0,
        profitMargin: 0,
        clientCount: 0,
        activeProjects: 0,
        completedProjects: 0,
        projectCount: 0,
        totalBudget: 0,
        totalRoi: 0,
        averageProgress: 0,
        pendingInvoices: {
          count: 0,
          total: 0,
        },
      };
    }
  }
}

export async function getRevenueByMonth(months: number = 12) {
  const team = await getTeamForUser();
  if (!team) return [];

  try {
    const result = await db
      .select({
        month: sql<string>`TO_CHAR(${revenue.createdAt}, 'YYYY-MM')`,
        total: sql<number>`SUM(${revenue.amount})`,
      })
      .from(revenue)
      .where(
        and(
          eq(revenue.teamId, team.id),
          eq(revenue.paymentStatus, 'paid'),
          gte(revenue.createdAt, sql`NOW() - INTERVAL '${sql.raw(months.toString())} months'`)
        )
      )
      .groupBy(sql`TO_CHAR(${revenue.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${revenue.createdAt}, 'YYYY-MM')`);

    return result;
  } catch (error) {
    console.error('Error in getRevenueByMonth:', error);
    // Return basic revenue data without payment status filter
    try {
      const result = await db
        .select({
          month: sql<string>`TO_CHAR(${revenue.createdAt}, 'YYYY-MM')`,
          total: sql<number>`SUM(${revenue.amount})`,
        })
        .from(revenue)
        .where(
          and(
            eq(revenue.teamId, team.id),
            gte(revenue.createdAt, sql`NOW() - INTERVAL '${sql.raw(months.toString())} months'`)
          )
        )
        .groupBy(sql`TO_CHAR(${revenue.createdAt}, 'YYYY-MM')`)
        .orderBy(sql`TO_CHAR(${revenue.createdAt}, 'YYYY-MM')`);

      return result;
    } catch (fallbackError) {
      console.error('Error in fallback getRevenueByMonth:', fallbackError);
      return [];
    }
  }
}

export async function getExpensesByCategory() {
  const team = await getTeamForUser();
  if (!team) return [];

  const result = await db
    .select({
      category: expenses.category,
      total: sql<number>`SUM(${expenses.amount})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(expenses)
    .where(eq(expenses.teamId, team.id))
    .groupBy(expenses.category)
    .orderBy(desc(sql`SUM(${expenses.amount})`));

  return result;
}

export async function getTopClients(limit: number = 5) {
  const team = await getTeamForUser();
  if (!team) return [];

  const result = await db
    .select({
      client: clients,
      totalRevenue: sql<number>`COALESCE(SUM(${revenue.amount}), 0)`,
    })
    .from(clients)
    .leftJoin(revenue, eq(clients.id, revenue.clientId))
    .where(eq(clients.teamId, team.id))
    .groupBy(clients.id)
    .orderBy(desc(sql`COALESCE(SUM(${revenue.amount}), 0)`))
    .limit(limit);

  return result;
}

