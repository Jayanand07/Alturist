-- ============================================================================
-- ALTRUIST WELLNESS PLATFORM — ULTIMATE SECURITY MIGRATION
-- ============================================================================
-- This migration secures all tables to resolve the Supabase Security Linter Warnings:
-- 1. "rls_disabled_in_public" (Row Level Security Disabled)
-- 2. "sensitive_columns_exposed" (Sensitive columns exposed without RLS protection)
-- 3. "pg_graphql_anon_table_exposed" (Public can see objects in GraphQL schema)
-- 4. "pg_graphql_authenticated_table_exposed" (Signed-in users can see objects in GraphQL schema)
--
-- Note: Our Spring Boot backend connects using the "postgres" superuser / database owner role,
-- which bypasses RLS by default. Revoking SELECT and enabling RLS will NOT affect the JDBC backend,
-- but will completely secure the tables from direct unauthorized access via PostgREST (Data API)
-- and pg_graphql.
-- ============================================================================

-- ── 1. Enable Row Level Security (RLS) on all exposed public tables ──────────
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ── 2. Revoke Select & Modify Permissions from anon and authenticated roles ──
-- This removes the tables from the PostgREST API and pg_graphql schema completely,
-- blocking all unauthorized and public discovery.

REVOKE ALL ON TABLE public.support_tickets FROM anon, authenticated;
REVOKE ALL ON TABLE public.support_messages FROM anon, authenticated;
REVOKE ALL ON TABLE public.user_subscriptions FROM anon, authenticated;
REVOKE ALL ON TABLE public.subscription_plans FROM anon, authenticated;
REVOKE ALL ON TABLE public.notifications FROM anon, authenticated;
REVOKE ALL ON TABLE public.chat_messages FROM anon, authenticated;
REVOKE ALL ON TABLE public.consultations FROM anon, authenticated;
REVOKE ALL ON TABLE public.consultation_ratings FROM anon, authenticated;
REVOKE ALL ON TABLE public.doctor_vlogs FROM anon, authenticated;
REVOKE ALL ON TABLE public.doctors FROM anon, authenticated;
REVOKE ALL ON TABLE public.medicines FROM anon, authenticated;
REVOKE ALL ON TABLE public.orders FROM anon, authenticated;
REVOKE ALL ON TABLE public.prescriptions FROM anon, authenticated;
REVOKE ALL ON TABLE public.users FROM anon, authenticated;

-- ── 3. Grant full privileges back to postgres owner role (for double safety) ──
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
