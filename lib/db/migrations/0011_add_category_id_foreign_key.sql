-- Add category_id foreign key to zip_requests table
-- This creates a proper relationship between zip_requests and categories

-- First, add the category_id column
ALTER TABLE zip_requests ADD COLUMN IF NOT EXISTS category_id INTEGER;

-- Add foreign key constraint
ALTER TABLE zip_requests 
ADD CONSTRAINT fk_zip_requests_category_id 
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_zip_requests_category_id ON zip_requests(category_id);

-- Add comment
COMMENT ON COLUMN zip_requests.category_id IS 'Foreign key reference to categories table';

-- Remove the old category text column if it exists (we'll use category_id instead)
-- ALTER TABLE zip_requests DROP COLUMN IF EXISTS category;
