-- 01_secure_chat_rls.sql
-- Production Security Migration for Altruist Supabase Realtime Chat

-- Enforce RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 1. Restrict INSERT access:
-- Users can solely insert messages if their Firebase UID (sync'd via our custom backend JWT)
-- strictly matches the sender_id defined in the insertion request.
CREATE POLICY "Users can only insert their own messages"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
   -- The `request.jwt.claim.firebase_uid` corresponds to the signed variable passed via `SUPABASE_JWT_SECRET`
   sender_id = current_setting('request.jwt.claim.firebase_uid', true)
   AND sender_id IS NOT NULL
);

-- 2. Restrict SELECT access:
-- Authorized users can only list messages for rooms they possess a secure consultation_id for.
CREATE POLICY "Authenticated users can read messages by consultation_id"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (
  sender_id = current_setting('request.jwt.claim.firebase_uid', true)
  OR consultation_id IN (
    SELECT c.id
    FROM consultations c
    JOIN users patient_user ON patient_user.id = c.patient_id
    JOIN doctors doctor ON doctor.id = c.doctor_id
    JOIN users doctor_user ON doctor_user.id = doctor.user_id
    WHERE patient_user.firebase_uid = current_setting('request.jwt.claim.firebase_uid', true)
       OR doctor_user.firebase_uid = current_setting('request.jwt.claim.firebase_uid', true)
  )
);

-- 3. Block all updates and deletions
CREATE POLICY "Prevent message updates"
ON public.chat_messages FOR UPDATE TO authenticated USING (false);

CREATE POLICY "Prevent message deletes"
ON public.chat_messages FOR DELETE TO authenticated USING (false);
