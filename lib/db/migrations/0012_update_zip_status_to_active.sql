-- Update zip_requests table to support 'active' status and change default
ALTER TABLE zip_requests 
ALTER COLUMN status DROP DEFAULT;

ALTER TABLE zip_requests 
ALTER COLUMN status SET DEFAULT 'active';

-- Update existing 'pending' records to 'active' if they don't have a category
-- (This ensures existing data is compatible)
UPDATE zip_requests 
SET status = 'active' 
WHERE status = 'pending' AND category_id IS NOT NULL;

-- Add check constraint to ensure valid status values
ALTER TABLE zip_requests 
ADD CONSTRAINT check_zip_status 
CHECK (status IN ('active', 'pending', 'processing', 'done'));
