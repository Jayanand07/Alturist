-- ============================================================
-- Migration: Add featured medicines columns
-- ============================================================

-- Add columns is_featured and featured_at to medicines table if they do not exist
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS featured_at TIMESTAMPTZ NULL;
