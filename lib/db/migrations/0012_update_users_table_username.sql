-- Update users table to use username instead of email
-- This migration removes email-based authentication and replaces it with username-based auth

-- Add username column
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);

-- Create a temporary function to generate usernames from emails
-- This will help migrate existing users
DO $$
DECLARE
    user_record RECORD;
    new_username VARCHAR(50);
    counter INTEGER;
BEGIN
    -- For each user, create a username from their email
    FOR user_record IN SELECT id, email FROM users WHERE email IS NOT NULL LOOP
        -- Extract username part from email (before @)
        new_username := split_part(user_record.email, '@', 1);
        
        -- Clean the username (remove special characters, limit length)
        new_username := regexp_replace(new_username, '[^a-zA-Z0-9]', '', 'g');
        new_username := LEFT(new_username, 45); -- Leave room for counter
        
        -- Handle duplicates by adding a counter
        counter := 1;
        WHILE EXISTS (SELECT 1 FROM users WHERE username = new_username) LOOP
            new_username := LEFT(split_part(user_record.email, '@', 1), 40) || counter::text;
            new_username := regexp_replace(new_username, '[^a-zA-Z0-9]', '', 'g');
            counter := counter + 1;
        END LOOP;
        
        -- Update the user with the generated username
        UPDATE users SET username = new_username WHERE id = user_record.id;
    END LOOP;
END $$;

-- Make username NOT NULL and UNIQUE
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);

-- Remove email column and related invite fields
ALTER TABLE users DROP COLUMN IF EXISTS email;
ALTER TABLE users DROP COLUMN IF EXISTS invite_token;
ALTER TABLE users DROP COLUMN IF EXISTS invite_token_expiry;

-- Set all users to active by default (since we're removing the invite system)
UPDATE users SET is_active = true WHERE is_active IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Clean up invitations table since we're removing email invites
DROP TABLE IF EXISTS invitations CASCADE;
