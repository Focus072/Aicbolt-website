-- Add organization_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id INTEGER;

-- Add foreign key constraint to reference teams table
ALTER TABLE users 
ADD CONSTRAINT fk_users_organization 
FOREIGN KEY (organization_id) 
REFERENCES teams(id) 
ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
