-- 02_create_doctor_vlogs.sql
-- Creates the doctor vlog table required by the Spring Boot DoctorVlog entity.

CREATE TABLE IF NOT EXISTS public.doctor_vlogs (
    id uuid PRIMARY KEY,
    doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    title varchar(255) NOT NULL,
    description text,
    video_url varchar(255),
    thumbnail_url varchar(255),
    category varchar(255),
    is_published boolean DEFAULT false,
    view_count integer DEFAULT 0,
    published_at timestamp(6),
    created_at timestamp(6),
    updated_at timestamp(6)
);

CREATE INDEX IF NOT EXISTS idx_vlog_doctor ON public.doctor_vlogs (doctor_id);
CREATE INDEX IF NOT EXISTS idx_vlog_published ON public.doctor_vlogs (is_published);
CREATE INDEX IF NOT EXISTS idx_vlog_category ON public.doctor_vlogs (category);

ALTER TABLE public.doctor_vlogs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'doctor_vlogs'
          AND policyname = 'Published doctor vlogs are publicly readable'
    ) THEN
        CREATE POLICY "Published doctor vlogs are publicly readable"
        ON public.doctor_vlogs
        FOR SELECT
        TO anon, authenticated
        USING (is_published = true);
    END IF;
END $$;
