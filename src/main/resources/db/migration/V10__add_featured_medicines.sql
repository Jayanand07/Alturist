-- Migration V10: Add featured medicines columns
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS featured_at TIMESTAMPTZ NULL;
