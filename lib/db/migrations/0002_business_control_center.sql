-- Business Control Center Schema
-- Tables for Clients, Revenue, Expenses, Projects, Invoices

-- Clients Table (CRM)
CREATE TABLE IF NOT EXISTS "clients" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL REFERENCES "teams"("id"),
  "name" varchar(255) NOT NULL,
  "email" varchar(255),
  "company" varchar(255),
  "phone" varchar(50),
  "status" varchar(20) DEFAULT 'active' NOT NULL, -- active, inactive, lead
  "lifetime_value" integer DEFAULT 0,
  "address" text,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Revenue Table
CREATE TABLE IF NOT EXISTS "revenue" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL REFERENCES "teams"("id"),
  "client_id" integer REFERENCES "clients"("id"),
  "amount" integer NOT NULL, -- stored in cents
  "description" text NOT NULL,
  "category" varchar(100) DEFAULT 'General',
  "payment_status" varchar(20) DEFAULT 'pending' NOT NULL, -- paid, pending, overdue
  "payment_date" timestamp,
  "invoice_number" varchar(100),
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS "expenses" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL REFERENCES "teams"("id"),
  "amount" integer NOT NULL, -- stored in cents
  "description" text NOT NULL,
  "category" varchar(100) NOT NULL, -- Operations, Marketing, Salaries, etc.
  "vendor" varchar(255),
  "payment_method" varchar(50),
  "receipt_url" text,
  "is_recurring" boolean DEFAULT false,
  "expense_date" timestamp NOT NULL,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- AI Projects Table
CREATE TABLE IF NOT EXISTS "projects" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL REFERENCES "teams"("id"),
  "client_id" integer REFERENCES "clients"("id"),
  "name" varchar(255) NOT NULL,
  "description" text,
  "project_type" varchar(100) NOT NULL, -- Voice AI Agents, Automation Workflows, etc.
  "status" varchar(50) DEFAULT 'Planning' NOT NULL, -- Planning, In Progress, Deployed, Paused, Completed
  "stack" text, -- Vapi, n8n, Airtable, Twilio (comma separated)
  "monthly_roi" integer DEFAULT 0, -- in cents
  "budget" integer DEFAULT 0, -- in cents
  "assigned_to" varchar(255),
  "start_date" timestamp,
  "end_date" timestamp,
  "progress_percentage" integer DEFAULT 0,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS "invoices" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL REFERENCES "teams"("id"),
  "client_id" integer REFERENCES "clients"("id"),
  "invoice_number" varchar(100) NOT NULL UNIQUE,
  "amount" integer NOT NULL, -- stored in cents
  "status" varchar(20) DEFAULT 'pending' NOT NULL, -- paid, pending, overdue, cancelled
  "issue_date" timestamp DEFAULT now() NOT NULL,
  "due_date" timestamp NOT NULL,
  "paid_date" timestamp,
  "description" text,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Invoice Line Items Table
CREATE TABLE IF NOT EXISTS "invoice_items" (
  "id" serial PRIMARY KEY NOT NULL,
  "invoice_id" integer NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
  "description" text NOT NULL,
  "quantity" integer DEFAULT 1 NOT NULL,
  "unit_price" integer NOT NULL, -- stored in cents
  "amount" integer NOT NULL, -- stored in cents (quantity * unit_price)
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Client Contacts/Communications Table
CREATE TABLE IF NOT EXISTS "client_contacts" (
  "id" serial PRIMARY KEY NOT NULL,
  "client_id" integer NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "contact_type" varchar(50) NOT NULL, -- email, phone, meeting, note
  "subject" varchar(255),
  "details" text,
  "contact_date" timestamp DEFAULT now() NOT NULL,
  "created_by" integer REFERENCES "users"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Project Milestones/Tasks Table
CREATE TABLE IF NOT EXISTS "project_tasks" (
  "id" serial PRIMARY KEY NOT NULL,
  "project_id" integer NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "title" varchar(255) NOT NULL,
  "description" text,
  "status" varchar(50) DEFAULT 'pending' NOT NULL, -- pending, in_progress, completed
  "priority" varchar(20) DEFAULT 'medium', -- low, medium, high, urgent
  "due_date" timestamp,
  "completed_at" timestamp,
  "assigned_to" varchar(255),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_clients_team_id" ON "clients"("team_id");
CREATE INDEX IF NOT EXISTS "idx_clients_status" ON "clients"("status");
CREATE INDEX IF NOT EXISTS "idx_revenue_team_id" ON "revenue"("team_id");
CREATE INDEX IF NOT EXISTS "idx_revenue_client_id" ON "revenue"("client_id");
CREATE INDEX IF NOT EXISTS "idx_revenue_payment_status" ON "revenue"("payment_status");
CREATE INDEX IF NOT EXISTS "idx_expenses_team_id" ON "expenses"("team_id");
CREATE INDEX IF NOT EXISTS "idx_expenses_category" ON "expenses"("category");
CREATE INDEX IF NOT EXISTS "idx_projects_team_id" ON "projects"("team_id");
CREATE INDEX IF NOT EXISTS "idx_projects_client_id" ON "projects"("client_id");
CREATE INDEX IF NOT EXISTS "idx_projects_status" ON "projects"("status");
CREATE INDEX IF NOT EXISTS "idx_invoices_team_id" ON "invoices"("team_id");
CREATE INDEX IF NOT EXISTS "idx_invoices_client_id" ON "invoices"("client_id");
CREATE INDEX IF NOT EXISTS "idx_invoices_status" ON "invoices"("status");

