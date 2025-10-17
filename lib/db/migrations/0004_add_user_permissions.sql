-- Add permission and invite fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS allowed_pages TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS invite_token_expiry TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT false;

-- Update existing users to be active (so they don't get locked out)
UPDATE users SET is_active = true WHERE is_active IS NULL OR is_active = false;

-- Create index on invite_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_invite_token ON users(invite_token);

-- Add comments
COMMENT ON COLUMN users.allowed_pages IS 'Array of page slugs client role can access';
COMMENT ON COLUMN users.invite_token IS 'Token for account activation via email invite';
COMMENT ON COLUMN users.is_active IS 'Whether user has activated their account';


