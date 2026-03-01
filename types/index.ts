export type Intent = 'study_only' | 'study_and_connect' | 'connect_only';
export type Campus = 'city' | 'east';
export type SwipeDirection = 'left' | 'right';

export interface Prompt {
  question: string;
  answer: string;
}

export interface Profile {
  id: string;
  name: string;
  major: string;
  year: string;
  gender: string;
  age: number;
  bio?: string;
  intent: Intent;
  prompts: Prompt[];
  photos: string[];
  is_onboarded: boolean;
  created_at: string;
}

export interface StudyWindow {
  id: string;
  user_id: string;
  date: string;        // ISO date string YYYY-MM-DD
  start_time: string;  // HH:MM
  end_time: string;    // HH:MM
  subjects: string[];
  building_id: string;
  campus: Campus;
  created_at: string;
}

export interface Swipe {
  id: string;
  swiper_id: string;
  swiped_id: string;
  direction: SwipeDirection;
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_window: MatchedWindow | null;
  created_at: string;
}

export interface MatchedWindow {
  date: string;
  start_time: string;
  end_time: string;
  building_id: string;
  campus: Campus;
  subjects: string[];
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string | null;
  content: string;
  is_auto: boolean;
  created_at: string;
}

// Extended types for UI
export interface ProfileWithWindows extends Profile {
  study_windows: StudyWindow[];
  overlapping_windows?: StudyWindow[];
}

export interface MatchWithProfile extends Match {
  other_profile: Profile;
  last_message?: Message;
  unread_count?: number;
}
