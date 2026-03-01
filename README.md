<div align="center">

# StudyHuzz

### *Find your study match at UNL*

**RaikesHacks 2025 - FindU Track**

[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react)](https://reactnative.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://typescriptlang.org)

</div>


## 🧠 What is StudyHuzz?

StudyHuzz is a **campus-native mobile app** that helps UNL students find compatible study partners at the right time and place. Think of it like Tinder, but instead of romantic matches, you're matching with people who are literally going to be in the same building as you, studying the same subjects, at the same time.

Here's how it works: you open the app, add a "study window" (when you're planning to study, where, and what subject), and then swipe through profiles of other students who have compatible schedules. When two people swipe right on each other, it's a **StudyHuzz Match** and the app automatically sends a custom icebreaker message so you're not stuck staring at an empty chat wondering what to say.


## Why We Built This

We've all been there it's 10 PM the night before an exam, you need someone to study with, and you have no idea who else is grinding at Love Library right now. UNL has 25,000+ students, and the odds that someone in your major is free at the same time as you, in the same building, are actually pretty high. But there's no way to find them.

**StudyHuzz solves a real problem for real students.** It's built specifically for UNL hardcoded with our exact campus buildings, our majors, our vibe. It's not a generic app that happens to work at Nebraska; it's a Nebraska app.

We also thought a lot about the intent problem. Not everyone wants the same thing from a "study partner." Some people just want someone to sit across from at a coffee shop and hold them accountable. Others want to actually collaborate. And some people are mainly trying to meet new people. StudyHuzz handles all three with an intent-matching system that makes sure you only see profiles from people who are looking for the same kind of interaction you are.


## Features

### Smart Study Windows
The core of the app. You tell StudyHuzz when you're going to be studying, where, and what you're working on. The matching algorithm then finds other students with overlapping time slots at compatible locations. It's time-aware matching you only see people who are *actually available* when you are.

- 7-day date strip to plan ahead
- Time pickers for start/end times
- Campus toggle (City or East)
- Building dropdown filtered by campus (23 City Campus + 9 East Campus buildings)
- Subject tag input so you can add multiple topics

### 🃏 Swipe to Match 
The main event. Swipe right if you want to study with someone, left if not. The algorithm factors in:

- **Time overlap** — at least 30 minutes in common
- **Intent compatibility** — Study Only users won't see Connect Only users and vice versa
- **Location** — same building profiles appear first, then same campus, then everything else
- **Already-swiped** — profiles you've already seen get filtered out

Each card shows the person's name, year, major, their overlapping study windows with *you specifically*, and one of their prompts so you get a feel for their personality before swiping.

### Match Animation + Auto Icebreaker
When two people mutually swipe right, a match animation fires. More importantly, the app auto-generates a custom icebreaker message based on your overlapping study window — so the chat already has context about when and where you're both going to be. No awkward "hey" to start.

Example icebreaker:
```
📚 You both matched!
Studying: Tuesday, March 5 · 2:00 PM – 4:30 PM
📍 Love Library (City Campus)
Topics: Organic Chemistry, Biochemistry

Say hi and lock in your study date! 👋
```

