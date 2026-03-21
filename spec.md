# Pawly — Technical Specification
**Version:** 2.0
**Date:** March 21, 2026
**Status:** Current — reflects implemented codebase as of March 2026

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Mobile Application](#3-mobile-application)
4. [Backend Services](#4-backend-services)
5. [Database Schema](#5-database-schema)
6. [AI & ML Systems](#6-ai--ml-systems)
7. [API Specification](#7-api-specification)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Video Pipeline](#9-video-pipeline)
10. [Notifications & Reminders](#10-notifications--reminders)
11. [Payments & Subscriptions](#11-payments--subscriptions)
12. [Analytics & Event Tracking](#12-analytics--event-tracking)
13. [Infrastructure & DevOps](#13-infrastructure--devops)
14. [Security & Privacy](#14-security--privacy)
15. [Third-Party Integrations](#15-third-party-integrations)
16. [Error Handling & Logging](#16-error-handling--logging)
17. [Performance Requirements](#17-performance-requirements)
18. [Testing Strategy](#18-testing-strategy)
19. [Release & Deployment](#19-release--deployment)
20. [V1 Scope Boundaries](#20-v1-scope-boundaries)

---

## 1. System Overview

### 1.1 What Pawly Is

Pawly is a mobile-first subscription application that delivers personalized dog training plans, AI-powered coaching, video feedback, and a lifecycle content system. The system maintains a persistent behavioral memory of each dog and adapts its guidance based on ongoing session outcomes, structured post-session handler reflections, user-submitted video, and lifecycle stage. Sessions can be completed in manual mode or via a **Live AI Trainer** mode that uses server-side analysis (Supabase Edge Functions + vision API) to provide real-time guidance and feedback. A dog can have up to two simultaneously active training courses, each with its own plan and schedule that are merged into a unified daily view.

### 1.2 Core User Flow (Happy Path)

```
Download App
     ↓
Onboarding (17-step wizard: dog profile + goals + schedule preferences)
     ↓
Plan Generated (AI-powered via OpenAI + skill graph, rules-based fallback)
     ↓
Plan Preview → Account Creation → First Session
     ↓
Daily Session Loop (Manual Mode or Live AI Trainer Mode) + Walk Logging
     ↓
Post-Session Reflection (structured handler feedback captured after each session)
     ↓
AI Coach Available Throughout
     ↓
Plan Adapts Based on Session Outcomes + Reflection Signals
     ↓
Progress Tracked → Streaks → Milestones
     ↓
Add Second Course (optional — up to 2 active courses per dog)
     ↓
Lifecycle Events Triggered as Dog Ages
```

### 1.3 Product Zones

| Zone | Name | Purpose | V1 Status |
|---|---|---|---|
| 1 | Train | Behavior problem solving — session execution, calendar, plan view, quick wins | ✅ Implemented |
| 2 | Progress | Streaks, behavior scores, milestones, walk data, weekly charts | ✅ Implemented |
| 3 | Coach | AI-powered conversational training coach | ✅ Implemented |
| 4 | Know | Supabase-backed article library and in-app reader for dog training education | ✅ Implemented |
| 5 | Profile | Settings, notifications, theme, dog profile editing | ✅ Implemented |

### 1.4 Platform Targets

- iOS 16+ (primary launch platform)
- Android 12+ (within initial launch window)

---

## 2. Architecture Overview

### 2.1 High-Level Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│              iOS App              Android App            │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTPS / REST + WebSocket (Supabase Realtime)
┌─────────────────▼───────────────────────────────────────┐
│                   SUPABASE PLATFORM                      │
│   Auth · PostgreSQL · Storage · Edge Functions · RT      │
└──┬──────────┬──────────┬──────────┬──────────┬──────────┘
   │          │          │          │          │
┌──▼──┐  ┌───▼───┐  ┌───▼────┐  ┌──▼────┐ ┌──▼──────────┐
│Auth │  │  DB   │  │ Edge   │  │Storage│ │  Realtime   │
│     │  │ (PG)  │  │  Fns   │  │ (S3)  │ │  Channels   │
└─────┘  └───────┘  └───┬────┘  └───────┘ └─────────────┘
                         │
              ┌──────────┴──────────┐
              │      OpenAI API     │
              │  (LLM + Vision)     │
              └─────────────────────┘
```

### 2.2 Architectural Principles

- **Supabase-first:** Supabase handles database, auth, storage, real-time, and edge function hosting
- **Edge functions for all AI logic:** Supabase Edge Functions (Deno) handle plan generation, AI coaching calls, plan adaptation, and live AI trainer vision processing
- **Stateless API layer:** All application state lives in the database, not in server memory
- **Mobile-first data design:** API responses are optimized for mobile payload size
- **AI-driven planning:** Plan generation uses OpenAI via `generate-adaptive-plan` Edge Function; rules-based fallback available
- **Server-side Live AI Trainer:** Live coaching uses the `live-ai-trainer` Edge Function to analyze camera frames and return real-time feedback
- **Structured handler feedback:** Post-session reflection captures structured handler observations to enrich adaptation signals
- **Multi-course scheduling:** A dog can have up to 2 active training plans; sessions are merged into a single prioritized daily view via `lib/mergedSchedule.ts`
- **Deterministic course colors:** Colors are assigned from a fixed palette via hash of plan ID — no DB persistence required
- **Adaptive planning engine:** A local adaptive planning engine (`lib/adaptivePlanning/`) orchestrates learning state scoring, hypothesis generation, and plan adaptation rules

### 2.3 Technology Stack Summary

| Layer | Technology | Rationale |
|---|---|---|
| Mobile | Expo 52 + React Native 0.76 + TypeScript | Cross-platform, fast iteration |
| Styling | NativeWind 4 (Tailwind CSS for RN) | Utility-first styling with dark mode support |
| State Management | Zustand 5 | Lightweight, minimal boilerplate |
| Navigation | Expo Router (file-based) | Native feel, deep linking support |
| Server State | TanStack React Query 5 | Server state caching (selective use) |
| Backend | Supabase (PostgreSQL + Edge Functions + Storage + Auth + Realtime) | Full backend in one service |
| AI Coach | OpenAI (via Edge Function `ai-coach-message`) | Conversational quality, context handling |
| AI Planning | OpenAI (via Edge Function `generate-adaptive-plan`) | Personalized plan generation from skill graph |
| Live AI Trainer | Supabase Edge Function `live-ai-trainer` + OpenAI Vision | Real-time analysis and feedback generation |
| Camera | react-native-vision-camera v4 | High-performance camera capture |
| Animations | React Native Reanimated 3 | Smooth native-driver animations |
| Push Notifications | Expo Notifications | Scheduled session reminders, streaks, milestones |
| In-App Notifications | Supabase table + Realtime + in-app store | Notification center within the app |
| Video Storage | Supabase Storage (S3-compatible) | Unified with backend stack |
| Analytics | PostHog (posthog-react-native) | Product analytics with event tracking |
| Error Monitoring | Sentry (@sentry/react-native) | Mobile and backend error tracking |
| Auth | Supabase Auth + Expo Apple Authentication | Email/password + Sign in with Apple |

---

## 3. Mobile Application

### 3.1 Project Structure

```
pawly/
├── app/                          # Expo Router file-based navigation
│   ├── _layout.tsx               # Root layout: auth gate, session bootstrapping
│   ├── index.tsx                 # Entry point — redirects based on auth state
│   ├── (auth)/                   # Unauthenticated screens
│   │   ├── welcome.tsx           # Entry point for unauthenticated users
│   │   ├── login.tsx             # Email/password login
│   │   ├── signup.tsx            # Email/password signup
│   │   └── forgot-password.tsx   # Password reset
│   ├── (onboarding)/             # Onboarding wizard
│   │   ├── dog-basics.tsx        # 17-step form: dog profile + schedule
│   │   ├── dog-photo.tsx         # Dog avatar capture/upload
│   │   ├── dog-problem.tsx       # Behavior goal video upload with context
│   │   ├── dog-environment.tsx   # Home environment details
│   │   ├── video-upload.tsx      # Primary goal video context
│   │   └── plan-preview.tsx      # Shows generated plan before account creation
│   └── (tabs)/                   # Main authenticated tab navigator
│       ├── train/
│       │   ├── index.tsx         # Dashboard: today session CTA, active courses, quick wins
│       │   ├── session.tsx       # Active session screen (Manual + Live AI Trainer)
│       │   ├── calendar.tsx      # Monthly training calendar across all active plans
│       │   ├── plan.tsx          # Selected plan detail with week breakdown
│       │   ├── add-course.tsx    # Add a second training course
│       │   ├── tools.tsx         # Training tools: quick win exercises + protocols
│       │   └── notifications.tsx # In-app notification center (bell + inbox)
│       ├── progress/
│       │   ├── index.tsx         # Streaks, milestones, weekly charts, behavior scores
│       │   └── milestones.tsx    # Full milestone list with achievement details
│       ├── coach/
│       │   └── index.tsx         # AI coach chat interface with conversation history
│       ├── know/
│       │   ├── index.tsx         # Searchable/filterable articles library
│       │   └── article/[slug].tsx # Article reader with rich content rendering
│       └── profile/
│           ├── index.tsx         # Account settings, dog avatar, theme
│           ├── edit-dog.tsx      # Edit dog profile and schedule preferences
│           └── notification-settings.tsx # Per-notification-type preferences
├── components/                   # Reusable components
│   ├── ui/                       # Base: Button, Text, Input, Card, etc.
│   ├── session/                  # TimerRing, RepCounter, StepCard, SessionModePicker, PostSessionReflectionCard
│   ├── coach/                    # MessageBubble, FormattedCoachMessage, TypingIndicator, QuickSuggestions
│   ├── video/                    # VideoUploadProgress, ExpertReviewRequest
│   ├── progress/                 # MilestoneCard, ShareCard
│   ├── train/                    # ActiveCourseCard, CalendarDayCell, TrainingCalendar, DaySessionList
│   ├── training/                 # TrainingToolCard
│   ├── know/                     # ArticleCard, ArticleContentRenderer
│   ├── notifications/            # NotificationBell, NotificationItem
│   ├── onboarding/               # OptionCard, ProgressBar, QuestionScreen, ScheduleSelector
│   ├── adaptive/                 # AdaptationNotice, WhyThisChangedSheet, PlanReasonCard, LearningInsightCard, SessionChangeBadge
│   ├── vision/                   # LiveAiTrainerOverlay
│   ├── shared/                   # WalkLogModal
│   └── profile/                  # FeedbackModal
├── stores/                       # Zustand state stores (10 stores)
├── hooks/                        # Custom hooks
│   └── useLiveAiTrainerSession.ts # Live AI Trainer session hook
├── lib/                          # Utilities and service helpers
│   ├── supabase.ts               # Supabase client
│   ├── planGenerator.ts          # Rules-based plan generation (fallback)
│   ├── scheduleEngine.ts         # Per-plan schedule logic
│   ├── mergedSchedule.ts         # Cross-plan merge layer
│   ├── sessionManager.ts         # Session saving, streaks, milestone triggers
│   ├── milestoneEngine.ts        # Milestone definitions and checking
│   ├── modelMappers.ts           # DB row → TypeScript mappers
│   ├── notifications.ts          # Push notification scheduling
│   ├── inAppNotifications.ts     # In-app notification deduplication
│   ├── videoUploader.ts          # Video upload to Supabase storage
│   ├── analytics.ts              # PostHog event capture
│   ├── articles.ts               # Articles library data
│   ├── feedback.ts               # User feedback submission
│   ├── addCourse.ts              # Add secondary training plans
│   ├── calendarSessions.ts       # Calendar formatting helpers
│   ├── theme.ts                  # Color scheme and theme provider
│   ├── adaptivePlanning/         # Full adaptive planning engine (15+ modules)
│   └── liveCoach/                # Live AI Trainer types and helpers
├── constants/                    # App-wide constants
└── assets/                       # Images, fonts, animations
```

### 3.2 Navigation Architecture

**Root Gate (`app/_layout.tsx`):**

```
Unauthenticated
  └─ /(auth) [Welcome → Login / Signup / Forgot Password]

Authenticated, no dog profile
  └─ /(onboarding) [17-step wizard → plan-preview → submitOnboarding → /(tabs)]

Authenticated, dog profile exists
  └─ /(tabs)
       ├─ train/ (primary tab)
       │    ├─ index (dashboard)
       │    ├─ session (session execution)
       │    ├─ calendar (month view)
       │    ├─ plan (plan detail)
       │    ├─ add-course
       │    ├─ tools (quick wins)
       │    └─ notifications (in-app inbox)
       ├─ progress/
       │    ├─ index (dashboard)
       │    └─ milestones
       ├─ coach/ (AI chat)
       ├─ know/
       │    ├─ index (articles list)
       │    └─ article/[slug] (reader)
       └─ profile/
            ├─ index
            ├─ edit-dog
            └─ notification-settings
```

### 3.3 State Management

Ten Zustand stores manage all client-side state:

| Store | Responsibility |
|---|---|
| `authStore` | Supabase user session, subscription tier, dog profile reference |
| `dogStore` | Current dog record, active plans list, learning state |
| `planStore` | Multi-plan scheduling, today's sessions, missed sessions, protocols, adaptations |
| `sessionStore` | Active session state machine (LOADING → INTRO → SETUP → STEP_ACTIVE → STEP_COMPLETE → SESSION_REVIEW → COMPLETE / ABANDONED) |
| `coachStore` | AI coach conversation, message history, typing state, rate limit errors |
| `progressStore` | Streaks, milestones, weekly session/walk charts, behavior scores |
| `notificationStore` | Notification preferences, push permission state, in-app inbox |
| `videoStore` | Video records, expert review state, storage usage |
| `onboardingStore` | 60+ fields for multi-step onboarding form (persisted to AsyncStorage) |
| `themeStore` | Theme preference (system / light / dark) |

### 3.4 Offline Handling

- Core plan and session data is loaded into Zustand stores on app launch and serves stale content when offline
- Session completion writes are queued and flushed on reconnect
- Push notification scheduling runs locally via Expo Notifications

### 3.5 Core Screens — Detailed Spec

#### Onboarding Wizard (`app/(onboarding)/dog-basics.tsx`)

A 17-step (0–16) multi-step form with a progress bar (steps 1–16 shown as 1–16 in UI):

| Step | Content |
|---|---|
| 0 | Welcome screen — "Get Started" CTA |
| 1 | Dog name |
| 2 | Dog age (Puppy < 6mo / Young 6–18mo / Adult 1–3yr / Senior > 3yr) |
| 3 | Dog breed (searchable list) |
| 4 | Dog sex and neuter status |
| 5 | Primary behavior goal (leash_pulling, jumping_up, barking, recall, potty_training, crate_anxiety, puppy_biting, settling) |
| 6 | Secondary goals (multi-select, excludes primary) |
| 7 | Primary goal severity (mild / moderate / severe) |
| 8 | Handler training experience (none / some / experienced) |
| 9 | Home setup (apartment / house_no_yard / house_yard), has kids, has other pets |
| 10 | Days per week (1–7 slider) |
| 11 | Minutes per day (5–180 slider) |
| 12 | Preferred training days (multi-select weekdays) |
| 13 | Time of day per day (morning / midday / afternoon / evening / late_evening) or exact times |
| 14 | Session style (micro: short bursts / balanced / focused: longer single session) |
| 15 | Summary + schedule flexibility (skip / move_next_slot / move_tomorrow) + intensity (gentle / balanced / aggressive) + optional blocked dates |
| 16 | Generating plan (loading screen → `submitOnboarding()`) |

`submitOnboarding()` sequence:
1. Upload avatar if provided
2. Insert `dogs` record
3. Insert `behavior_goals` records (primary + secondary)
4. Call `generate-adaptive-plan` Edge Function (falls back to rules-based planner on failure)
5. Insert plan; mark `is_primary=true`; add secondary-goal courses
6. Insert `user_profiles` record with default notification prefs
7. Navigate to `/(tabs)/train`

#### Session Screen (`app/(tabs)/train/session.tsx`)

**Session State Machine:**
```
LOADING → (fetch protocol from plan)
  ↓
INTRO → (exercise title, objective, equipment checklist)
  ↓
SETUP → (setup checklist tied to equipment)
  ↓
STEP_ACTIVE → (current step: instruction, tip, rep/duration counter)
  │  Manual mode: user taps "Complete Step" after each rep/duration
  │  Live AI Trainer mode: LiveAiTrainerOverlay captures frames → AI feedback
  ↓
STEP_COMPLETE → (brief celebration, next step preview)
  ↓ [loop STEP_ACTIVE ↔ STEP_COMPLETE for each protocol step]
SESSION_REVIEW → (step results summary, post-session reflection, difficulty, notes)
  ↓
COMPLETE → (success screen, streak update, milestone check)
```

Session modes:
- **Manual:** User manually marks reps and steps complete
- **Live AI Trainer:** Camera feed analyzed in real time by `live-ai-trainer` Edge Function; AI provides spoken/visual feedback and can auto-mark reps

##### SessionModePicker (`components/session/SessionModePicker.tsx`)

Shown before `STEP_ACTIVE`. Two option cards:
1. **Live AI Trainer** (featured) — "Point your camera at {dogName}. Get real-time AI feedback and coaching."
2. **Do Normally** (secondary) — "Follow the step-by-step guide and mark reps manually."

##### PostSessionReflectionCard (`components/session/PostSessionReflectionCard.tsx`)

Conditional branching question set captured in `SESSION_REVIEW`. Fields stored in `session_logs.post_session_reflection`:

| Field | Type | When Shown |
|---|---|---|
| `overallExpectation` | met / below / above | Always |
| `mainIssue` | distraction / broke_stay / arousal / missed_cue / handler_issue / none | If below expectation |
| `failureTiming` | start / middle / end / throughout | If mainIssue is a failure type |
| `distractionType` | dog / person / noise / environment / other | If mainIssue = distraction |
| `cueUnderstanding` | yes / sometimes / no | If below expectation |
| `arousalLevel` | calm / normal / excited / overstimulated | Always |
| `handlerIssue` | timing / luring / criteria / positioning / none | If mainIssue = handler_issue |
| `confidenceInAnswers` | 1–5 | Always |
| `freeformNote` | string | Optional, always |

---

## 4. Backend Services

### 4.1 Supabase Platform

All backend logic is hosted on Supabase:
- **PostgreSQL** — primary database
- **Auth** — email/password + Apple Sign-In (JWT-based)
- **Storage** — S3-compatible; used for dog avatars, session videos, thumbnails
- **Edge Functions** — Deno-based serverless functions for all AI and heavy-compute operations
- **Realtime** — WebSocket channels for in-app notification sync

### 4.2 Edge Functions

#### `ai-coach-message`

Triggered: When user sends a message in the Coach tab.

Input:
```typescript
{ message: string, conversationId: string, dogId: string }
```

Process:
1. Fetch dog profile, active plans, recent session logs, walk logs, learning hypotheses
2. Build context prompt (dog state + conversation history)
3. Call OpenAI (GPT-4) with constructed messages
4. Store assistant response in `coach_messages`
5. Enforce rate limit — returns HTTP 429 if exceeded

Output:
```typescript
{ content: string }
```

---

#### `generate-adaptive-plan`

Triggered: During onboarding `submitOnboarding()`.

Input: Full dog profile with all onboarding fields, optional access token.

Process:
1. Query `skill_nodes` and `skill_edges` for the dog's primary behavior goal
2. Build planner prompt from skill graph + dog profile
3. Call OpenAI to generate 8–12 week skill progression with session structure
4. Compile sessions via `planCompiler`
5. Validate generated plan via `planValidation`
6. Insert plan record into `plans` table
7. On failure: fall back to `planGenerator.ts` rules-based planner

Output:
```typescript
{ plan: Plan, plannerMode: 'ai' | 'rules_fallback', fallbackReason?: string }
```

---

#### `adapt-plan`

Triggered: After `saveSession()` in `sessionManager.ts` (when session completed with reflection), or after walk logged.

Input:
```typescript
{ dogId: string, planId: string, triggeredBySessionLogId?: string, triggeredByWalkLogId?: string }
```

Process:
1. Fetch current learning state for dog
2. Evaluate adaptation rules in `adaptationRules.ts`
3. If adaptation warranted, compile new session list via `adaptationCompiler`
4. Update `plans.sessions` in DB
5. Insert record into `plan_adaptations`
6. Create in-app notification ("Your training plan has been updated")

Output:
```typescript
{ applied: boolean, newSessions?: PlanSession[], reason?: string, adaptation?: PlanAdaptation }
```

---

#### `live-ai-trainer`

Triggered: During Live AI Trainer session mode.

Input:
```typescript
{
  dogId: string,
  planId: string,
  sessionId: string,
  exerciseId: string,
  stepContext: object,
  samplingMode: 'idle' | 'burst' | 'question',
  userUtterance?: string,
  frames: string[]  // base64-encoded JPEGs
}
```

Process:
1. Pass frames to OpenAI Vision API
2. Detect: dog visible, posture, behavior (sit/down/stand/moving), rep/hold status, main issue
3. Generate coach message based on observations

Output:
```typescript
{
  dogVisible: boolean,
  framingQuality: string,
  observedBehavior: string,
  repStatus: string,
  holdStatus: string,
  mainIssue: string,
  coachMessage: string,
  shouldSpeak: boolean,
  suggestedUiAction: 'continue_live' | 'ask_reframe' | 'fallback_manual' | 'mark_success' | 'mark_failed' | 'wait'
}
```

---

#### `generate-dog-avatar`

Triggered: During onboarding avatar step.

Input: Dog profile + optional uploaded photo.

Process: Calls image generation API or processes uploaded photo; uploads result to Supabase Storage.

Output:
```typescript
{ avatarUrl: string }
```

---

#### `notify-expert-review`

Triggered: When user requests expert review of a video.

Input: `{ videoId: string, userId: string }`

Process: Sends notification/email to expert review queue.

---

#### `complete-expert-review`

Triggered: When trainer submits review feedback.

Input: `{ videoId: string, feedback: string, timestamps: { time: number, label: string }[] }`

Process:
1. Update `expert_reviews` record with feedback and timestamps
2. Create in-app notification for user ("Trainer {trainerName} reviewed your video!")

---

## 5. Database Schema

### 5.1 Core Tables

#### `user_profiles`
```sql
id                    UUID PRIMARY KEY
onboarding_completed_at TIMESTAMPTZ
notification_prefs    JSONB
```

`notification_prefs` shape:
```typescript
{
  dailyReminder: boolean,
  dailyReminderTime: string,       // HH:MM
  walkReminders: boolean,
  postWalkCheckIn: boolean,
  streakAlerts: boolean,
  milestoneAlerts: boolean,
  insights: boolean,
  expertReview: boolean,
  lifecycle: boolean,
  weeklySummary: boolean,
  scheduledSessionReminders: boolean,
  reminderLeadMinutes: number,
  fallbackMissedSessionReminders: boolean
}
```

#### `dogs`
```sql
id                    UUID PRIMARY KEY
owner_id              UUID REFERENCES auth.users
name                  TEXT
breed                 TEXT
breed_group           TEXT
age_months            INTEGER
sex                   TEXT           -- 'male' | 'female'
neutered              BOOLEAN
environment_type      TEXT           -- 'apartment' | 'house_no_yard' | 'house_yard'
behavior_goals        TEXT[]
training_experience   TEXT           -- 'none' | 'some' | 'experienced'
equipment             TEXT[]
available_days_per_week  INTEGER
available_minutes_per_day INTEGER
preferred_training_days  TEXT[]
preferred_training_windows JSONB
preferred_training_times   JSONB
usual_walk_times      TEXT[]
session_style         TEXT           -- 'micro' | 'balanced' | 'focused'
schedule_flexibility  TEXT           -- 'skip' | 'move_next_slot' | 'move_tomorrow'
schedule_intensity    TEXT           -- 'gentle' | 'balanced' | 'aggressive'
blocked_days          TEXT[]
blocked_dates         TEXT[]
schedule_notes        TEXT
schedule_version      INTEGER
timezone              TEXT
lifecycle_stage       TEXT
has_kids              BOOLEAN
has_other_pets        BOOLEAN
avatar_url            TEXT
created_at            TIMESTAMPTZ
```

#### `behavior_goals`
```sql
id               UUID PRIMARY KEY
dog_id           UUID REFERENCES dogs
goal             TEXT
is_primary       BOOLEAN
severity         TEXT    -- 'mild' | 'moderate' | 'severe'
video_upload_path TEXT
video_context    TEXT
created_at       TIMESTAMPTZ
```

#### `plans`
```sql
id              UUID PRIMARY KEY
dog_id          UUID REFERENCES dogs
goal            TEXT
status          TEXT    -- 'active' | 'completed' | 'paused'
color           TEXT
duration_weeks  INTEGER
sessions_per_week INTEGER
current_week    INTEGER
current_stage   TEXT
sessions        JSONB   -- PlanSession[]
metadata        JSONB
course_title    TEXT
priority        INTEGER
is_primary      BOOLEAN
created_at      TIMESTAMPTZ
```

`PlanSession` shape:
```typescript
{
  id: string,
  weekNumber: number,
  dayOfWeek: number,
  title: string,
  exerciseId: string,
  skillId?: string,
  estimatedMinutes: number,
  status: 'scheduled' | 'completed' | 'skipped' | 'missed',
  completedAt?: string,
  successScore?: number,
  scheduledDate?: string,
  sessionKind?: string
}
```

#### `session_logs`
```sql
id                      UUID PRIMARY KEY
user_id                 UUID REFERENCES auth.users
dog_id                  UUID REFERENCES dogs
plan_id                 UUID REFERENCES plans
session_id              TEXT
exercise_id             TEXT
protocol_id             TEXT
duration_seconds        INTEGER
difficulty              TEXT    -- 'easy' | 'okay' | 'hard'
notes                   TEXT
completed_at            TIMESTAMPTZ
success_score           NUMERIC
step_results            JSONB
session_status          TEXT    -- 'completed' | 'abandoned'
skill_id                TEXT
session_kind            TEXT
environment_tag         TEXT
live_coaching_used      BOOLEAN
live_ai_trainer_summary JSONB
post_session_reflection JSONB   -- see PostSessionReflection type
created_at              TIMESTAMPTZ
```

#### `walk_logs`
```sql
id               UUID PRIMARY KEY
user_id          UUID REFERENCES auth.users
dog_id           UUID REFERENCES dogs
quality          SMALLINT   -- 1 | 2 | 3
notes            TEXT
duration_minutes INTEGER
logged_at        TIMESTAMPTZ
created_at       TIMESTAMPTZ
```

#### `streaks`
```sql
id                  UUID PRIMARY KEY
user_id             UUID REFERENCES auth.users
dog_id              UUID REFERENCES dogs
current_streak      INTEGER
longest_streak      INTEGER
last_session_date   DATE
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
UNIQUE(user_id, dog_id)
```

#### `walk_streaks`
```sql
id                UUID PRIMARY KEY
user_id           UUID REFERENCES auth.users
dog_id            UUID REFERENCES dogs
current_streak    INTEGER
longest_streak    INTEGER
last_walk_date    DATE
created_at        TIMESTAMPTZ
updated_at        TIMESTAMPTZ
UNIQUE(user_id, dog_id)
```

#### `milestones`
```sql
id            UUID PRIMARY KEY
user_id       UUID REFERENCES auth.users
dog_id        UUID REFERENCES dogs
milestone_id  TEXT
title         TEXT
description   TEXT
emoji         TEXT
achieved_at   TIMESTAMPTZ
created_at    TIMESTAMPTZ
UNIQUE(user_id, dog_id, milestone_id)
```

### 5.2 Adaptive Planning Tables

#### `skill_nodes`
```sql
id           UUID PRIMARY KEY
behavior     TEXT          -- e.g., 'leash_pulling'
skill_code   TEXT
title        TEXT
description  TEXT
stage        INTEGER       -- 1–4
difficulty   INTEGER       -- 1–5
kind         TEXT          -- 'foundational' | 'core' | 'transition' | 'proofing'
protocol_id  UUID NULLABLE
metadata     JSONB
is_active    BOOLEAN
created_at   TIMESTAMPTZ
```

#### `skill_edges`
```sql
id             UUID PRIMARY KEY
from_skill_id  UUID REFERENCES skill_nodes
to_skill_id    UUID REFERENCES skill_nodes
edge_type      TEXT   -- 'prerequisite' | 'progression' | 'alternative'
condition_summary TEXT
metadata       JSONB
created_at     TIMESTAMPTZ
```

#### `learning_hypotheses`
```sql
id                    UUID PRIMARY KEY
dog_id                UUID REFERENCES dogs
hypothesis_type       TEXT   -- 'fatigue' | 'handler_timing' | 'distraction_sensitive' | ...
summary               TEXT
confidence_score      NUMERIC   -- 0–1
triggered_by_log_id   UUID
created_at            TIMESTAMPTZ
```

#### `learning_states`
```sql
id                         UUID PRIMARY KEY
dog_id                     UUID REFERENCES dogs (UNIQUE)
motivation_score           NUMERIC
distraction_sensitivity    NUMERIC
confidence_score           NUMERIC
impulse_control_score      NUMERIC
handler_consistency_score  NUMERIC
fatigue_risk_score         NUMERIC
recovery_speed_score       NUMERIC
environment_confidence     JSONB
behavior_signals           JSONB
recent_trends              JSONB
current_hypotheses         JSONB
last_evaluated_at          TIMESTAMPTZ
created_at                 TIMESTAMPTZ
updated_at                 TIMESTAMPTZ
```

#### `plan_adaptations`
```sql
id                    UUID PRIMARY KEY
plan_id               UUID REFERENCES plans
adaptation_type       TEXT  -- 'skip_session' | 'insert_foundation' | 'insert_transition' |
                            --  'insert_duration_building' | 'insert_calm_reset' |
                            --  'regress_skill' | 'advance_skill' | 'change_environment'
reason_summary        TEXT
triggered_by_log_id   UUID
new_sessions          JSONB
metadata              JSONB
created_at            TIMESTAMPTZ
```

### 5.3 Coach & Messaging Tables

#### `coach_conversations`
```sql
id          UUID PRIMARY KEY
user_id     UUID REFERENCES auth.users
dog_id      UUID REFERENCES dogs
is_active   BOOLEAN
created_at  TIMESTAMPTZ
updated_at  TIMESTAMPTZ
UNIQUE(user_id, dog_id) WHERE is_active = true
```

#### `coach_messages`
```sql
id                UUID PRIMARY KEY
conversation_id   UUID REFERENCES coach_conversations
role              TEXT   -- 'user' | 'assistant'
content           TEXT
created_at        TIMESTAMPTZ
```

### 5.4 Video & Expert Review Tables

#### `videos`
```sql
id               UUID PRIMARY KEY
user_id          UUID REFERENCES auth.users
dog_id           UUID REFERENCES dogs
storage_path     TEXT
thumbnail_path   TEXT
duration_seconds INTEGER
context          TEXT
behavior_context TEXT
before_context   TEXT
goal_context     TEXT
uploaded_at      TIMESTAMPTZ
created_at       TIMESTAMPTZ
```

#### `expert_reviews`
```sql
id                UUID PRIMARY KEY
video_id          UUID REFERENCES videos
user_id           UUID REFERENCES auth.users
status            TEXT   -- 'queued' | 'in_progress' | 'completed'
trainer_name      TEXT
trainer_photo_url TEXT
feedback          TEXT
timestamps        JSONB  -- { time: number, label: string }[]
requested_at      TIMESTAMPTZ
completed_at      TIMESTAMPTZ
created_at        TIMESTAMPTZ
```

#### `review_credits`
```sql
user_id           UUID REFERENCES auth.users (PRIMARY KEY)
credits_remaining INTEGER
created_at        TIMESTAMPTZ
updated_at        TIMESTAMPTZ
```

### 5.5 Notifications & Content Tables

#### `in_app_notifications`
```sql
id          UUID PRIMARY KEY
user_id     UUID REFERENCES auth.users
dog_id      UUID REFERENCES dogs NULLABLE
type        TEXT   -- 'plan_updated' | 'expert_review_complete' | ...
title       TEXT
body        TEXT
metadata    JSONB
is_read     BOOLEAN
read_at     TIMESTAMPTZ
created_at  TIMESTAMPTZ
```

#### `articles`
```sql
id            UUID PRIMARY KEY
slug          TEXT UNIQUE
title         TEXT
excerpt       TEXT
content       TEXT
thumbnail_url TEXT
category      TEXT
published_at  TIMESTAMPTZ
```

---

## 6. AI & ML Systems

### 6.1 AI Coach (Conversational)

**Trigger:** User sends message in Coach tab.

**Context built per-message:**
- Dog profile (breed, age, behavior goals, environment)
- Active plans (current week, current stage, session structure)
- Last 10 session logs (difficulty, notes, reflection data)
- Last 5 walk logs (quality, notes, goal_achieved)
- Current learning hypotheses (fatigue, handler timing, distraction sensitivity, etc.)

**Implementation:** `ai-coach-message` Edge Function → OpenAI GPT-4 → response stored in `coach_messages`.

**Rate limiting:** HTTP 429 returned on excess calls; surfaced as `rateLimitError` in `coachStore`.

**UI:** Full-screen immersive chat interface (`app/(tabs)/coach/index.tsx`) with `MessageBubble`, `TypingIndicator`, `QuickSuggestions`.

---

### 6.2 AI Plan Generation

**Trigger:** End of onboarding wizard.

**Adaptive path (controlled by feature flag in `lib/adaptivePlanning/featureFlags.ts`):**
1. Query skill graph (`skill_nodes`, `skill_edges`) for dog's primary behavior goal
2. Build LLM prompt via `plannerPrompt.ts` — includes skill graph topology, dog profile, constraints
3. Call OpenAI to generate 8–12 week skill progression
4. Compile sessions via `planCompiler.ts`
5. Validate via `planValidation.ts`
6. Insert into `plans`

**Fallback:** Rules-based `planGenerator.ts` — hardcoded progressions keyed by behavior + dog age + experience.

---

### 6.3 Adaptive Plan Engine

**Trigger:** After each session completed with reflection, or after walk logged.

**Signal Inputs from session:**
- `difficulty` rating (easy / okay / hard)
- `post_session_reflection` fields (overallExpectation, mainIssue, arousalLevel, handlerIssue, etc.)
- Step results (reps completed, timer duration, success per step)

**Signal Inputs from walk:**
- `quality` (1–3)
- `goal_achieved` (boolean)
- Presence of leash-related behavior goal

**Learning State Scoring (`lib/adaptivePlanning/learningStateScoring.ts`):**

Seven dimensions scored 0–1:
- **Motivation** — improving vs. declining success scores over time
- **Distraction Sensitivity** — frequency of "distracted" in reflection answers
- **Confidence** — cue_understanding responses, arousal_level patterns
- **Impulse Control** — break-early issues, settling behavior
- **Handler Consistency** — handler_issue reflection answers
- **Fatigue Risk** — session duration tolerance, "tired" reflection signals
- **Recovery Speed** — performance gap between sessions

**Hypothesis Generation (`lib/adaptivePlanning/hypothesisEngine.ts`):**

Hypotheses stored in `learning_hypotheses` with confidence 0–1. Types:
- `fatigue` — dog tires after N sessions in N days
- `handler_timing` — handler timing issues in evening sessions
- `distraction_sensitive` — consistent distraction in outdoor environments
- (and others per behavior goal)

**Adaptation Rules (`lib/adaptivePlanning/adaptationRules.ts`):**

Example rules:
- 2 consecutive `hard` sessions → insert foundation/support session
- 3 consecutive `easy` sessions → advance skill
- `fatigue_risk > 0.7` → insert calm reset session
- `handler_consistency < 0.4` → insert handler technique session

**Adaptation Types:**
- `skip_session`
- `insert_foundation`
- `insert_transition`
- `insert_duration_building`
- `insert_calm_reset`
- `regress_skill`
- `advance_skill`
- `change_environment`

**Output:** Updated `plans.sessions` in DB + `plan_adaptations` record + in-app notification.

---

### 6.4 Live AI Trainer (Server-Side Vision)

**Trigger:** User selects "Live AI Trainer" mode in `SessionModePicker` during a session.

**Pipeline:**
```
Camera Frame (Vision Camera v4)
    ↓ Frame sampling (idle: ~2s interval, burst: rapid, question: on demand)
    ↓ Supabase Edge Function 'live-ai-trainer'
    ↓ OpenAI Vision API — frame analysis
    ↓ Response JSON { coachMessage, shouldSpeak, suggestedUiAction, ... }
    ↓ LiveAiTrainerOverlay — visual + audio feedback
```

**Sampling Modes:**
- `idle` — background frame capture every 2–3 seconds
- `burst` — rapid capture on user tap or utterance trigger
- `question` — user asks question; focused single-frame analysis

**Detected State per Frame:**
- `dogVisible` (boolean)
- `framingQuality` (description)
- `observedBehavior` (sit / down / stand / moving)
- `repStatus` (completed / in_progress / failed)
- `holdStatus` (holding / broke / too_short)
- `mainIssue` (description or null)

**Fallback:** If `live-ai-trainer` returns error, `LiveAiTrainerOverlay` switches to manual mode with message "I'm having trouble seeing clearly. Switching to manual mode."

**Summary Stored:** `session_logs.live_ai_trainer_summary` (JSONB) captures the session's AI feedback log.

---

### 6.5 Multi-Plan Scheduling (`lib/mergedSchedule.ts`)

A dog can have up to 2 simultaneously active training plans. The merge layer:
- Fetches sessions from all `activePlans` in `planStore`
- Merges session lists by date using priority (primary plan takes precedence for same-day conflicts)
- Exposes `getTodaySession()`, `getUpcomingSessions()`, `getMissedSessions()`, `getAllSessionsForCalendar()`
- Used by `planStore` to populate `todaySessions`, `recommendedTodaySession`, `missedSessions`

---

## 7. API Specification

All client ↔ backend communication goes through:
1. **Supabase JS client** (`lib/supabase.ts`) for direct table reads/writes and auth
2. **Edge Function HTTP calls** for AI operations and heavy compute
3. **Supabase Realtime** for in-app notification sync

Edge Function base URL: `${SUPABASE_URL}/functions/v1/{function-name}`

Auth header required: `Authorization: Bearer <user-jwt>`

---

## 8. Authentication & Authorization

- **Provider:** Supabase Auth
- **Methods:** Email/password, Sign in with Apple (`expo-apple-authentication`)
- **Session Storage:** Supabase session persisted via `AsyncStorage`
- **Auth Gate:** `app/_layout.tsx` — reads `authStore.isInitialized` and `authStore.user` to route between auth, onboarding, and main tabs
- **Row-Level Security:** All Supabase tables have RLS policies scoped to `auth.uid()`
- **Edge Function Auth:** JWT validated on all Edge Functions; anonymous calls rejected with 401

---

## 9. Video Pipeline

### Upload Flow
1. User selects or captures video via `expo-image-picker` or device camera
2. `lib/videoUploader.ts` generates thumbnail via `expo-video-thumbnails`
3. Video and thumbnail uploaded to Supabase Storage
4. `videos` table record inserted with storage paths + context metadata

### Expert Review Flow
1. User taps "Request Expert Review" in video detail view
2. App checks `review_credits.credits_remaining` — blocks if 0
3. `notify-expert-review` Edge Function called to queue review
4. Trainer reviews video externally, submits via `complete-expert-review` Edge Function
5. `expert_reviews` updated with feedback + timestamps
6. In-app notification created for user

---

## 10. Notifications & Reminders

### 10.1 Push Notifications (Expo Notifications)

All push notifications are scheduled locally on device by `lib/notifications.ts` (`scheduleUserNotifications()`, `scheduleUserNotificationsForPlans()`). Scheduling is triggered after session completion, walk logging, and preference changes.

| Type | Trigger | Content |
|---|---|---|
| Scheduled Session Reminder | 15 min (configurable) before each scheduled session | "{dog}'s {session title} starts at {time}. {duration} min today." |
| Walk Reminder | Daily at preferred walk times | "Time for a walk! {dog} is ready." |
| Post-Walk Check-in | 30 min after walk logged | "How did {dog} do after the walk?" |
| Weekly Summary | Configurable day + time (default Sunday 10am) | "{N} sessions, {streak}-day streak!" |
| Streak Alert | When streak reaches 7 / 14 / 30 days | "🔥 {streak}-day streak!" |
| Milestone Alert | When milestone achieved | "🎉 {title}! {description}" |
| Lifecycle | Dog age transitions | Customized per lifecycle stage |

Permission flow: Requested on first meaningful user action (session complete, walk logged). Tracks `hasRequestedPermission` to avoid re-prompting.

### 10.2 In-App Notifications

Stored in `in_app_notifications` table. Displayed in the notification bell/inbox at `app/(tabs)/train/notifications.tsx`.

| Type | Trigger |
|---|---|
| `plan_updated` | `adapt-plan` Edge Function after adaptation applied |
| `expert_review_complete` | `complete-expert-review` Edge Function |

**Realtime sync:** `notificationStore.hydrateRealtime(userId)` subscribes to Supabase Realtime channel `in_app_notifications:{userId}` and appends new notifications without polling.

**Deduplication:** `lib/inAppNotifications.ts` prevents duplicate `plan_updated` notifications within 24 hours for the same plan.

---

## 11. Payments & Subscriptions

### Current State

- `authStore.subscriptionTier` holds `'free' | 'core' | 'premium'`
- Plan records have an `isPaid` flag derived from subscription tier
- `review_credits` table gates expert review requests

### Not Yet Implemented

- No RevenueCat or Apple IAP integration
- No paywall UI
- No subscription management screen
- All features currently accessible to all users regardless of tier

---

## 12. Analytics & Event Tracking

**Provider:** PostHog (`posthog-react-native`) via `lib/analytics.ts`.

Events tracked:

| Event | Properties |
|---|---|
| `onboarding_schedule_preferences_set` | daysPerWeek, sessionStyle, scheduleFlexibility |
| `plan_schedule_generated` | dogId, planId, plannerMode, scheduledSessions, fallbackReason |
| `plan_adapted` | dogId, planId, adaptationType, reason |
| `session_completed` | difficulty, durationSeconds, milestoneTriggered |
| `walk_logged` | quality, goalAchieved, durationMinutes |
| `reminder_time_updated` | newTime, type |
| `notification_opened` | notificationType |

---

## 13. Infrastructure & DevOps

- **Hosting:** Supabase (managed PostgreSQL + Edge runtime)
- **CI/CD:** GitHub Actions + EAS Build for automated builds and App Store/Play Store submissions
- **Mobile Builds:** Expo Application Services (EAS)
- **Environment Variables:** `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`

---

## 14. Security & Privacy

- All API calls require valid Supabase JWT
- Row-Level Security (RLS) on all database tables — users can only access their own data
- Dog avatars and videos stored in private Supabase Storage buckets; access via signed URLs
- Video uploads never stored unencrypted; paths are opaque UUIDs
- No PII beyond email and dog profile stored in plaintext
- Camera access (Live AI Trainer) is opt-in per session — frames are not persisted server-side

---

## 15. Third-Party Integrations

| Service | Purpose | Status |
|---|---|---|
| Supabase | Backend (auth, database, storage, edge functions, realtime) | ✅ Active |
| OpenAI | AI coach + plan generation + live AI trainer vision analysis | ✅ Active |
| Vision Camera v4 | Camera frame capture for Live AI Trainer | ✅ Active |
| Expo Notifications | Push notification scheduling and delivery | ✅ Active |
| Expo Apple Authentication | Sign in with Apple | ✅ Active |
| PostHog | Product analytics and event tracking | ✅ Integrated (posthog-react-native) |
| Sentry | Mobile error tracking | ✅ Integrated (@sentry/react-native) |
| RevenueCat | Subscription management | ⏳ Dependency present, not initialized |

---

## 16. Error Handling & Logging

| Error Type | Handling | User Message |
|---|---|---|
| Live AI Trainer failure | Fall back to manual session mode | "I'm having trouble seeing clearly. Switching to manual mode." |
| Plan generation failure (AI) | Fall back to rules-based planner | Transparent to user — plan generated normally |
| Coach rate limit (429) | Surface `rateLimitError` in `coachStore` | "You've reached your daily message limit." |
| Session save failure | Log error to Sentry; retry on reconnect | Toast error message |
| Push notification permission denied | Fall back to in-app notifications only | No explicit message |
| Expert review credit exhaustion | Block request at client | "You don't have any review credits remaining." |

---

## 17. Performance Requirements

- Plan generation: < 10 seconds end-to-end (AI path)
- Coach response: < 3 seconds first token (streaming not currently used)
- Live AI Trainer frame round-trip: < 2 seconds per feedback cycle
- Session screen load: < 500ms (protocol fetched from already-loaded plan store)
- Calendar view load: < 300ms (computed from in-memory store)

---

## 18. Testing Strategy

- Unit tests for adaptive planning engine logic (`tests/`)
- Manual QA for session flows, onboarding, and camera-based features
- Edge Function testing via Supabase CLI (`supabase functions serve`)

---

## 19. Release & Deployment

- **Platform:** iOS and Android via EAS Build + EAS Submit
- **OTA Updates:** Expo Updates for JS-layer patches without App Store re-review
- **Database Migrations:** Applied via Supabase migration files in `supabase/migrations/`
- **Edge Function Deployment:** `supabase functions deploy <name>`

---

## 20. V1 Scope Boundaries

### 20.1 What V1 Includes (Implemented)

- Onboarding wizard with AI-generated personalized training plan (17 steps, 8 supported behavior goals)
- Multi-plan support — up to 2 active training courses per dog with merged scheduling
- Session execution — manual mode and Live AI Trainer mode (server-side vision + AI feedback)
- Post-session structured reflection (conditional question branching, 8 reflection fields)
- Adaptive planning engine — learning state scoring, hypothesis generation, 8 adaptation types
- AI coach — conversational chat with full dog + session context, rate-limited
- Progress tracking — session streaks, walk streaks, milestones, weekly behavior charts
- Walk logging — quality (1–3), duration, notes, goal achieved flag
- In-app notification center — plan update notifications, expert review completions
- Push notifications — scheduled session reminders, walk reminders, streak/milestone alerts
- Video upload — with expert review request flow
- Articles library — seeded content with search and full reader
- Profile management — dog profile editing, notification preferences, theme
- Sign in with Apple

### 20.2 What V1 Explicitly Excludes (Not Yet Built)

- Payment processing / subscription management (RevenueCat not initialized)
- Paywall or feature gating by subscription tier
- On-device pose estimation (replaced by server-side Live AI Trainer in v1.6)
- Multi-dog support (single dog per account in v1)
- Social features (leaderboards, friend activity, sharing beyond ShareCard)
- Human video coaching via two-way video call
- Android-specific push notification channels (basic push only)
- Expert review credit purchasing flow (credits exist in DB but no purchase UI)
