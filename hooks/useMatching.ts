import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { fetchDiscoverCandidates, checkAndCreateMatch } from '../lib/matching';
import { ProfileWithWindows } from '../types';

export function useMatching(userId: string, userIntent: string) {
  const [candidates, setCandidates] = useState<ProfileWithWindows[]>([]);
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<{
    matched: boolean;
    matchId?: string;
    icebreaker?: string;
    profile?: ProfileWithWindows;
  } | null>(null);

  const loadCandidates = useCallback(
    async (filters?: {
      campus?: string;
      building?: string;
      majors?: string[];
      years?: string[];
    }) => {
      if (!userId || !userIntent) return;
      setLoading(true);
      try {
        const ids = await fetchDiscoverCandidates(userId, userIntent, filters);
        if (!ids.length) {
          setCandidates([]);
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', ids);

        if (!profiles) return;

        const profilesWithWindows: ProfileWithWindows[] = await Promise.all(
          profiles.map(async (p) => {
            const { data: windows } = await supabase
              .from('study_windows')
              .select('*')
              .eq('user_id', p.id)
              .gte('date', today)
              .lte('date', weekEnd);
            return { ...p, study_windows: windows ?? [] };
          })
        );

        setCandidates(profilesWithWindows);
      } finally {
        setLoading(false);
      }
    },
    [userId, userIntent]
  );

  const swipeRight = useCallback(
    async (swipedId: string, swipedProfile: ProfileWithWindows) => {
      await supabase.from('swipes').insert({
        swiper_id: userId,
        swiped_id: swipedId,
        direction: 'right',
      });

      const result = await checkAndCreateMatch(userId, swipedId);
      if (result.matched) {
        setMatchResult({ ...result, profile: swipedProfile });
      }
    },
    [userId]
  );

  const swipeLeft = useCallback(
    async (swipedId: string) => {
      await supabase.from('swipes').insert({
        swiper_id: userId,
        swiped_id: swipedId,
        direction: 'left',
      });
    },
    [userId]
  );

  const clearMatchResult = useCallback(() => setMatchResult(null), []);

  return { candidates, loading, matchResult, loadCandidates, swipeRight, swipeLeft, clearMatchResult };
}