### 💬 Real-Time Chat
1:1 chat powered by Supabase Realtime. Messages update instantly without refreshing. The icebreaker is pinned as the first message. You can tap "Study Details" at any time to see the context for your match (when and where you're both free).

### 👤 Profile Onboarding
4-step onboarding flow that collects:
1. **Basics** — name, age, gender, year, major
2. **Photos** — 3 to 6 photos (uploaded to Supabase Storage)
3. **Intent** — Study Only / Study + Connect / Meet New People
4. **Prompts** — optional personality questions (think Hinge, but for studying)

### ✏️ Profile Editing
Edit your name, bio, intent, major, year, gender, and add/remove photos anytime from the Profile tab. Your changes are reflected in the Discover feed immediately.

### 🔍 Filters
On the Discover tab, you can filter by campus, building, major, and year so you can narrow down exactly who you want to study with.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Navigation | Expo Router v6 (file-based) |
| Backend | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| Language | TypeScript |
| Gestures | react-native-gesture-handler + react-native-reanimated v4 |
| Swipe Cards | react-native-deck-swiper |
| Icons | @expo/vector-icons (Ionicons) |
| Image Upload | expo-image-picker |
| Date/Time | @react-native-community/datetimepicker |

**No custom backend needed.** Supabase handles auth, the database, real-time subscriptions, and file storage all in one.


## 📱 How to Run the App

The app is in **DEV mode** — no account creation needed. You'll jump straight into the Discover tab as a pre-seeded profile with 24 other seed students ready to match with.

### Prerequisites
- A smartphone (iOS or Android)
- **Expo Go** app installed:
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- Node.js (v18+) installed on your computer
- npm installed

### Step 1 — Clone the repo
```bash
git clone <repo-url>
cd StudyHuzz
```

### Step 2 — Install dependencies
```bash
npm install
```

### Step 3 — Set up environment variables
The `.env` file is already configured and connects to our live Supabase project. You don't need to create a Supabase account or run any migrations. Everything is pre-configured.

If for some reason the `.env` file is missing, create one with:
```
EXPO_PUBLIC_SUPABASE_URL=https://dxjsvbaytinkhontarpl.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_LBNDovBVBQiAZ4Zuzu6A4A_eu7LOPWs
```

### Step 4 — (One-time) Disable RLS for dev mode
Since we're using DEV mode (no real auth), you need to run a quick SQL script in our Supabase dashboard to let the app write to the database. Open our Supabase project SQL editor and run the contents of `supabase/dev-bypass.sql`.

> **For judges:** We'll have already run this before the demo, so you can skip this step and go straight to Step 5!

### Step 5 — Start the app
```bash
npx expo start
```

This opens a terminal with a **QR code**. Open the **Expo Go** app on your phone and scan it. The app will bundle and launch — should take about 30–60 seconds the first time.

### Step 6 — Start exploring!
The app launches directly to the **Discover tab** as a pre-seeded student profile. Try:
- **Swiping** through other seed profiles on the Discover tab
- **Adding a study window** on the Schedule tab (pick a date, time, building, and subject)
- **Opening a chat** from the Matches tab (swipe right on a profile that has already swiped right on you to trigger a match)
- **Editing your profile** from the Profile tab

## Troubleshooting

**"Unable to resolve module" error on startup**
```bash
npx expo install
npx expo start --clear
```

**App shows a blank white screen**
Close Expo Go, re-scan the QR code. Sometimes the bundler needs a second.

**Swipes/study windows aren't saving**
Make sure `supabase/dev-bypass.sql` has been run in the Supabase SQL editor. With DEV mode on, the app uses a hardcoded user ID — the database needs RLS disabled to allow writes without a real auth session.

**Expo Go says "SDK version mismatch"**
Make sure you're on the latest version of Expo Go. The project uses SDK 54 which works with the current stable Expo Go release on both iOS and Android.

---

## 🎨 Design System

Dark mode first. The whole app uses a purple-forward palette that feels modern and UNL-adjacent.

| Token | Value | Usage |
|---|---|---|
| Primary | `#6C47FF` | Brand purple — buttons, icons, accents |
| Secondary | `#FF6B6B` | Coral — match animations, hearts |
| Background | `#0F0F13` | Near-black — all screen backgrounds |
| Surface | `#242433` | Input fields, card backgrounds |
| Border | `#2E2E42` | Subtle dividers |
| Text Primary | `#FFFFFF` | Headings and main content |
| Text Secondary | `#A0A0B8` | Labels, placeholders |
| Success | `#4ECDC4` | Teal — confirm actions |

**Intent badge colors:**
- Study Only → Blue `#4A90D9`
- Study + Connect → Purple `#7B68EE`
- Connect Only → Pink `#FF6B9D`

---

## 🌱 Seed Data

The database is pre-loaded with **25 student profiles** covering a wide range of:
- Majors (CS, Biology, Business, Psychology, Engineering, and more)
- Class years (Freshman through PhD)
- Genders (diverse and inclusive)
- Intent types (all three categories represented)
- Study buildings across both City and East Campus
- Study windows distributed across the next 7 days at different times

Profile photos come from [randomuser.me](https://randomuser.me) — a free, publicly licensed placeholder image API. In production, users would upload their own photos to Supabase Storage.


## 👥 Team

- *Narayana*
- *Samarpan*
- *Yohannes*