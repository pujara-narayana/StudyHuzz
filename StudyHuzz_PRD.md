# StudyHuzz — Product Requirements Document
**Version:** 1.0  
**Hackathon:** RaikesHacks @ University of Nebraska-Lincoln  
**Track:** FindU ("Build a tool that helps students discover or connect with people, places, or opportunities around them")  
**Platform:** Mobile (React Native + Expo)  
**Target Users:** UNL Students  

---

## 1. Executive Summary

StudyHuzz is a campus-native mobile app that helps UNL students find compatible study partners at the right time and place. Users set study windows with subjects, swipe on compatible profiles, match, and chat — with an auto-generated icebreaker message to kick things off. It's Tinder meets scheduling meets campus discovery, built exclusively for UNL.

---

## 2. Tech Stack

### Frontend (Mobile)
- **Framework:** React Native with Expo (SDK 51+)
- **Navigation:** Expo Router (file-based routing)
- **UI Components:** React Native Paper + custom components
- **Gestures/Swipe:** `react-native-deck-swiper` or `react-native-gesture-handler` with `react-native-reanimated`
- **Icons:** `@expo/vector-icons` (Ionicons)
- **Image Picker:** `expo-image-picker`
- **Date/Time:** `@react-native-community/datetimepicker`

### Backend & Services
- **Auth:** Supabase Auth (email + password; validate `.edu` email suffix)
- **Database:** Supabase (PostgreSQL)
- **Realtime Chat:** Supabase Realtime channels
- **File Storage:** Supabase Storage (profile photos)
- **API Layer:** Supabase client SDK (no separate backend needed)

### Development Tools
- **Package Manager:** npm
- **Environment Variables:** `expo-constants` + `.env`
- **Dev Build:** Expo Go for development; EAS Build for production APK/IPA

### Seeded Dev Data
- Use `randomuser.me` API to pull placeholder profile images (explicitly allows usage)
- Or use local static assets: free-to-use photos from Unsplash (with proper attribution in dev-only comments)
- 25 hardcoded seed profiles across diverse majors, years, genders, schedule windows, and intent types

---

## 3. App Architecture

```
studyhuzz/
├── app/                          # Expo Router screens
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (onboarding)/
│   │   ├── step1-basics.tsx      # Name, major, year, gender, age
│   │   ├── step2-photos.tsx      # Upload 3–6 photos
│   │   ├── step3-intent.tsx      # What are you looking for
│   │   └── step4-prompts.tsx     # Optional 3 prompts
│   ├── (tabs)/
│   │   ├── discover.tsx          # Swipe feed
│   │   ├── schedule.tsx          # Add/edit study windows
│   │   ├── matches.tsx           # Matched profiles list
│   │   └── profile.tsx           # Own profile view/edit
│   └── chat/
│       └── [matchId].tsx         # Real-time chat screen
├── components/
│   ├── SwipeCard.tsx
│   ├── SchedulePicker.tsx
│   ├── ProfileWizardStep.tsx
│   ├── ChatBubble.tsx
│   ├── MatchCard.tsx
│   └── IntentBadge.tsx
├── lib/
│   ├── supabase.ts               # Supabase client init
│   ├── matching.ts               # Time overlap + compatibility algorithm
│   └── constants.ts              # Buildings, majors, prompts, genders
├── hooks/
│   ├── useAuth.ts
│   ├── useMatching.ts
│   └── useChat.ts
├── types/
│   └── index.ts                  # All TypeScript types/interfaces
└── supabase/
    └── seed.sql                  # Dev seed data
```

---

## 4. Database Schema (Supabase / PostgreSQL)

### `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  major TEXT NOT NULL,
  year TEXT NOT NULL,                        -- Freshman, Sophomore, Junior, Senior, Graduate
  gender TEXT NOT NULL,
  age INTEGER,
  bio TEXT,
  intent TEXT NOT NULL,                      -- 'study_only' | 'study_and_connect' | 'connect_only'
  prompts JSONB,                             -- [{ question: string, answer: string }]
  photos TEXT[],                             -- Array of Supabase Storage URLs (min 3, max 6)
  is_onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `study_windows`
