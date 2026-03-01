-- =============================================
-- StudyHuzz Database Schema (Idempotent)
-- Safe to run multiple times in Supabase SQL Editor
-- =============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- DROP TABLES (clean slate if re-running)
-- =============================================
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS swipes CASCADE;
DROP TABLE IF EXISTS study_windows CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =============================================
-- TABLES
-- =============================================

-- NOTE: profiles.id has NO foreign key to auth.users
-- so seed data with fake UUIDs works fine.
-- Real users sign up via Supabase Auth and their
-- auth.uid() matches the profile id they insert.
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  major TEXT NOT NULL,
  year TEXT NOT NULL,
  gender TEXT NOT NULL,
  age INTEGER CHECK (age >= 17 AND age <= 35),
  bio TEXT,
  intent TEXT NOT NULL CHECK (intent IN ('study_only', 'study_and_connect', 'connect_only')),
  prompts JSONB DEFAULT '[]',
  photos TEXT[] DEFAULT '{}',
  is_onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE study_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subjects TEXT[] NOT NULL DEFAULT '{}',
  building_id TEXT NOT NULL,
  campus TEXT NOT NULL CHECK (campus IN ('city', 'east')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT end_after_start CHECK (end_time > start_time)
);

CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  swiped_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('left', 'right')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(swiper_id, swiped_id)
);

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  matched_window JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_auto BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ─── PROFILES ────────────────────────────────
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- ─── STUDY_WINDOWS ───────────────────────────
DROP POLICY IF EXISTS "windows_select_all" ON study_windows;
CREATE POLICY "windows_select_all" ON study_windows
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "windows_insert_own" ON study_windows;
CREATE POLICY "windows_insert_own" ON study_windows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "windows_update_own" ON study_windows;
CREATE POLICY "windows_update_own" ON study_windows
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "windows_delete_own" ON study_windows;
CREATE POLICY "windows_delete_own" ON study_windows
  FOR DELETE USING (auth.uid() = user_id);

-- ─── SWIPES ──────────────────────────────────
DROP POLICY IF EXISTS "swipes_select_own" ON swipes;
CREATE POLICY "swipes_select_own" ON swipes
  FOR SELECT USING (auth.uid() = swiper_id OR auth.uid() = swiped_id);

DROP POLICY IF EXISTS "swipes_insert_own" ON swipes;
CREATE POLICY "swipes_insert_own" ON swipes
  FOR INSERT WITH CHECK (auth.uid() = swiper_id);

-- ─── MATCHES ─────────────────────────────────
DROP POLICY IF EXISTS "matches_select_own" ON matches;
CREATE POLICY "matches_select_own" ON matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "matches_insert_any" ON matches;
CREATE POLICY "matches_insert_any" ON matches
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ─── MESSAGES ────────────────────────────────
DROP POLICY IF EXISTS "messages_select_own" ON messages;
CREATE POLICY "messages_select_own" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id
        AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "messages_insert_own" ON messages;
CREATE POLICY "messages_insert_own" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_id
        AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "messages_insert_auto" ON messages;
CREATE POLICY "messages_insert_auto" ON messages
  FOR INSERT WITH CHECK (sender_id IS NULL AND is_auto = TRUE);

-- =============================================
-- DONE — Next steps:
-- 1. Run seed.sql
-- 2. Create storage bucket 'profile-photos' (public)
-- 3. Enable Realtime on messages table:
--    Dashboard → Database → Replication → toggle messages
-- =============================================
