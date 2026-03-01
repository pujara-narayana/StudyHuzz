import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

// ─── DEV MODE ────────────────────────────────────────────────────────────────
// Set DEV_MODE = true to skip login and jump straight into the app.
// The app will act as seed profile p1 (first profile in seed.sql).
// IMPORTANT: also run supabase/dev-bypass.sql in your Supabase SQL editor
// so writes (swipes, study windows, matches, messages) work without real auth.
// ─────────────────────────────────────────────────────────────────────────────
const DEV_MODE = true;
const DEV_USER_ID = '11111111-0000-0000-0000-000000000001';

// Fallback used if Supabase fetch fails (e.g. network issue)
const DEV_FALLBACK_PROFILE: Profile = {
  id: DEV_USER_ID,
  name: 'Alex Dev',
  major: 'Computer Science',
  year: 'Junior',
  gender: 'Male',
  age: 21,
  bio: 'Dev test account',
  intent: 'study_and_connect',
  prompts: [],
  photos: [],
  is_onboarded: true,
  created_at: new Date().toISOString(),
};
// ─────────────────────────────────────────────────────────────────────────────

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEV_MODE) {
      // Profiles SELECT policy is USING (true) — no auth token needed
      supabase
        .from('profiles')
        .select('*')
        .eq('id', DEV_USER_ID)
        .maybeSingle()
        .then(({ data }) => {
          setProfile(data ?? DEV_FALLBACK_PROFILE);
          setLoading(false);
        });
      return;
    }

    // ── Real auth path (DEV_MODE = false) ─────────────────────────────────
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data);
    setLoading(false);
  }

  async function refreshProfile() {
    const id = DEV_MODE ? DEV_USER_ID : user?.id;
    if (!id) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    setProfile(data);
  }

  async function signOut() {
    if (DEV_MODE) return;
    await supabase.auth.signOut();
  }

  return {
    // In DEV_MODE, return a mock session/user so the AuthGuard in _layout.tsx
    // sees a "logged-in, onboarded" user and routes straight to (tabs)/discover.
    session: DEV_MODE ? ({ user: { id: DEV_USER_ID } } as unknown as Session) : session,
    user: DEV_MODE ? ({ id: DEV_USER_ID, email: 'dev@studyhuzz.app' } as unknown as User) : user,
    profile,
    loading,
    signOut,
    refreshProfile,
  };
}