```sql
CREATE TABLE study_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,                        -- Specific date (never in the past)
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subjects TEXT[] NOT NULL,                  -- e.g. ['Organic Chemistry', 'Calculus II']
  building_id TEXT NOT NULL,                 -- References constant building list
  campus TEXT NOT NULL,                      -- 'city' | 'east'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_past_dates CHECK (date >= CURRENT_DATE)
);
```

### `swipes`
```sql
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  swiped_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  direction TEXT NOT NULL,                   -- 'left' | 'right'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(swiper_id, swiped_id)
);
```

### `matches`
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  matched_window JSONB,                      -- Snapshot of overlapping window details
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);
```

### `messages`
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_auto BOOLEAN DEFAULT FALSE,             -- TRUE for system-generated icebreaker
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies — Apply to ALL tables
- `profiles`: Users can SELECT any profile, UPDATE only their own
- `study_windows`: Users can CRUD only their own windows
- `swipes`: Users can INSERT their own swipes, SELECT their own
- `matches`: Users can SELECT matches where they are user1 or user2
- `messages`: Users can SELECT and INSERT messages in their own matches

---

## 5. Constants (`lib/constants.ts`)

### UNL Buildings — City Campus
```typescript
export const CITY_CAMPUS_BUILDINGS = [
  "Love Library",
  "Adele Coryell Hall",
  "Andersen Hall",
  "Avery Hall",
  "Bessey Hall",
  "Burnett Hall",
  "Canfield Administration Building",
  "Cather Dining Complex",
  "Chase Hall",
  "College of Business (CBA)",
  "Dinsdale Family Learning Commons",
  "Henzlik Hall",
  "Jackie Gaughan Multicultural Center",
  "Kauffman Academic Residential Center",
  "Lied Center for Performing Arts",
  "Memorial Stadium (study areas)",
  "Nebraska Union",
  "Richards Hall",
  "Schorr Center",
  "Sheldon Museum of Art (reading room)",
  "Temple Building",
  "Vine Street Shops (café study areas)",
  "Westbrook Music Building",
];
```

### UNL Buildings — East Campus
```typescript
export const EAST_CAMPUS_BUILDINGS = [
  "C.Y. Thompson Library",
  "Animal Science Building",
  "Biochemistry Hall",
  "Food Industry Complex",
  "Hardin Hall",
  "Keim Hall",
  "Mussehl Hall",
  "Prem S. Paul Research Center",
  "Veterinary Science Building",
];
```

### Majors (abbreviated list — expand as needed)
```typescript
export const MAJORS = [
  "Actuarial Science", "Advertising", "Agribusiness", "Agricultural Economics",
  "Animal Science", "Architecture", "Art", "Biochemistry", "Biology",
  "Business Administration", "Chemical Engineering", "Chemistry",
  "Civil Engineering", "Communication Studies", "Computer Engineering",
  "Computer Science", "Criminal Justice", "Data Science", "Economics",
  "Education", "Electrical Engineering", "English", "Environmental Science",
  "Finance", "Graphic Design", "History", "Industrial Engineering",
  "Journalism", "Marketing", "Mathematics", "Mechanical Engineering",
  "Music", "Nursing", "Philosophy", "Physics", "Political Science",
  "Pre-Med", "Psychology", "Public Health", "Sociology", "Statistics",
  "Supply Chain Management", "Theatre", "Other"
];
```

### Genders
```typescript
export const GENDERS = [
  "Man", "Woman", "Non-binary", "Genderqueer", "Genderfluid",
  "Agender", "Transgender Man", "Transgender Woman",
  "Two-Spirit", "Prefer not to say", "Other"
];
```

### Years
```typescript
export const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate", "PhD"];
```

### Intent Options
```typescript
export const INTENTS = [
  { value: "study_only", label: "Study Partner Only", icon: "book-outline", description: "Looking for someone to hit the books with, nothing more." },
  { value: "study_and_connect", label: "Study + Get to Know Each Other", icon: "people-outline", description: "Open to both studying and seeing where things go." },
  { value: "connect_only", label: "Meet New People", icon: "heart-outline", description: "More interested in making connections than studying." },
];
```

### Prompt Questions (users pick 3)
```typescript
export const PROMPT_QUESTIONS = [
  "My go-to study snack is…",
  "You'll find me studying at…",
  "I work best when…",
  "My study playlist includes…",
  "The class that changed my life…",
  "Ask me about…",
  "A fun fact about my major…",
  "After finals, I celebrate by…",
  "My biggest campus pet peeve…",
  "My study alter ego is…",
  "I'll always be down for…",
  "The weirdest thing I've studied…",
];
```

---

## 6. Screens & Feature Specification

---

### 6.1 Auth Screens

#### Login (`app/(auth)/login.tsx`)
- Email + Password fields
- "Login" button → Supabase `signInWithPassword`
- Link to Signup
- On success: if `is_onboarded = false` → redirect to Onboarding Step 1; else → redirect to `(tabs)/discover`

#### Signup (`app/(auth)/signup.tsx`)
- Email field with client-side validation: must end in `.edu`
- Show error "Please use your university email (.edu)" if not `.edu`
- Password (min 8 chars) + Confirm Password
- "Create Account" → Supabase `signUp`
- Auto-redirect to Onboarding Step 1 after signup

---

### 6.2 Onboarding Flow (4 Steps)

Progress bar at top showing Step X of 4. Users cannot skip. Back button available except on Step 1.

#### Step 1 — The Basics (`step1-basics.tsx`)
Fields:
- **First Name** (text input)
- **Age** (number input, 17–35)
- **Gender** (scrollable pill selector from GENDERS list)
- **Year** (pill selector from YEARS)
- **Major** (searchable dropdown from MAJORS list)

Validation: All fields required. "Next" button disabled until complete.

#### Step 2 — Photos (`step2-photos.tsx`)
- Photo upload grid (3 slots mandatory, up to 6 total)
- Tapping a slot opens `expo-image-picker`
- Show "Add at least 3 photos to continue"
- Images uploaded to Supabase Storage bucket `profile-photos/{userId}/{uuid}.jpg`
- Show upload progress per photo
- "Next" enabled only when ≥3 photos uploaded successfully

#### Step 3 — Intent (`step3-intent.tsx`)
- Full-screen card selector showing 3 intent options
- Each card has icon, label, description
- Single-select — tapping highlights the card
- "Next" disabled until one selected

#### Step 4 — Prompts (`step4-prompts.tsx`)
- Header: "Show your personality (optional)"
- Show 3 prompt slots; each slot has a dropdown to pick a question and a text area for the answer
- Skip button available on this step ("Skip for now")
- "Finish" button saves profile (`is_onboarded = true`) and redirects to `(tabs)/schedule` with a prompt: "Add your first study window to start finding matches!"

---

### 6.3 Schedule Tab (`app/(tabs)/schedule.tsx`)

This is the core differentiator. Users define when and where they're studying.

#### UI Layout
- Header: "My Study Schedule"
- Horizontal date strip showing 7 days (Today through Today+6). Dates in the past are greyed out and unselectable.
- Selected day shows existing study windows for that day as cards
- "+" FAB button to add a new window for the selected day

#### Study Window Card (existing window)
Shows:
- Time range (e.g., "2:00 PM – 4:30 PM")
- Building name + Campus badge (City / East)
- Subject chips (e.g., "Calculus II", "Physics 212")
- Edit (pencil) icon and Delete (trash) icon

#### Add/Edit Study Window Modal (bottom sheet)
Fields:
- **Date:** Pre-filled from selected day. Date picker if editing. Must be today or future.
- **Start Time:** Time picker (15-minute increments)
- **End Time:** Time picker (must be after start time, same day)
- **Campus:** Toggle — "City Campus" / "East Campus"
- **Building:** Dropdown filtered by selected campus
- **Subjects/Topics:** Tag input — user types a subject and presses Enter/comma to add as chip. Min 1, max 5. Examples: "Orgo Chem", "Data Structures", "Essay draft"

Validation:
- Cannot save if date is in the past
- End time must be > start time
- At least 1 subject required
- Building required

Save calls `INSERT INTO study_windows` or `UPDATE` if editing.

---

### 6.4 Discover Tab — Swipe Feed (`app/(tabs)/discover.tsx`)

The main Tinder-like swipe interface.

#### Matching Algorithm (runs on backend/query)
When the Discover screen loads, fetch candidate profiles by:

1. **Get current user's study windows** for today and the next 7 days
2. **Find other users' windows that overlap in time** (any overlap, even 30 min) on the same date
3. **Filter by intent compatibility:**
   - `study_only` ↔ `study_only` ✅
   - `study_only` ↔ `study_and_connect` ✅
   - `study_and_connect` ↔ `study_and_connect` ✅
   - `connect_only` ↔ `connect_only` ✅
   - `connect_only` ↔ `study_and_connect` ✅
   - `study_only` ↔ `connect_only` ❌ (hidden from each other)
4. **Exclude already-swiped profiles** (check swipes table)
5. **Exclude own profile**
6. **Optional filter by building** (if user has a building preference set — show same-building profiles first)
7. Return up to 30 profiles, ordered by: same building > same campus > same major > everything else

#### Card Layout
Each swipe card shows:
- **Photo carousel** (swipe left/right on photos within card, or auto-shows first photo)
- Name + Age (e.g., "Sarah, 20")
- Year + Major badge (e.g., "Junior · Computer Science")
- Intent badge (color-coded: blue = Study Only, green = Study + Connect, pink = Connect)
- **"Studying" section:** List of overlapping windows with times, building, and subjects
  - e.g., "📚 Tue 3–5 PM · Love Library · Orgo Chem, Biochem"
- First prompt (if filled)

#### Swipe Actions
- Swipe RIGHT or tap green ✓ button → "like" (insert `direction: 'right'`)
- Swipe LEFT or tap red ✗ button → "pass" (insert `direction: 'left'`)
- Tap card → expand to full profile modal

#### Match Detection
After every right swipe, check if the other person has already swiped right on the current user:

```typescript
// In matching.ts
async function checkAndCreateMatch(swiperId, swipedId) {
  const existingSwipe = await supabase
    .from('swipes')
    .select()
    .eq('swiper_id', swipedId)
    .eq('swiped_id', swiperId)
    .eq('direction', 'right')
    .single();

  if (existingSwipe.data) {
    // Create match
    const match = await supabase.from('matches').insert({
      user1_id: swiperId,
      user2_id: swipedId,
      matched_window: computeOverlappingWindow(...)
    }).select().single();

    // Insert auto icebreaker message
    await supabase.from('messages').insert({
      match_id: match.data.id,
      sender_id: null, // system
      content: buildIcebreakerMessage(overlappingWindow),
      is_auto: true
    });

    // Show match animation
    triggerMatchAnimation();
  }
}
```

#### Match Animation (It's a Match!)
When a mutual match occurs:
- Full-screen overlay with confetti animation (`react-native-confetti-cannon` or custom)
- Both profile photos shown side by side
- Text: "It's a StudyHuzz Match! 🎉"
- Subtext: The auto-generated icebreaker preview
- Two buttons: "Send Message" → go to chat, "Keep Swiping" → dismiss

#### Empty State
If no compatible profiles: "No study partners found for your schedule. Try adding more study windows or check back later!" with a cute illustration.

#### Filter Button (top-right)
Opens bottom sheet with optional filters:
- Campus (City / East / Both)
- Building (dropdown)
- Major (multi-select)
- Year (multi-select)

Filters are applied on top of the core matching algorithm.

---

### 6.5 Matches Tab (`app/(tabs)/matches.tsx`)

List of all mutual matches.

#### Layout
- Header: "Matches"
- Horizontal scroll row at top: "New Matches" — profiles you matched with but haven't messaged yet (bubble format like Instagram DMs)
- Below: Conversation list sorted by most recent message
  - Shows: avatar, name, last message preview, timestamp
  - Unread messages shown with bold text + unread dot
- Tap any match → navigate to `chat/[matchId]`

---

### 6.6 Chat Screen (`app/chat/[matchId].tsx`)

Real-time 1:1 messaging.

#### Layout
- Header: Profile photo + name, "Study Details" button (shows matched window info)
- Message list (FlatList, inverted)
- Input bar at bottom: text field + send button

#### Auto Icebreaker Message
Shown as the first message, visually distinguished (light grey background, centered, with a 📚 icon). Not attributed to either user — labeled "StudyHuzz".

**Format:**
```
📚 You both matched!
Studying: Tuesday, March 5 · 2:00 PM – 4:30 PM
📍 Love Library (City Campus)
Topics: Organic Chemistry, Biochemistry

