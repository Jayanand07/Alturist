-- ============================================================
-- FULL SCHEMA SYNC — Run this in Supabase SQL Editor
-- Adds ALL columns that exist in Java entities but may be
-- missing from the database. Uses IF NOT EXISTS to be safe.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. doctors table — add columns added after initial creation
-- ────────────────────────────────────────────────────────────
ALTER TABLE doctors
    ADD COLUMN IF NOT EXISTS version          BIGINT,
    ADD COLUMN IF NOT EXISTS clinic_name      VARCHAR(255),
    ADD COLUMN IF NOT EXISTS clinic_address   TEXT,
    ADD COLUMN IF NOT EXISTS clinic_phone     VARCHAR(255),
    ADD COLUMN IF NOT EXISTS latitude         DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS longitude        DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS is_verified      BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS bio              TEXT,
    ADD COLUMN IF NOT EXISTS languages        VARCHAR(255),
    ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR(255),
    ADD COLUMN IF NOT EXISTS schedule_json    TEXT,
    ADD COLUMN IF NOT EXISTS city             VARCHAR(255),
    ADD COLUMN IF NOT EXISTS qualification    VARCHAR(255),
    ADD COLUMN IF NOT EXISTS experience_years INTEGER,
    ADD COLUMN IF NOT EXISTS consultation_fee NUMERIC(19,2),
    ADD COLUMN IF NOT EXISTS is_available     BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS rating           DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS total_consultations INTEGER NOT NULL DEFAULT 0;

-- ────────────────────────────────────────────────────────────
-- 2. users table — add columns added after initial creation
-- ────────────────────────────────────────────────────────────
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS blood_group          VARCHAR(10),
    ADD COLUMN IF NOT EXISTS street               VARCHAR(255),
    ADD COLUMN IF NOT EXISTS city                 VARCHAR(255),
    ADD COLUMN IF NOT EXISTS state                VARCHAR(255),
    ADD COLUMN IF NOT EXISTS pincode              VARCHAR(20),
    ADD COLUMN IF NOT EXISTS allergies            TEXT,
    ADD COLUMN IF NOT EXISTS chronic_conditions   TEXT,
    ADD COLUMN IF NOT EXISTS current_medications  TEXT,
    ADD COLUMN IF NOT EXISTS email_alerts         BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS sms_alerts           BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS appointment_reminders BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS profile_picture_url  VARCHAR(255),
    ADD COLUMN IF NOT EXISTS date_of_birth        DATE,
    ADD COLUMN IF NOT EXISTS gender               VARCHAR(50),
    ADD COLUMN IF NOT EXISTS updated_at           TIMESTAMP;

-- ────────────────────────────────────────────────────────────
-- 3. consultations table — add columns added after initial creation
-- ────────────────────────────────────────────────────────────
ALTER TABLE consultations
    ADD COLUMN IF NOT EXISTS diagnosis                 TEXT,
    ADD COLUMN IF NOT EXISTS chief_complaint           TEXT,
    ADD COLUMN IF NOT EXISTS is_reschedule_requested   BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS proposed_reschedule_time  TIMESTAMP,
    ADD COLUMN IF NOT EXISTS reschedule_reason         TEXT,
    ADD COLUMN IF NOT EXISTS call_started_at           TIMESTAMP,
    ADD COLUMN IF NOT EXISTS call_ended_at             TIMESTAMP,
    ADD COLUMN IF NOT EXISTS call_duration_minutes     INTEGER,
    ADD COLUMN IF NOT EXISTS video_room_id             VARCHAR(255),
    ADD COLUMN IF NOT EXISTS prescription_url          VARCHAR(255);

-- ────────────────────────────────────────────────────────────
-- 4. Indexes that may be missing (doctors)
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_doctor_city          ON doctors (city);
CREATE INDEX IF NOT EXISTS idx_doctor_specialization ON doctors (specialization);
CREATE INDEX IF NOT EXISTS idx_doctor_is_verified   ON doctors (is_verified);

-- Composite index requires both cols to exist first
CREATE INDEX IF NOT EXISTS idx_doctor_city_spec ON doctors (city, specialization);

-- ────────────────────────────────────────────────────────────
-- 5. Indexes that may be missing (consultations)
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_consultation_patient  ON consultations (patient_id);
CREATE INDEX IF NOT EXISTS idx_consultation_doctor   ON consultations (doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultation_status   ON consultations (status);

-- ────────────────────────────────────────────────────────────
-- Done. Run mvn spring-boot:run after this succeeds.
-- ────────────────────────────────────────────────────────────
