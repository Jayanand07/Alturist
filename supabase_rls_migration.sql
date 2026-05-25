-- This migration enables Row Level Security (RLS) on the support tables
-- to resolve the Supabase security linter warning:
-- "Table `public.support_tickets` is public, but RLS has not been enabled."

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Note: Our Spring Boot backend connects using the postgres role (or a superuser role),
-- which bypasses RLS by default. Therefore, no additional RLS policies need to be created
-- to allow the backend to read/write these tables. This simply secures the tables from
-- direct anonymous access via the Supabase Data API (PostgREST), which we don't use.
