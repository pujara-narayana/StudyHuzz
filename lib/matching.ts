import { supabase } from './supabase';
import { StudyWindow, MatchedWindow, Profile } from '../types';

// ─── Time Helpers ────────────────────────────────────────────────────────────

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

// ─── Window Overlap ───────────────────────────────────────────────────────────

export function windowsOverlap(a: StudyWindow, b: StudyWindow): boolean {
  if (a.date !== b.date) return false;
  const aStart = timeToMinutes(a.start_time);
  const aEnd = timeToMinutes(a.end_time);
  const bStart = timeToMinutes(b.start_time);
  const bEnd = timeToMinutes(b.end_time);
  const overlapMinutes = Math.min(aEnd, bEnd) - Math.max(aStart, bStart);
  return overlapMinutes >= 30; // at least 30-min overlap
}

export function computeOverlappingWindow(
  a: StudyWindow,
  b: StudyWindow
): MatchedWindow {
  const aStart = timeToMinutes(a.start_time);
  const aEnd = timeToMinutes(a.end_time);
  const bStart = timeToMinutes(b.start_time);
  const bEnd = timeToMinutes(b.end_time);

  const overlapStart = Math.max(aStart, bStart);
  const overlapEnd = Math.min(aEnd, bEnd);

  // Union subjects
  const subjects = Array.from(new Set([...a.subjects, ...b.subjects]));

  return {
    date: a.date,
    start_time: minutesToTime(overlapStart),
    end_time: minutesToTime(overlapEnd),
    building_id: a.building_id, // prefer user1's building
    campus: a.campus,
    subjects,
  };
}

// ─── Icebreaker Builder ───────────────────────────────────────────────────────

export function buildIcebreakerMessage(window: MatchedWindow): string {
  const dateStr = formatDate(window.date);
  const timeStr = `${formatTime(window.start_time)} – ${formatTime(window.end_time)}`;
  const subjects = window.subjects.slice(0, 3).join(', ');
  const campus = window.campus === 'city' ? 'City Campus' : 'East Campus';

  return `📚 You both matched!\nStudying: ${dateStr} · ${timeStr}\n📍 ${window.building_id} (${campus})\nTopics: ${subjects}\n\nSay hi and lock in your study date! 👋`;
}

// ─── Match Detection & Creation ──────────────────────────────────────────────

export async function checkAndCreateMatch(
  swiperId: string,
  swipedId: string
): Promise<{ matched: boolean; matchId?: string; icebreaker?: string }> {
  // Check if swiped user has already right-swiped on swiper
  const { data: existingSwipe } = await supabase
    .from('swipes')
    .select()
    .eq('swiper_id', swipedId)
    .eq('swiped_id', swiperId)
    .eq('direction', 'right')
    .maybeSingle();

  if (!existingSwipe) return { matched: false };

  // Normalize user IDs (lower UUID = user1)
  const [user1_id, user2_id] =
    swiperId < swipedId ? [swiperId, swipedId] : [swipedId, swiperId];

  // Find overlapping study window to store as snapshot
  const { data: swiperWindows } = await supabase
    .from('study_windows')
    .select()
    .eq('user_id', swiperId)
    .gte('date', new Date().toISOString().split('T')[0]);

  const { data: swipedWindows } = await supabase
    .from('study_windows')
    .select()
    .eq('user_id', swipedId)
    .gte('date', new Date().toISOString().split('T')[0]);

  let matchedWindow: MatchedWindow | null = null;
  if (swiperWindows && swipedWindows) {
    for (const a of swiperWindows) {
      for (const b of swipedWindows) {
        if (windowsOverlap(a as StudyWindow, b as StudyWindow)) {
          matchedWindow = computeOverlappingWindow(a as StudyWindow, b as StudyWindow);
          break;
        }
      }
      if (matchedWindow) break;
    }
  }

  // Create match (ignore duplicate errors from unique constraint)
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .insert({ user1_id, user2_id, matched_window: matchedWindow })
    .select()
    .single();

  if (matchError || !match) return { matched: false };

  // Build icebreaker
  const icebreaker = matchedWindow
    ? buildIcebreakerMessage(matchedWindow)
    : '📚 You matched! Say hi and set up a study session! 👋';

  // Insert auto icebreaker message
  await supabase.from('messages').insert({
    match_id: match.id,
    sender_id: null,
    content: icebreaker,
    is_auto: true,
  });

  return { matched: true, matchId: match.id, icebreaker };
}

// ─── Candidate Discovery Query ───────────────────────────────────────────────

export async function fetchDiscoverCandidates(
  userId: string,
  userIntent: string,
  filters?: {
    campus?: string;
    building?: string;
    majors?: string[];
    years?: string[];
  }
): Promise<string[]> {
  const today = new Date().toISOString().split('T')[0];
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  // Get current user's windows
  const { data: myWindows } = await supabase
    .from('study_windows')
    .select()
    .eq('user_id', userId)
    .gte('date', today)
    .lte('date', weekEnd);

  if (!myWindows?.length) return [];

  // Get already-swiped profiles
  const { data: swiped } = await supabase
    .from('swipes')
    .select('swiped_id')
    .eq('swiper_id', userId);

  const excludedIds = new Set([userId, ...(swiped?.map((s) => s.swiped_id) ?? [])]);

  // Get compatible intent values
  const { INTENT_COMPATIBILITY } = await import('./constants');
  const compatibleIntents = INTENT_COMPATIBILITY[userIntent] ?? [];

  // Build profiles query
  let query = supabase
    .from('profiles')
    .select('id, intent, major, year')
    .eq('is_onboarded', true)
    .in('intent', compatibleIntents);

  if (filters?.majors?.length) query = query.in('major', filters.majors);
  if (filters?.years?.length) query = query.in('year', filters.years);

  const { data: candidates } = await query;
  if (!candidates) return [];

  const filteredCandidates = candidates.filter((c) => !excludedIds.has(c.id));

  // Find candidates with overlapping windows
  const matchingIds: string[] = [];
  for (const candidate of filteredCandidates) {
    const { data: theirWindows } = await supabase
      .from('study_windows')
      .select()
      .eq('user_id', candidate.id)
      .gte('date', today)
      .lte('date', weekEnd);

    if (!theirWindows?.length) continue;

    const hasOverlap = myWindows.some((mine) =>
      theirWindows.some((theirs) =>
        windowsOverlap(mine as StudyWindow, theirs as StudyWindow)
      )
    );

    if (hasOverlap) matchingIds.push(candidate.id);
    if (matchingIds.length >= 30) break;
  }

  return matchingIds;
}
