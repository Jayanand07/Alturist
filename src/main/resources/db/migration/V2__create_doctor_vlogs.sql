-- ============================================================
-- Migration: Create doctor_vlogs table
-- Matches DoctorVlog.java entity exactly (Hibernate 6 column naming)
-- Run this against your Supabase database in the SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS doctor_vlogs (
    id            UUID         NOT NULL DEFAULT gen_random_uuid(),
    doctor_id     UUID         NOT NULL,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    video_url     VARCHAR(255),
    thumbnail_url VARCHAR(255),
    category      VARCHAR(255),
    is_published  BOOLEAN      NOT NULL DEFAULT FALSE,
    view_count    INTEGER               DEFAULT 0,
    published_at  TIMESTAMP,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_doctor_vlogs PRIMARY KEY (id),
    CONSTRAINT fk_vlog_doctor  FOREIGN KEY (doctor_id)
        REFERENCES doctors(id)
        ON DELETE CASCADE
);

-- Indexes (matching @Index annotations in DoctorVlog.java)
CREATE INDEX IF NOT EXISTS idx_vlog_doctor    ON doctor_vlogs (doctor_id);
CREATE INDEX IF NOT EXISTS idx_vlog_published ON doctor_vlogs (is_published);
CREATE INDEX IF NOT EXISTS idx_vlog_category  ON doctor_vlogs (category);
