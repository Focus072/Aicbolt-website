-- Add is_manual column to leads table
ALTER TABLE leads ADD COLUMN is_manual BOOLEAN NOT NULL DEFAULT false;

-- Create index for better query performance on manual leads
CREATE INDEX idx_leads_is_manual ON leads(is_manual);

-- Update existing leads to mark them as non-manual (scraped)
UPDATE leads SET is_manual = false WHERE is_manual IS NULL;

