-- Create zip_requests table for managing zip code scraping requests
-- This table tracks zip codes that need to be processed by the scraper

CREATE TABLE IF NOT EXISTS zip_requests (
  id SERIAL PRIMARY KEY,
  zip TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'done')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_zip_requests_status ON zip_requests(status);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_zip_requests_created_at ON zip_requests(created_at DESC);

-- Add comment to table
COMMENT ON TABLE zip_requests IS 'Tracks zip code scraping requests and their processing status';
COMMENT ON COLUMN zip_requests.zip IS 'The zip code to be processed';
COMMENT ON COLUMN zip_requests.status IS 'Processing status: pending, processing, or done';
COMMENT ON COLUMN zip_requests.created_at IS 'When the request was created';
