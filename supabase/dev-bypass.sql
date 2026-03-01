-- =============================================
-- StudyHuzz — DEV BYPASS (disable RLS)
-- Run this in Supabase SQL Editor when testing
-- with DEV_MODE = true in hooks/useAuth.ts.
--
-- This lets the anonymous (unauthenticated) Supabase
-- client read and write all tables freely, so you can
-- test swipes, study windows, matches, and chat without
-- a real Supabase Auth session.
--
-- DO NOT use this in production!
-- To restore RLS, run schema.sql again.
-- =============================================

ALTER TABLE profiles       DISABLE ROW LEVEL SECURITY;
ALTER TABLE study_windows  DISABLE ROW LEVEL SECURITY;
ALTER TABLE swipes         DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches        DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages       DISABLE ROW LEVEL SECURITY;
