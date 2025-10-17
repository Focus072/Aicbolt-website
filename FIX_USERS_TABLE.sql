-- Quick fix: Add missing columns to users table
-- Run this in your database console (pgAdmin, DBeaver, or hosting platform SQL console)

-- Add permission and invite fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS allowed_pages TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_token_expiry TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

-- Set existing users to active (so they don't get locked out)
UPDATE users SET is_active = true WHERE is_active IS NULL OR is_active = false;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_invite_token ON users(invite_token);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('allowed_pages', 'invite_token', 'invite_token_expiry', 'is_active')
ORDER BY column_name;

-- You should see 4 rows showing the new columns


