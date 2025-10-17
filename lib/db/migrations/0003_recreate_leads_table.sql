-- Drop existing leads table and enum if they exist
DROP TABLE IF EXISTS leads CASCADE;
DROP TYPE IF EXISTS lead_status CASCADE;

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
CREATE INDEX idx_leads_place_id ON leads(place_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

-- Add comments to document the table
COMMENT ON TABLE leads IS 'Leads from Google Maps scraper via n8n';
COMMENT ON COLUMN leads.place_id IS 'Unique Google Maps place identifier';
COMMENT ON COLUMN leads.status IS 'Lead status: new, contacted, qualified, converted, rejected';
COMMENT ON COLUMN leads.created_at IS 'Automatically set when record is created';


