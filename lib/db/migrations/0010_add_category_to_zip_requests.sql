-- Add category column to zip_requests table
-- This allows zip code requests to be associated with specific categories

ALTER TABLE zip_requests ADD COLUMN IF NOT EXISTS category TEXT;

-- Add comment to column
COMMENT ON COLUMN zip_requests.category IS 'Category associated with this zip code request (e.g., Restaurants, Healthcare, etc.)';

-- Create index on category for faster queries
CREATE INDEX IF NOT EXISTS idx_zip_requests_category ON zip_requests(category);
