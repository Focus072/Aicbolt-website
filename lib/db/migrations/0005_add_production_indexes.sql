-- ============================================
-- PRODUCTION OPTIMIZATION: Database Indexes
-- ============================================

-- Leads table indexes for high-performance queries
CREATE INDEX IF NOT EXISTS idx_leads_place_id ON leads(place_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone) WHERE phone IS NOT NULL;

-- Users table indexes for auth and permissions
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_invite_token ON users(invite_token) WHERE invite_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_leads_status_created ON leads(status, created_at DESC);

-- Comments for documentation
COMMENT ON INDEX idx_leads_place_id IS 'Unique lookups for upsert operations';
COMMENT ON INDEX idx_leads_status IS 'Filter leads by status';
COMMENT ON INDEX idx_leads_created_at IS 'Sort by newest first';
COMMENT ON INDEX idx_leads_status_created IS 'Composite index for filtered queries with sorting';


