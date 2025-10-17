-- Ensure place_id has a unique constraint on leads table
-- This migration is idempotent and safe to run multiple times

-- First, remove any existing duplicate records (keep the latest one)
WITH duplicates AS (
  SELECT place_id, 
         MIN(id) as keep_id,
         array_agg(id ORDER BY created_at DESC) as all_ids
  FROM leads 
  GROUP BY place_id 
  HAVING COUNT(*) > 1
),
duplicate_ids AS (
  SELECT unnest(all_ids[2:]) as id_to_delete
  FROM duplicates
)
DELETE FROM leads 
WHERE id IN (SELECT id_to_delete FROM duplicate_ids);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'leads_place_id_key' 
        AND conrelid = 'leads'::regclass
    ) THEN
        ALTER TABLE leads ADD CONSTRAINT leads_place_id_key UNIQUE (place_id);
        RAISE NOTICE 'Added unique constraint on place_id';
    ELSE
        RAISE NOTICE 'Unique constraint on place_id already exists';
    END IF;
END $$;
