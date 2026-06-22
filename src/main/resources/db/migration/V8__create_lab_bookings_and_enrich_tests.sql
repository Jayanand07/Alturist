-- Migration V8: Lab Test Rich Details & Lab Bookings Table

-- ==========================================
-- ISSUE 1: Lab Test Rich Details Columns
-- ==========================================
ALTER TABLE IF EXISTS lab_tests ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE IF EXISTS lab_tests ADD COLUMN IF NOT EXISTS parameters_included text[];
ALTER TABLE IF EXISTS lab_tests ADD COLUMN IF NOT EXISTS report_time_hours integer;
ALTER TABLE IF EXISTS lab_tests ADD COLUMN IF NOT EXISTS free_home_collection boolean;

-- ==========================================
-- ISSUE 2: Lab Bookings Persistent Table
-- ==========================================
CREATE TABLE IF NOT EXISTS lab_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lab_test_id UUID REFERENCES lab_tests(id) ON DELETE SET NULL,
    lab_package_id UUID REFERENCES lab_packages(id) ON DELETE SET NULL,
    booking_type VARCHAR(50) NOT NULL, -- 'TEST' or 'PACKAGE'
    preferred_date DATE NOT NULL,
    preferred_time_slot VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'CONFIRMED', 'SAMPLE_COLLECTED', 'REPORT_READY', 'CANCELLED'
    amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'UNPAID', -- 'UNPAID', 'PAID'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Exclusivity constraint (Flag 3)
    CONSTRAINT check_booking_exclusivity CHECK (
        (lab_test_id IS NOT NULL AND lab_package_id IS NULL AND booking_type = 'TEST') OR
        (lab_test_id IS NULL AND lab_package_id IS NOT NULL AND booking_type = 'PACKAGE')
    )
);
