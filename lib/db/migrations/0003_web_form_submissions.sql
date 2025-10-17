-- Create submission status enum
CREATE TYPE "submission_status" AS ENUM ('pending', 'accepted', 'rejected');

-- Create web_form_submissions table
CREATE TABLE IF NOT EXISTS "web_form_submissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "status" "submission_status" DEFAULT 'pending' NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "company" text,
  "profession" text,
  "industry" text,
  "primary_goal" text,
  "target_audience" text,
  "style_preference" text,
  "inspirations" text,
  "budget" text,
  "timeline" text,
  "features" text[],
  "content_types" text[],
  "additional_info" text,
  "reviewed_by" text,
  "reviewed_at" timestamp with time zone,
  "honeypot" text
);

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS "web_form_submissions_status_idx" ON "web_form_submissions" ("status");

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS "web_form_submissions_created_at_idx" ON "web_form_submissions" ("created_at" DESC);

-- Create index on email for searching
CREATE INDEX IF NOT EXISTS "web_form_submissions_email_idx" ON "web_form_submissions" ("email");

