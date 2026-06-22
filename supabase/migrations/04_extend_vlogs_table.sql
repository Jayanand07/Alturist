-- ============================================================
-- Migration: Extend doctor_vlogs table schema and rename to vlogs
-- ============================================================

-- 1. Rename table doctor_vlogs to vlogs if it exists
ALTER TABLE IF EXISTS doctor_vlogs RENAME TO vlogs;

-- 2. Rename column doctor_id to author_doctor_id if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vlogs' AND column_name='doctor_id') THEN
        ALTER TABLE vlogs RENAME COLUMN doctor_id TO author_doctor_id;
    END IF;
END $$;

-- 3. Rename column view_count to views_count if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vlogs' AND column_name='view_count') THEN
        ALTER TABLE vlogs RENAME COLUMN view_count TO views_count;
    END IF;
END $$;

-- 4. Add new columns if not exists
ALTER TABLE vlogs ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE vlogs ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE vlogs ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;

-- 5. Migrate description to excerpt if description exists, and rename description to description_deprecated
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vlogs' AND column_name='description') THEN
        -- Copy existing description text to excerpt
        UPDATE vlogs SET excerpt = description WHERE excerpt IS NULL;
        -- Rename original description column to description_deprecated for a safety rollback path
        ALTER TABLE vlogs RENAME COLUMN description TO description_deprecated;
    END IF;
END $$;

-- 6. Refresh Indexes with renamed columns
DROP INDEX IF EXISTS idx_vlog_doctor;
CREATE INDEX IF NOT EXISTS idx_vlog_author_doctor ON vlogs (author_doctor_id);