Say hi and lock in your study date! 👋
```

#### Realtime
Use Supabase Realtime:
```typescript
const channel = supabase.channel(`chat:${matchId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `match_id=eq.${matchId}`
  }, (payload) => {
    setMessages(prev => [...prev, payload.new]);
  })
  .subscribe();
```

---

### 6.7 Profile Tab (`app/(tabs)/profile.tsx`)

Shows current user's profile as others would see it. 

- Photo carousel at top
- Edit button (pencil icon top-right) → opens profile edit screen
- Sections: Name/Age/Year/Major, Intent badge, Study Windows this week, Prompts
- "Edit Schedule" shortcut button → navigates to Schedule tab
- Sign Out button at bottom

---

## 7. Auto-Generated Icebreaker Message Logic

```typescript
// lib/matching.ts
function buildIcebreakerMessage(
  window: OverlappingWindow,
  user1: Profile,
  user2: Profile
): string {
  const dateStr = formatDate(window.date);           // "Tuesday, March 5"
  const timeStr = `${formatTime(window.startTime)} – ${formatTime(window.endTime)}`;
  const subjects = window.subjects.join(", ");
  const building = window.buildingName;
  const campus = window.campus === 'city' ? 'City Campus' : 'East Campus';

  return `📚 You both matched!\nStudying: ${dateStr} · ${timeStr}\n📍 ${building} (${campus})\nTopics: ${subjects}\n\nSay hi and lock in your study date! 👋`;
}
```

The overlapping window is computed at match time by finding the intersection of the two users' overlapping windows (latest start time → earliest end time), and the subjects are the union of both users' subjects for that window.

---

## 8. Seed Data for Development

Create 25 hardcoded profiles in `supabase/seed.sql` with:
- Mixed genders, majors, years, intents
- Study windows distributed across the next 7 days at various times (morning, afternoon, evening)
- Buildings distributed across both campuses
- Photos: Use RandomUser.me API URLs (e.g., `https://randomuser.me/api/portraits/women/1.jpg`) — these are free, copyright-clear placeholder images

Example seed profile structure:
```sql
INSERT INTO profiles (id, name, major, year, gender, age, intent, prompts, photos, is_onboarded)
VALUES (
  gen_random_uuid(),
  'Emma',
  'Biology',
  'Junior',
  'Woman',
  21,
  'study_and_connect',
  '[{"question": "My go-to study snack is…", "answer": "Iced coffee and Trader Joe''s everything crackers"},
   {"question": "My study playlist includes…", "answer": "Lo-fi hip hop, obviously"},
   {"question": "The class that changed my life…", "answer": "Cell Biology — I finally understood why I was pre-med"}]',
  ARRAY['https://randomuser.me/api/portraits/women/1.jpg',
        'https://randomuser.me/api/portraits/women/2.jpg',
        'https://randomuser.me/api/portraits/women/3.jpg'],
  TRUE
);
```

Repeat for 24 more profiles with varied attributes, then insert corresponding `study_windows`.

---

## 9. Navigation Structure

```
Root Navigator
├── (auth) — shown if not logged in
│   ├── login
│   └── signup
├── (onboarding) — shown if logged in but is_onboarded = false
│   ├── step1-basics
│   ├── step2-photos
│   ├── step3-intent
│   └── step4-prompts
└── (tabs) — shown if logged in and is_onboarded = true
    ├── discover (default)
    ├── schedule
    ├── matches
    ├── profile
    └── /chat/[matchId] (presented modally)
```

Use Expo Router's `(auth)`, `(tabs)` group layout pattern. Root `_layout.tsx` checks auth state from Supabase and redirects accordingly.

---

## 10. Design System

### Color Palette
```
Primary:     #6C47FF  (purple — StudyHuzz brand)
Secondary:   #FF6B6B  (coral — for matches/hearts)
Background:  #0F0F13  (near-black — dark mode first)
Card BG:     #1A1A24
Surface:     #242433
Text Primary: #FFFFFF
Text Secondary: #A0A0B8
Border:      #2E2E42
Success:     #4ECDC4  (teal)
```

### Intent Badge Colors
```
study_only:        #4A90D9  (blue)
study_and_connect: #7B68EE  (medium purple)
connect_only:      #FF6B9D  (pink)
```

### Typography
```
Heading 1: 28px Bold
Heading 2: 22px SemiBold
Body:      16px Regular
Caption:   13px Regular
```

### Component Patterns
- Cards: `borderRadius: 20`, subtle shadow, Card BG color
- Buttons (primary): Full-width, `borderRadius: 14`, Primary color, white text, height 52
- Buttons (secondary): Outlined, border Primary color
- Inputs: Surface color background, Border color border, `borderRadius: 12`, padding 14
- Pills/chips: `borderRadius: 20`, Surface background, small text

---

## 11. Key Edge Cases to Handle

| Scenario | Handling |
|---|---|
| User has no study windows | Discover tab shows empty state with CTA to add windows |
| No compatible profiles found | Empty state with illustration and tip |
| User tries to add past date window | Date picker disables past dates; server also validates |
| Match on both sides simultaneously | Use Supabase unique constraint + upsert to prevent duplicate matches |
| User deletes a study window after matching | Matched window stored as JSONB snapshot at match time — not affected |
| Photo upload fails | Show retry button; don't advance step until all uploads succeed |
| Non-.edu email | Client + server validation with clear error message |
| App goes to background during chat | Supabase realtime reconnects automatically |
| Two users with same match potential | Only one match row created (unique constraint on user1+user2, normalized so lower UUID is always user1) |

---

## 12. Supabase Setup Checklist

1. Create new Supabase project
2. Run schema SQL (Section 4) in SQL editor
3. Enable Row Level Security on all tables
4. Apply RLS policies as specified
5. Create Storage bucket `profile-photos` with public read access
6. Enable Realtime on `messages` table
7. Copy `SUPABASE_URL` and `SUPABASE_ANON_KEY` to `.env`

---

## 13. Environment Variables

```
# .env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
```

---

## 14. Out of Scope (Hackathon Version)

The following are intentionally excluded to keep scope manageable:
- Push notifications (matches/messages)
- Blocking/reporting users
- Profile verification
- Video profiles
- In-app study timer
- Location-based GPS matching (building is manually selected)
- Instagram/social linking
- Payment or premium features

---

## 15. Pitch Framing for Judges

**FindU Track fit:** StudyHuzz directly helps students discover compatible people (by intent), places (UNL campus buildings), and opportunities (study sessions) around them — all three pillars of FindU's track.

**Differentiators to highlight:**
1. Time-aware matching — profiles only appear when both users are actually free at the same time
2. Intent filtering — ensures no one gets unwanted interactions
3. Auto icebreaker — removes friction and makes the first message feel natural
4. UNL-native — hardcoded to their exact campus, buildings, and student community
5. Scalable — can be replicated at any university

---

*Document prepared for Claude Code. Build each screen sequentially following the navigation structure. Start with Supabase setup + schema, then auth screens, onboarding, then tabs in order: schedule, discover, matches, profile, chat.*
