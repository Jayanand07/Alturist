-- 03_create_notifications.sql
-- Creates the notifications table and enables RLS

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notification_user ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notification_is_read ON public.notifications (is_read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'notifications'
          AND policyname = 'Users can view their own notifications'
    ) THEN
        CREATE POLICY "Users can view their own notifications"
        ON public.notifications
        FOR SELECT
        TO authenticated
        USING (auth.uid()::text = user_id::text OR (SELECT firebase_uid FROM public.users WHERE id = user_id) = auth.uid()::text);
    END IF;
END $$;
