import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'), // admin, client, member
  allowedPages: text('allowed_pages').array(), // Array of page slugs client can access
  organizationId: integer('organization_id').references(() => teams.id), // Reference to organization/team
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});


export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  teamMembers: many(teamMembers),
  organization: one(teams, {
    fields: [users.organizationId],
    references: [teams.id],
  }),
}));


export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'username'>;
  })[];
};

// Dashboard-specific tables
export const dashboardMetrics = pgTable('dashboard_metrics', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  totalRevenue: integer('total_revenue').notNull().default(0),
  activeUsers: integer('active_users').notNull().default(0),
  automations: integer('automations').notNull().default(0),
  aiTasks: integer('ai_tasks').notNull().default(0),
  revenueGrowth: varchar('revenue_growth', { length: 10 }).default('+0%'),
  usersGrowth: varchar('users_growth', { length: 10 }).default('+0%'),
  automationsGrowth: varchar('automations_growth', { length: 10 }).default('+0%'),
  aiTasksGrowth: varchar('ai_tasks_growth', { length: 10 }).default('+0%'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const dashboardActivities = pgTable('dashboard_activities', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  icon: varchar('icon', { length: 50 }).notNull(),
  color: varchar('color', { length: 20 }).notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});

export const dashboardStats = pgTable('dashboard_stats', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  automationRate: integer('automation_rate').notNull().default(0),
  aiAccuracy: integer('ai_accuracy').notNull().default(0),
  taskCompletion: integer('task_completion').notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const dashboardAutomations = pgTable('dashboard_automations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  name: varchar('name', { length: 255 }).notNull(),
  percentage: integer('percentage').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations for dashboard tables
export const dashboardMetricsRelations = relations(dashboardMetrics, ({ one }) => ({
  team: one(teams, {
    fields: [dashboardMetrics.teamId],
    references: [teams.id],
  }),
}));

export const dashboardActivitiesRelations = relations(dashboardActivities, ({ one }) => ({
  team: one(teams, {
    fields: [dashboardActivities.teamId],
    references: [teams.id],
  }),
}));

export const dashboardStatsRelations = relations(dashboardStats, ({ one }) => ({
  team: one(teams, {
    fields: [dashboardStats.teamId],
    references: [teams.id],
  }),
}));

export const dashboardAutomationsRelations = relations(dashboardAutomations, ({ one }) => ({
  team: one(teams, {
    fields: [dashboardAutomations.teamId],
    references: [teams.id],
  }),
}));

// Types for dashboard tables
export type DashboardMetrics = typeof dashboardMetrics.$inferSelect;
export type NewDashboardMetrics = typeof dashboardMetrics.$inferInsert;
export type DashboardActivity = typeof dashboardActivities.$inferSelect;
export type NewDashboardActivity = typeof dashboardActivities.$inferInsert;
export type DashboardStats = typeof dashboardStats.$inferSelect;
export type NewDashboardStats = typeof dashboardStats.$inferInsert;
export type DashboardAutomation = typeof dashboardAutomations.$inferSelect;
export type NewDashboardAutomation = typeof dashboardAutomations.$inferInsert;

// ==================== BUSINESS CONTROL CENTER TABLES ====================

// Clients Table (CRM)
export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  company: varchar('company', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  status: varchar('status', { length: 20 }).notNull().default('active'), // active, inactive, lead
  lifetimeValue: integer('lifetime_value').default(0),
  address: text('address'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Revenue Table
export const revenue = pgTable('revenue', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id),
  clientId: integer('client_id').references(() => clients.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // stored in cents
  source: varchar('source', { length: 255 }).notNull(), // source of revenue
  date: timestamp('date').notNull(), // date of revenue
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }).default('General'),
  paymentStatus: varchar('payment_status', { length: 20 }).notNull().default('pending'), // paid, pending, overdue
  paymentDate: timestamp('payment_date'),
  invoiceNumber: varchar('invoice_number', { length: 100 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Expenses Table
export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id),
  amount: integer('amount').notNull(), // stored in cents
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  vendor: varchar('vendor', { length: 255 }),
  paymentMethod: varchar('payment_method', { length: 50 }),
  receiptUrl: text('receipt_url'),
  isRecurring: boolean('is_recurring').default(false),
  frequency: varchar('frequency', { length: 50 }).default('One-time'), // One-time, Monthly, Annually
  paidBy: varchar('paid_by', { length: 255 }), // Person who paid for the expense
  expenseDate: timestamp('expense_date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// AI Projects Table
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id),
  clientId: integer('client_id').references(() => clients.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  projectType: varchar('project_type', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('Planning'), // Planning, In Progress, Deployed, Paused, Completed
  stack: text('stack'), // Vapi, n8n, Airtable, Twilio (comma separated)
  monthlyRoi: integer('monthly_roi').default(0), // in cents
  budget: integer('budget').default(0), // in cents
  assignedTo: varchar('assigned_to', { length: 255 }),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  progressPercentage: integer('progress_percentage').default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Invoices Table
export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id),
  clientId: integer('client_id').references(() => clients.id, { onDelete: 'cascade' }),
  invoiceNumber: varchar('invoice_number', { length: 100 }).notNull().unique(),
  amount: integer('amount').notNull(), // stored in cents
  status: varchar('status', { length: 20 }).notNull().default('pending'), // paid, pending, overdue, cancelled
  issueDate: timestamp('issue_date').notNull().defaultNow(),
  dueDate: timestamp('due_date').notNull(),
  paidDate: timestamp('paid_date'),
  description: text('description'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Invoice Line Items Table
export const invoiceItems = pgTable('invoice_items', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: integer('unit_price').notNull(), // stored in cents
  amount: integer('amount').notNull(), // stored in cents (quantity * unit_price)
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Client Contacts/Communications Table
export const clientContacts = pgTable('client_contacts', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  contactType: varchar('contact_type', { length: 50 }).notNull(), // email, phone, meeting, note
  subject: varchar('subject', { length: 255 }),
  details: text('details'),
  contactDate: timestamp('contact_date').notNull().defaultNow(),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Project Milestones/Tasks Table
export const projectTasks = pgTable('project_tasks', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, in_progress, completed
  priority: varchar('priority', { length: 20 }).default('medium'), // low, medium, high, urgent
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  assignedTo: varchar('assigned_to', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations
export const clientsRelations = relations(clients, ({ one, many }) => ({
  team: one(teams, { fields: [clients.teamId], references: [teams.id] }),
  revenue: many(revenue),
  projects: many(projects),
  invoices: many(invoices),
  contacts: many(clientContacts),
}));

export const revenueRelations = relations(revenue, ({ one }) => ({
  team: one(teams, { fields: [revenue.teamId], references: [teams.id] }),
  client: one(clients, { fields: [revenue.clientId], references: [clients.id] }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  team: one(teams, { fields: [expenses.teamId], references: [teams.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  team: one(teams, { fields: [projects.teamId], references: [teams.id] }),
  client: one(clients, { fields: [projects.clientId], references: [clients.id] }),
  tasks: many(projectTasks),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  team: one(teams, { fields: [invoices.teamId], references: [teams.id] }),
  client: one(clients, { fields: [invoices.clientId], references: [clients.id] }),
  items: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceItems.invoiceId], references: [invoices.id] }),
}));

export const clientContactsRelations = relations(clientContacts, ({ one }) => ({
  client: one(clients, { fields: [clientContacts.clientId], references: [clients.id] }),
  createdByUser: one(users, { fields: [clientContacts.createdBy], references: [users.id] }),
}));

export const projectTasksRelations = relations(projectTasks, ({ one }) => ({
  project: one(projects, { fields: [projectTasks.projectId], references: [projects.id] }),
}));

// TypeScript Types
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Revenue = typeof revenue.$inferSelect;
export type NewRevenue = typeof revenue.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;
export type ClientContact = typeof clientContacts.$inferSelect;
export type NewClientContact = typeof clientContacts.$inferInsert;
export type ProjectTask = typeof projectTasks.$inferSelect;
export type NewProjectTask = typeof projectTasks.$inferInsert;

// Expense Categories (AICBOLT specific)
export const EXPENSE_CATEGORIES = [
  'Operations',
  'Marketing',
  'Salaries / Contractors',
  'Subscriptions / SaaS',
  'Client Projects',
  'Travel / Meetings',
  'Equipment',
  'Education / Courses',
  'Utilities',
  'Taxes / Fees',
  'Miscellaneous',
] as const;

// Project Types (AICBOLT specific)
export const PROJECT_TYPES = [
  'Voice AI Agents',
  'Automation Workflows',
  'Data Extraction & Parsing',
  'Dashboards & Analytics',
  'CRM / Lead Automation',
  'Property Management Bots',
  'Accounting / Invoice Automation',
  'E-commerce & Wholesale Automation',
  'Internal AI Assistants',
  'Custom Integrations',
] as const;

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}

// Web Form Submissions Status Enum
export const submissionStatusEnum = pgEnum('submission_status', ['pending', 'accepted', 'rejected']);

// Web Form Submissions Table
export const webFormSubmissions = pgTable('web_form_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  status: submissionStatusEnum('status').notNull().default('pending'),
  
  // Personal Info
  name: text('name').notNull(),
  email: text('email').notNull(),
  company: text('company'),
  
  // Professional Background
  profession: text('profession'),
  industry: text('industry'),
  
  // Goals
  primaryGoal: text('primary_goal'),
  targetAudience: text('target_audience'),
  
  // Design
  stylePreference: text('style_preference'),
  inspirations: text('inspirations'),
  
  // Budget & Timeline
  budget: text('budget'),
  timeline: text('timeline'),
  
  // Requirements
  features: text('features').array(),
  contentTypes: text('content_types').array(),
  additionalInfo: text('additional_info'),
  
  // Review tracking
  reviewedBy: text('reviewed_by'),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  
  // Bot protection
  honeypot: text('honeypot'),
});

export const webFormSubmissionsRelations = relations(webFormSubmissions, ({ one }) => ({
  // No direct relation to teams for now since these are public submissions
}));

// Leads Table (from Google Maps scraper)
export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  placeId: varchar('place_id', { length: 255 }).notNull().unique(),
  action: varchar('action', { length: 100 }),
  status: varchar('status', { length: 50 }).notNull().default('new'),
  title: varchar('title', { length: 500 }).notNull(),
  email: varchar('email', { length: 255 }),
  name: varchar('name', { length: 255 }),
  firstname: varchar('firstname', { length: 255 }),
  lastname: varchar('lastname', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  cleanUrl: text('clean_url'),
  website: text('website'),
  wpApi: text('wp_api'),
  wp: text('wp'),
  facebook: text('facebook'),
  instagram: text('instagram'),
  youtube: text('youtube'),
  tiktok: text('tiktok'),
  twitter: text('twitter'),
  linkedin: text('linkedin'),
  pinterest: text('pinterest'),
  reddit: text('reddit'),
  rating: varchar('rating', { length: 10 }),
  reviews: integer('reviews'),
  type: varchar('type', { length: 255 }),
  address: text('address'),
  gpsCoordinates: text('gps_coordinates'),
  types: text('types'),
  zipcode: varchar('zipcode', { length: 10 }),
  categoryId: integer('category_id').references(() => categories.id),
  isManual: boolean('is_manual').notNull().default(false),
  // notes: text('notes'), // Temporarily disabled - column doesn't exist in DB
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const leadsRelations = relations(leads, ({ one }) => ({
  category: one(categories, {
    fields: [leads.categoryId],
    references: [categories.id],
  }),
}));

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

// Zip Requests Table
export const zipRequests = pgTable('zip_requests', {
  id: serial('id').primaryKey(),
  zip: text('zip').notNull(),
  status: text('status').notNull().default('pending').$type<'pending' | 'processing' | 'done'>(),
  categoryId: integer('category_id').references(() => categories.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const zipRequestsRelations = relations(zipRequests, ({ one }) => ({
  category: one(categories, {
    fields: [zipRequests.categoryId],
    references: [categories.id],
  }),
}));

export type ZipRequest = typeof zipRequests.$inferSelect;
export type NewZipRequest = typeof zipRequests.$inferInsert;

// Categories Table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  status: text('status').notNull().default('active').$type<'active' | 'inactive'>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const categoriesRelations = relations(categories, ({ one }) => ({
  // Can add relations later if needed
}));

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
