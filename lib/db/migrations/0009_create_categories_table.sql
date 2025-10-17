-- Create categories table for lead finder categories
-- This table stores categories that can be selected when submitting zip codes

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Add comment to table
COMMENT ON TABLE categories IS 'Stores categories for lead finder zip code submissions';
COMMENT ON COLUMN categories.name IS 'The category name (e.g., Restaurants, Healthcare, etc.)';
COMMENT ON COLUMN categories.status IS 'Category status: active or inactive';
COMMENT ON COLUMN categories.created_at IS 'When the category was created';

-- Insert some default categories
INSERT INTO categories (name, status) VALUES 
  ('Restaurants', 'active'),
  ('Healthcare', 'active'),
  ('Retail', 'active'),
  ('Services', 'active'),
  ('Automotive', 'active')
ON CONFLICT (name) DO NOTHING;
