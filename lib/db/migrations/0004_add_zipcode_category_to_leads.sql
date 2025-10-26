-- Add zipcode and categoryId columns to leads table
ALTER TABLE leads ADD COLUMN zipcode VARCHAR(10);
ALTER TABLE leads ADD COLUMN category_id INTEGER REFERENCES categories(id);

-- Create index for better query performance
CREATE INDEX idx_leads_zipcode_category ON leads(zipcode, category_id);