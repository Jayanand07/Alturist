-- ============================================================
-- LAB TESTS AND PACKAGES SCHEMA
-- Run this in your Supabase SQL Editor to create the required tables.
-- ============================================================

CREATE TABLE IF NOT EXISTS lab_tests (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255),
    price NUMERIC(19, 2),
    discounted_price NUMERIC(19, 2),
    discount_percent INTEGER,
    includes_count INTEGER,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lab_packages (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    includes_test_count INTEGER,
    test_names TEXT[],
    original_price NUMERIC(19, 2),
    discounted_price NUMERIC(19, 2),
    discount_percent INTEGER,
    smart_report_included BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_labtest_category ON lab_tests (category);
CREATE INDEX IF NOT EXISTS idx_labtest_is_featured ON lab_tests (is_featured);
CREATE INDEX IF NOT EXISTS idx_labtest_is_active ON lab_tests (is_active);
CREATE INDEX IF NOT EXISTS idx_labpackage_is_active ON lab_packages (is_active);
