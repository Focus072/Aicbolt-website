-- Create leads table with correct structure
-- Run this in your database console (pgAdmin, DBeaver, or hosting platform SQL console)

-- Drop existing leads table if it exists
DROP TABLE IF EXISTS leads CASCADE;

-- Create leads table with complete structure
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  place_id VARCHAR(255) NOT NULL UNIQUE,
  action VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  title VARCHAR(500) NOT NULL,
  email VARCHAR(255),
  name VARCHAR(255),
  firstname VARCHAR(255),
  lastname VARCHAR(255),
  phone VARCHAR(50),
  clean_url TEXT,
  website TEXT,
  wp_api TEXT,
  wp TEXT,
  facebook TEXT,
  instagram TEXT,
  youtube TEXT,
  tiktok TEXT,
  twitter TEXT,
  linkedin TEXT,
  pinterest TEXT,
  reddit TEXT,
  rating VARCHAR(10),
  reviews INTEGER,
  type VARCHAR(255),
  address TEXT,
  gps_coordinates TEXT,
  types TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_place_id ON leads(place_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Add comments to document the table
COMMENT ON TABLE leads IS 'Leads from Google Maps scraper via n8n';
COMMENT ON COLUMN leads.place_id IS 'Unique Google Maps place identifier';
COMMENT ON COLUMN leads.status IS 'Lead status: new, called, success, failed';
COMMENT ON COLUMN leads.created_at IS 'Automatically set when record is created';

-- Verify table was created
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'leads'
ORDER BY ordinal_position;

-- You should see all the columns listed above

