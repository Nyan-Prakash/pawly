# Pawly — Technical Specification
**Version:** 1.0  
**Date:** March 12, 2026  
**Status:** Draft  

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

Pawly is a mobile-first subscription application that delivers personalized dog training plans, AI-powered coaching, video feedback, and a lifecycle content system across the full lifespan of a dog. The system maintains a persistent behavioral memory of each dog and adapts its guidance based on ongoing session outcomes, user-submitted video, and lifecycle stage.

### 1.2 Core User Flow (Happy Path)

```
Download App
     ↓
Onboarding (dog profile + problem selection + video upload)
     ↓
Behavior Baseline Generated
     ↓
Personalized Plan Created
     ↓
First Session Completed
     ↓
Daily Walk Goal + Session Loop
     ↓
AI Coach Available Throughout
     ↓
Progress Tracked → Milestones → Shareable Cards
     ↓
Skill Ladder Unlocked → Advanced Programs
     ↓
Lifecycle Events Triggered as Dog Ages
     ↓
Annual Report → Memory Lane Archive
```

### 1.3 Product Zones

| Zone | Name | Purpose |
|---|---|---|
| 1 | Train | Behavior problem solving — the acquisition wedge |
| 2 | Grow | Skill ladder, enrichment, proofing programs |
| 3 | Know | Dog personality profile, insights, health signals |
| 4 | Connect | Community, expert access, live Q&A |
| 5 | Journey | Lifecycle curriculum, life events, memory archive |

### 1.4 Platform Targets

- iOS 16+ (primary launch platform)
- Android 12+ (within initial launch window)
- Mobile web (acquisition and onboarding only, no full feature parity)

---

## 2. Architecture Overview

### 2.1 High-Level Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│         iOS App          Android App          Web        │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTPS / REST + WebSocket
┌─────────────────▼───────────────────────────────────────┐
│                   API GATEWAY                            │
│         Auth Validation · Rate Limiting · Routing        │
└──┬──────────┬──────────┬──────────┬──────────┬──────────┘
   │          │          │          │          │
┌──▼──┐  ┌───▼───┐  ┌───▼───┐  ┌───▼───┐  ┌───▼───┐
│User │  │ Dog   │  │ Plan  │  │Session│  │  AI   │
│Svc  │  │Profile│  │  Svc  │  │  Svc  │  │ Coach │
│     │  │  Svc  │  │       │  │       │  │  Svc  │
└──┬──┘  └───┬───┘  └───┬───┘  └───┬───┘  └───┬───┘
   │          │          │          │          │
┌──▼──────────▼──────────▼──────────▼──────────▼──────────┐
│                    DATA LAYER                            │
│    PostgreSQL (Supabase)  ·  Vector DB  ·  S3 Storage    │
└──────────────────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│              SUPPORTING SERVICES                         │
│   Video Pipeline · Notifications · Billing · Analytics   │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Architectural Principles

- **Supabase-first for v1:** Use Supabase for database, auth, storage, and real-time instead of building custom microservices prematurely
- **Edge functions for lightweight logic:** Supabase Edge Functions (Deno) handle plan generation, AI calls, and event processing
- **Stateless API layer:** All application state lives in the database, not in server memory
- **Mobile-first data design:** All API responses optimized for mobile payload size and offline resilience
- **Progressive complexity:** V1 uses simple rule-based engines where possible; AI layers are additive, not foundational

### 2.3 Technology Stack Summary

| Layer | Technology | Rationale |
|---|---|---|
| Mobile | Expo + React Native + TypeScript | Cross-platform, fast iteration, large AI tooling support |
| State Management | Zustand | Lightweight, minimal boilerplate |
| Navigation | Expo Router (file-based) | Native feel, deep linking support |
| Backend | Supabase (PostgreSQL + Edge Functions) | Full backend in one service for v1 |
| AI Coach | Anthropic Claude API (claude-sonnet) | Best conversational quality, context handling |
| Payments | RevenueCat | Cross-platform subscription management |
| Push Notifications | Expo Notifications + Supabase triggers | Integrated with existing stack |
| Video Storage | Supabase Storage (S3-compatible) | Unified with backend stack |
| Analytics | PostHog (self-hosted or cloud) | Product analytics with event tracking |
| Error Monitoring | Sentry | Mobile and backend error tracking |
| CI/CD | GitHub Actions + EAS Build | Automated builds and submissions |

---

## 3. Mobile Application

### 3.1 Project Structure

```
pawly/
├── app/                          # Expo Router file-based navigation
│   ├── (auth)/                   # Auth group — unauthenticated screens
│   │   ├── welcome.tsx
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (onboarding)/             # Onboarding flow
│   │   ├── dog-basics.tsx
│   │   ├── dog-problem.tsx
│   │   ├── dog-environment.tsx
│   │   ├── video-upload.tsx
│   │   └── plan-preview.tsx
│   ├── (tabs)/                   # Main authenticated tab navigator
│   │   ├── train/
│   │   │   ├── index.tsx         # Today card / home
│   │   │   ├── session/[id].tsx  # Active session screen
│   │   │   └── plan.tsx          # Full plan view
│   │   ├── progress/
│   │   │   ├── index.tsx         # Progress dashboard
│   │   │   └── milestones.tsx
│   │   ├── coach/
│   │   │   └── index.tsx         # AI coach chat
│   │   ├── know/
│   │   │   ├── index.tsx         # Dog profile / personality
│   │   │   └── insights.tsx
│   │   └── profile/
│   │       ├── index.tsx
│   │       └── settings.tsx
│   └── _layout.tsx               # Root layout
├── components/                   # Reusable components
│   ├── ui/                       # Base UI components
│   ├── session/                  # Session engine components
│   ├── coach/                    # Chat components
│   ├── progress/                 # Charts and scorecards
│   └── shared/                   # Cards, modals, etc.
├── stores/                       # Zustand state stores
│   ├── authStore.ts
│   ├── dogStore.ts
│   ├── sessionStore.ts
│   ├── planStore.ts
│   └── coachStore.ts
├── services/                     # API and external service calls
│   ├── supabase.ts               # Supabase client
│   ├── anthropic.ts              # AI coach API calls
│   ├── revenuecat.ts             # Subscription management
│   └── notifications.ts         # Push notification handling
├── hooks/                        # Custom React hooks
├── utils/                        # Helpers and formatters
├── types/                        # TypeScript type definitions
├── constants/                    # App-wide constants
└── assets/                       # Images, fonts, animations
```

### 3.2 Navigation Architecture

```
Root Layout
├── Auth Stack (unauthenticated)
│   ├── Welcome Screen
│   ├── Login Screen
│   └── Signup Screen
├── Onboarding Stack (post-auth, pre-dog-profile)
│   ├── Dog Basics
│   ├── Problem Selection
│   ├── Environment Setup
│   ├── Video Upload
│   └── Plan Preview → Paywall
└── Main Tab Navigator (authenticated + dog profile exists)
    ├── Train Tab
    │   ├── Today Screen (home)
    │   ├── Session Screen
    │   └── Full Plan Screen
    ├── Progress Tab
    │   ├── Dashboard
    │   └── Milestones
    ├── Coach Tab
    │   └── Chat Screen
    ├── Know Tab
    │   ├── Dog Profile
    │   └── Insights Feed
    └── Profile Tab
        ├── Settings
        └── Subscription Management
```

### 3.3 State Management

Zustand stores are the single source of truth for application state. Supabase real-time subscriptions sync relevant tables to local store state.

#### authStore

```typescript
interface AuthStore {
  user: User | null
  session: Session | null
  subscriptionTier: 'free' | 'core' | 'premium'
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}
```

#### dogStore

```typescript
interface DogStore {
  dog: Dog | null
  activePlan: Plan | null
  behaviorGoals: BehaviorGoal[]
  sessionHistory: Session[]
  isLoading: boolean
  fetchDog: (dogId: string) => Promise<void>
  updateDog: (updates: Partial<Dog>) => Promise<void>
  fetchActivePlan: () => Promise<void>
}
```

#### sessionStore

```typescript
interface SessionStore {
  currentSession: ActiveSession | null
  currentStepIndex: number
  timerSeconds: number
  repCount: number
  isTimerRunning: boolean
  startSession: (exerciseId: string) => void
  advanceStep: () => void
  completeSession: (score: SessionScore) => Promise<void>
  abandonSession: () => void
}
```

#### coachStore

```typescript
interface CoachStore {
  messages: ChatMessage[]
  isTyping: boolean
  sendMessage: (content: string) => Promise<void>
  clearHistory: () => void
}
```

### 3.4 Offline Handling

V1 offline strategy: graceful degradation, not full offline-first.

| Feature | Offline Behavior |
|---|---|
| Today card | Show last cached plan from AsyncStorage |
| Active session | Fully functional offline, syncs on reconnect |
| AI coach | Show "Connect to get coaching" message |
| Progress charts | Show cached data, flag as potentially stale |
| Video upload | Queue upload, retry on reconnect |

Implementation: React Query with `staleTime` and `cacheTime` configuration. Failed mutations queued in AsyncStorage and retried on app foreground.

### 3.5 Core Screens — Detailed Spec

#### Today Screen (Train Home)

Purpose: The primary daily engagement surface. One clear action every day.

Components:
- `DogGreetingHeader` — dog name, current streak, avatar
- `TodayCard` — primary CTA card with today's session or walk goal
- `WalkCheckIn` — one-tap post-walk logging (appears after estimated walk time)
- `QuickWinStrip` — horizontal scroll of 3 quick enrichment ideas
- `RecentProgressBanner` — last milestone or improvement note

Data requirements:
- Active plan with today's session
- Walk streak and last walk log
- Recent session completion status
- Current behavior scorecard

State transitions:
```
No plan → show "Complete onboarding" CTA
Plan exists, session incomplete → show session CTA
Session complete today → show walk check-in or enrichment
Walk logged → show tomorrow preview
```

#### Session Screen

Purpose: Guide the user through a training session step by step.

State machine:
```
IDLE
  ↓ startSession()
SETUP          ← Show environment checklist
  ↓ confirm ready
STEP_ACTIVE    ← Show current step, timer, rep counter
  ↓ completeStep() or timer expires
STEP_REVIEW    ← Show success criteria, was it achieved?
  ↓ next step or last step
SESSION_COMPLETE ← Show summary, success score input
  ↓ submitSession()
LOGGED         ← Navigate back to Today screen
```

Components:
- `ProgressBar` — steps 1 of N
- `StepCard` — instruction text, visual, common mistakes
- `TimerRing` — circular countdown timer
- `RepCounter` — tap to increment reps
- `DifficultySelector` — easy / okay / hard at completion
- `VideoPrompt` — optional "record this session" CTA at end

#### AI Coach Screen

Purpose: Conversational support grounded in the dog's full context.

Components:
- `MessageList` — chat history with role-based styling
- `TypingIndicator` — animated dots while waiting for response
- `QuickSuggestions` — contextual suggestion chips above input
- `MessageInput` — text input with send button
- `ContextBadge` — small indicator showing "Pawly knows Max's profile"

Quick suggestion examples (dynamically generated based on context):
- "Why is Max doing this?"
- "We had a bad walk today"
- "What should I work on next?"
- "Is this normal for his age?"

---

## 4. Backend Services

### 4.1 Supabase Project Structure

All backend logic in v1 runs through Supabase:

| Supabase Feature | Used For |
|---|---|
| PostgreSQL | All relational data |
| Auth | User authentication |
| Storage | Video and image files |
| Edge Functions | Plan generation, AI calls, event processing |
| Real-time | Live session sync, notification triggers |
| Row Level Security | Data access control per user |

### 4.2 Edge Functions

Edge functions are Deno-based serverless functions running at the Supabase edge.

#### `generate-plan`

Triggered: after onboarding completion  
Input: dog profile, behavior goals, environment data  
Process: rule-based plan selector → protocol module assembly → plan JSON  
Output: inserts new plan record with session array

```typescript
// Simplified plan generation logic
async function generatePlan(dogProfile: DogProfile): Promise<Plan> {
  const primaryGoal = dogProfile.behavior_goals[0]
  const ageGroup = getAgeGroup(dogProfile.age_months)
  const difficultyLevel = assessDifficulty(dogProfile)
  
  const protocols = await fetchProtocols({
    behavior: primaryGoal,
    ageGroup,
    difficultyLevel,
    environment: dogProfile.environment_type
  })
  
  const sessions = assembleSessionSequence(protocols, {
    sessionsPerWeek: dogProfile.available_days_per_week,
    durationWeeks: 4
  })
  
  return {
    dog_id: dogProfile.id,
    goal: primaryGoal,
    sessions,
    duration_weeks: 4,
    created_at: new Date().toISOString()
  }
}
```

#### `ai-coach-message`

Triggered: user sends message in coach chat  
Input: message content, conversation history, dog context  
Process: assemble system prompt → call Anthropic API → store response  
Output: assistant message stored and returned to client

#### `process-video-upload`

Triggered: video uploaded to Supabase Storage  
Input: storage path, user context, video metadata  
Process: extract metadata → generate structured review request → notify expert queue  
Output: video record updated with metadata, expert review job created

#### `generate-insights`

Triggered: cron job, weekly  
Input: all active dogs with sufficient session history  
Process: analyze session patterns → generate insight text via Claude → store  
Output: new insight records per dog

#### `lifecycle-trigger-check`

Triggered: cron job, daily  
Input: all active dogs  
Process: check age milestones, upcoming events, session gaps  
Output: trigger appropriate programs, send push notifications

### 4.3 Real-time Subscriptions

Mobile clients subscribe to relevant Supabase real-time channels:

| Channel | Table | Event | Mobile Action |
|---|---|---|---|
| `dog-updates` | dogs | UPDATE | Refresh dog store |
| `plan-updates` | plans | UPDATE | Refresh plan store |
| `new-insight` | insights | INSERT | Show insight badge |
| `session-sync` | sessions | INSERT | Update progress charts |

---

## 5. Database Schema

### 5.1 Core Tables

#### `users`

```sql
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT UNIQUE NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'core', 'premium')),
  subscription_expires_at TIMESTAMPTZ,
  revenuecat_id     TEXT UNIQUE,
  household_id      UUID REFERENCES households(id),
  timezone          TEXT DEFAULT 'UTC',
  notification_prefs JSONB DEFAULT '{}',
  onboarding_completed_at TIMESTAMPTZ
);
```

#### `households`

```sql
CREATE TABLE households (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  owner_id    UUID REFERENCES users(id),
  name        TEXT
);
```

#### `dogs`

```sql
CREATE TABLE dogs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id              UUID REFERENCES users(id) NOT NULL,
  household_id          UUID REFERENCES households(id),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  name                  TEXT NOT NULL,
  breed                 TEXT,
  breed_group           TEXT,
  age_months            INTEGER,
  sex                   TEXT CHECK (sex IN ('male', 'female')),
  neutered              BOOLEAN,
  weight_kg             DECIMAL(5,2),
  adoption_date         DATE,
  source                TEXT,
  environment_type      TEXT CHECK (environment_type IN ('apartment', 'house_no_yard', 'house_yard')),
  household_members     JSONB DEFAULT '[]',
  other_pets            JSONB DEFAULT '[]',
  behavior_goals        TEXT[] DEFAULT '{}',
  training_experience   TEXT CHECK (training_experience IN ('none', 'some', 'experienced')),
  reactivity_level      INTEGER CHECK (reactivity_level BETWEEN 1 AND 5),
  energy_level          INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  motivation_type       TEXT CHECK (motivation_type IN ('food', 'toy', 'praise', 'mixed')),
  equipment             TEXT[] DEFAULT '{}',
  available_minutes_day INTEGER,
  available_days_week   INTEGER,
  personality_profile   JSONB DEFAULT '{}',
  lifecycle_stage       TEXT DEFAULT 'puppy',
  avatar_url            TEXT
);
```

#### `behavior_goals`

```sql
CREATE TABLE behavior_goals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id      UUID REFERENCES dogs(id) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  behavior    TEXT NOT NULL,
  severity    TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  status      TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  baseline_score INTEGER,
  current_score  INTEGER,
  completed_at   TIMESTAMPTZ
);
```

#### `plans`

```sql
CREATE TABLE plans (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id           UUID REFERENCES dogs(id) NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  goal             TEXT NOT NULL,
  status           TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  duration_weeks   INTEGER,
  sessions_per_week INTEGER,
  current_week     INTEGER DEFAULT 1,
  current_stage    TEXT DEFAULT 'foundation',
  protocol_ids     TEXT[],
  metadata         JSONB DEFAULT '{}'
);
```

#### `sessions`

```sql
CREATE TABLE sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) NOT NULL,
  dog_id           UUID REFERENCES dogs(id) NOT NULL,
  plan_id          UUID REFERENCES plans(id),
  exercise_id      TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,
  duration_seconds INTEGER,
  success_score    INTEGER CHECK (success_score BETWEEN 1 AND 5),
  difficulty       TEXT CHECK (difficulty IN ('easy', 'okay', 'hard')),
  notes            TEXT,
  video_id         UUID REFERENCES videos(id),
  step_results     JSONB DEFAULT '[]',
  abandoned        BOOLEAN DEFAULT FALSE
);
```

#### `walk_logs`

```sql
CREATE TABLE walk_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) NOT NULL,
  dog_id        UUID REFERENCES dogs(id) NOT NULL,
  logged_at     TIMESTAMPTZ DEFAULT NOW(),
  quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 3),
  goal_achieved BOOLEAN,
  notes         TEXT,
  duration_minutes INTEGER
);
```

#### `videos`

```sql
CREATE TABLE videos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) NOT NULL,
  dog_id            UUID REFERENCES dogs(id) NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  storage_path      TEXT NOT NULL,
  duration_seconds  INTEGER,
  file_size_bytes   BIGINT,
  context_behavior  TEXT,
  context_before    TEXT,
  context_goal      TEXT,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'complete', 'failed')),
  metadata          JSONB DEFAULT '{}',
  expert_review_id  UUID REFERENCES expert_reviews(id),
  is_milestone      BOOLEAN DEFAULT FALSE,
  thumbnail_url     TEXT
);
```

#### `expert_reviews`

```sql
CREATE TABLE expert_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id        UUID REFERENCES videos(id) NOT NULL,
  user_id         UUID REFERENCES users(id) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  assigned_at     TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  trainer_id      UUID REFERENCES trainers(id),
  status          TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'assigned', 'in_review', 'complete')),
  feedback        TEXT,
  timestamps      JSONB DEFAULT '[]',
  follow_up_used  BOOLEAN DEFAULT FALSE,
  rating          INTEGER CHECK (rating BETWEEN 1 AND 5)
);
```

#### `coach_conversations`

```sql
CREATE TABLE coach_conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) NOT NULL,
  dog_id     UUID REFERENCES dogs(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active  BOOLEAN DEFAULT TRUE
);
```

#### `coach_messages`

```sql
CREATE TABLE coach_messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID REFERENCES coach_conversations(id) NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  role             TEXT CHECK (role IN ('user', 'assistant')),
  content          TEXT NOT NULL,
  tokens_used      INTEGER,
  model_version    TEXT,
  context_snapshot JSONB DEFAULT '{}'
);
```

#### `milestones`

```sql
CREATE TABLE milestones (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id       UUID REFERENCES dogs(id) NOT NULL,
  user_id      UUID REFERENCES users(id) NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  type         TEXT NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  behavior     TEXT,
  shared       BOOLEAN DEFAULT FALSE,
  share_image_url TEXT
);
```

#### `insights`

```sql
CREATE TABLE insights (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id       UUID REFERENCES dogs(id) NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  read_at      TIMESTAMPTZ,
  type         TEXT NOT NULL,
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  action_label TEXT,
  action_route TEXT,
  priority     INTEGER DEFAULT 5,
  expires_at   TIMESTAMPTZ
);
```

#### `protocols` (content table)

```sql
CREATE TABLE protocols (
  id               TEXT PRIMARY KEY,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  behavior         TEXT NOT NULL,
  stage            TEXT NOT NULL,
  title            TEXT NOT NULL,
  description      TEXT,
  objective        TEXT,
  duration_minutes INTEGER,
  rep_count        INTEGER,
  steps            JSONB NOT NULL,
  success_criteria TEXT,
  common_mistakes  JSONB DEFAULT '[]',
  equipment_needed TEXT[] DEFAULT '{}',
  age_min_months   INTEGER,
  age_max_months   INTEGER,
  environment_tags TEXT[] DEFAULT '{}',
  difficulty       INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  next_protocol_id TEXT,
  regression_protocol_id TEXT,
  trainer_notes    TEXT,
  version          INTEGER DEFAULT 1
);
```

#### `streaks`

```sql
CREATE TABLE streaks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) NOT NULL,
  dog_id           UUID REFERENCES dogs(id) NOT NULL,
  type             TEXT CHECK (type IN ('session', 'walk', 'overall')),
  current_streak   INTEGER DEFAULT 0,
  longest_streak   INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
```

#### `trainers`

```sql
CREATE TABLE trainers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  credentials      TEXT[],
  specializations  TEXT[],
  bio              TEXT,
  avatar_url       TEXT,
  is_active        BOOLEAN DEFAULT TRUE,
  review_capacity  INTEGER DEFAULT 10
);
```

### 5.2 Row Level Security Policies

All tables have RLS enabled. Key policies:

```sql
-- Users can only read/write their own data
CREATE POLICY "Users own their data" ON dogs
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Users own their sessions" ON sessions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users own their conversations" ON coach_conversations
  FOR ALL USING (user_id = auth.uid());

-- Protocols are readable by all authenticated users
CREATE POLICY "Protocols are public to authenticated users" ON protocols
  FOR SELECT USING (auth.role() = 'authenticated');

-- Trainers can read expert reviews assigned to them
CREATE POLICY "Trainers read assigned reviews" ON expert_reviews
  FOR SELECT USING (
    trainer_id = auth.uid() OR user_id = auth.uid()
  );
```

### 5.3 Indexes

```sql
-- Performance-critical indexes
CREATE INDEX idx_sessions_dog_id ON sessions(dog_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX idx_walk_logs_dog_id_logged_at ON walk_logs(dog_id, logged_at DESC);
CREATE INDEX idx_coach_messages_conversation_id ON coach_messages(conversation_id);
CREATE INDEX idx_insights_dog_id_read ON insights(dog_id, read_at);
CREATE INDEX idx_videos_dog_id ON videos(dog_id);
CREATE INDEX idx_milestones_dog_id ON milestones(dog_id, created_at DESC);
```

---

## 6. AI & ML Systems

### 6.1 AI Coach — Full Architecture

The AI coach is a RAG-augmented conversational system powered by the Anthropic Claude API, grounded in the user's dog profile, training history, and a trainer-authored knowledge base.

#### Context Assembly Pipeline

Every message sent to Claude is preceded by context assembly:

```typescript
async function assembleCoachContext(
  userId: string,
  dogId: string,
  conversationId: string
): Promise<CoachContext> {
  
  // 1. Fetch dog profile
  const dog = await fetchDog(dogId)
  
  // 2. Fetch active plan summary
  const plan = await fetchActivePlan(dogId)
  
  // 3. Fetch recent session history (last 7 days)
  const recentSessions = await fetchRecentSessions(dogId, 7)
  
  // 4. Fetch recent walk logs
  const recentWalks = await fetchRecentWalks(dogId, 7)
  
  // 5. Fetch conversation history (last 20 messages)
  const history = await fetchConversationHistory(conversationId, 20)
  
  // 6. Retrieve relevant knowledge chunks (RAG)
  const relevantProtocols = await retrieveRelevantProtocols(
    dog.behavior_goals,
    plan?.goal
  )
  
  return {
    dog,
    plan,
    recentSessions,
    recentWalks,
    history,
    relevantProtocols
  }
}
```

#### System Prompt Template

```
You are Pawly's AI training coach. You are warm, direct, knowledgeable, 
and always specific to this dog and owner.

## Dog Profile
Name: {{dog.name}}
Breed: {{dog.breed}} ({{dog.breed_group}} group)
Age: {{dog.age_months}} months ({{lifecycle_stage}})
Sex: {{dog.sex}}, {{neutered_status}}
Environment: {{dog.environment_type}}
Household: {{household_description}}
Energy level: {{dog.energy_level}}/5
Reactivity level: {{dog.reactivity_level}}/5
Primary motivation: {{dog.motivation_type}}
Equipment available: {{dog.equipment}}

## Current Training Focus
Goal: {{plan.goal}}
Current stage: {{plan.current_stage}}
Week {{plan.current_week}} of {{plan.duration_weeks}}

## Recent Activity (Last 7 Days)
Sessions completed: {{session_count}}
Average success score: {{avg_success_score}}
Walk quality trend: {{walk_trend}}
Last session: {{last_session_summary}}

## Relevant Training Protocols
{{relevant_protocols_text}}

## Your Guidelines
- Always address {{dog.name}} by name
- Ground all advice in the current training stage and plan
- Never diagnose medical conditions — refer to vet when behavior changes suggest health issues
- Never recommend aversive, punishment-based, or dominance methods
- For severe aggression, bite history, or extreme fear — strongly recommend in-person behaviorist
- Keep responses concise and actionable — owners want to know what to do, not read essays
- If uncertain, say so and offer the safest conservative approach
- Always end advice with one clear next action
```

#### API Call Implementation

```typescript
async function sendCoachMessage(
  message: string,
  context: CoachContext,
  conversationId: string
): Promise<string> {
  
  const systemPrompt = buildSystemPrompt(context)
  const messages = formatConversationHistory(context.history)
  messages.push({ role: 'user', content: message })
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    system: systemPrompt,
    messages
  })
  
  const assistantContent = response.content[0].text
  
  // Store both messages
  await supabase.from('coach_messages').insert([
    {
      conversation_id: conversationId,
      role: 'user',
      content: message,
      context_snapshot: summarizeContext(context)
    },
    {
      conversation_id: conversationId,
      role: 'assistant',
      content: assistantContent,
      tokens_used: response.usage.output_tokens,
      model_version: 'claude-sonnet-4-6'
    }
  ])
  
  return assistantContent
}
```

### 6.2 Plan Generation Engine (V1 — Rules-Based)

V1 plan generation uses a deterministic rules engine. AI generation is introduced in V2.

```typescript
interface PlanGenerationInput {
  dogProfile: Dog
  primaryGoal: string
  secondaryGoals: string[]
  availableDaysPerWeek: number
  sessionDurationMinutes: number
}

function generatePlan(input: PlanGenerationInput): PlanOutput {
  
  // Step 1: Classify difficulty
  const difficulty = classifyDifficulty({
    behavior: input.primaryGoal,
    severity: input.dogProfile.reactivity_level,
    age: input.dogProfile.age_months,
    trainingHistory: input.dogProfile.training_experience
  })
  
  // Step 2: Select protocol sequence
  const protocols = selectProtocols({
    behavior: input.primaryGoal,
    difficulty,
    ageGroup: getAgeGroup(input.dogProfile.age_months),
    environmentType: input.dogProfile.environment_type
  })
  
  // Step 3: Schedule sessions
  const schedule = buildSchedule({
    protocols,
    daysPerWeek: input.availableDaysPerWeek,
    sessionDuration: input.sessionDurationMinutes
  })
  
  return {
    goal: input.primaryGoal,
    difficulty,
    protocols,
    schedule,
    estimatedWeeks: Math.ceil(protocols.length / input.availableDaysPerWeek),
    equipmentNeeded: extractEquipment(protocols)
  }
}
```

### 6.3 Behavior Classifier

Maps onboarding answers to structured behavior severity assessment:

```typescript
interface BehaviorClassification {
  behavior: string
  severity: 'mild' | 'moderate' | 'severe'
  baselineScore: number  // 1–100, lower = more problematic
  flags: string[]        // e.g. ['possible_fear_component', 'age_regression_risk']
  escalationRequired: boolean
}

function classifyBehavior(
  behavior: string,
  dogProfile: Dog,
  ownerResponses: OnboardingResponses
): BehaviorClassification {
  
  // Check for escalation triggers first
  const escalationFlags = checkEscalationTriggers(behavior, ownerResponses)
  if (escalationFlags.requiresProfessional) {
    return {
      behavior,
      severity: 'severe',
      baselineScore: 10,
      flags: escalationFlags.reasons,
      escalationRequired: true
    }
  }
  
  // Score severity based on frequency, duration, and context
  const severityScore = computeSeverityScore(behavior, ownerResponses)
  
  return {
    behavior,
    severity: scoredToSeverity(severityScore),
    baselineScore: severityToBaseline(severityScore),
    flags: extractBehaviorFlags(behavior, dogProfile),
    escalationRequired: false
  }
}
```

### 6.4 Insight Generation

Weekly cron job generates personalized insights per dog using Claude:

```typescript
async function generateInsightsForDog(dogId: string): Promise<void> {
  const data = await fetchDogInsightData(dogId)
  
  const prompt = `
    Analyze this dog's training data and generate 1-3 personalized insights.
    
    Dog: ${data.dog.name}, ${data.dog.age_months} months, ${data.dog.breed}
    Sessions last 14 days: ${data.sessionSummary}
    Walk quality trend: ${data.walkTrend}
    Current goals: ${data.goals}
    Lifecycle stage: ${data.lifecycleStage}
    
    Return a JSON array of insight objects with fields:
    type, title, body, action_label, action_route, priority (1-10)
    
    Insights should be:
    - Specific to this dog's actual data, not generic advice
    - Actionable with a clear next step
    - Written in Pawly's warm, direct voice
    - Maximum 2 sentences for body text
    
    Return ONLY the JSON array, no other text.
  `
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }]
  })
  
  const insights = JSON.parse(response.content[0].text)
  
  await supabase.from('insights').insert(
    insights.map(insight => ({
      ...insight,
      dog_id: dogId,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }))
  )
}
```

### 6.5 Progress Adaptation Engine

Adjusts session difficulty based on recent outcomes:

```typescript
function computeNextSessionDifficulty(
  currentProtocol: Protocol,
  recentSessions: Session[]
): 'regress' | 'maintain' | 'advance' {
  
  const last3Sessions = recentSessions.slice(-3)
  if (last3Sessions.length < 2) return 'maintain'
  
  const avgScore = average(last3Sessions.map(s => s.success_score))
  const allEasy = last3Sessions.every(s => s.difficulty === 'easy')
  const consecutiveHard = last3Sessions.every(s => s.difficulty === 'hard')
  
  if (avgScore >= 4 && allEasy) return 'advance'
  if (avgScore <= 2 || consecutiveHard) return 'regress'
  return 'maintain'
}
```

---

## 7. API Specification

### 7.1 API Design Principles

- RESTful endpoints via Supabase auto-generated API + custom Edge Functions
- All requests authenticated via JWT from Supabase Auth
- Consistent response envelope for custom endpoints
- ISO 8601 timestamps throughout
- Snake_case field naming

### 7.2 Response Envelope

```typescript
interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
  meta?: {
    page?: number
    total?: number
    cursor?: string
  }
}

interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}
```

### 7.3 Key Endpoints

#### Authentication
```
POST   /auth/v1/signup            Create account
POST   /auth/v1/token             Login / refresh token
POST   /auth/v1/logout            Invalidate session
POST   /auth/v1/recover           Password reset
```

#### Dog Profile
```
GET    /rest/v1/dogs              Get user's dogs
POST   /rest/v1/dogs              Create dog profile
PATCH  /rest/v1/dogs?id=eq.{id}  Update dog profile
```

#### Plans
```
POST   /functions/v1/generate-plan    Generate personalized plan
GET    /rest/v1/plans?dog_id=eq.{id}  Get dog's plans
PATCH  /rest/v1/plans?id=eq.{id}      Update plan status
```

#### Sessions
```
GET    /rest/v1/protocols?id=eq.{id}  Fetch session protocol
POST   /rest/v1/sessions              Log completed session
GET    /rest/v1/sessions?dog_id=eq.{id}&order=created_at.desc  Session history
```

#### Walk Logs
```
POST   /rest/v1/walk_logs         Log walk
GET    /rest/v1/walk_logs?dog_id=eq.{id}&order=logged_at.desc  Walk history
```

#### AI Coach
```
POST   /functions/v1/ai-coach-message   Send message, receive response
GET    /rest/v1/coach_messages?conversation_id=eq.{id}  Message history
```

#### Videos
```
POST   /storage/v1/object/videos/{path}   Upload video
POST   /functions/v1/process-video        Trigger processing
GET    /rest/v1/videos?dog_id=eq.{id}     Video library
```

#### Progress
```
GET    /functions/v1/progress-summary     Aggregated progress data
GET    /rest/v1/milestones?dog_id=eq.{id} Milestones list
GET    /rest/v1/streaks?dog_id=eq.{id}    Streak data
```

#### Insights
```
GET    /rest/v1/insights?dog_id=eq.{id}&read_at=is.null  Unread insights
PATCH  /rest/v1/insights?id=eq.{id}       Mark insight as read
```

### 7.4 Rate Limiting

| Endpoint Category | Limit |
|---|---|
| AI coach messages | 30 per hour per user (free: 5 per day) |
| Plan generation | 10 per day per user |
| Video uploads | 3 per day (free), 20 per day (core), unlimited (premium) |
| General API | 1000 requests per minute per user |

---

## 8. Authentication & Authorization

### 8.1 Auth Flow

```
User enters email + password
        ↓
Supabase Auth validates credentials
        ↓
Returns: access_token (JWT, 1 hour) + refresh_token (30 days)
        ↓
Mobile stores tokens in SecureStore (Expo)
        ↓
All API requests include: Authorization: Bearer {access_token}
        ↓
Token expired? → Auto-refresh using refresh_token
        ↓
Refresh expired? → Redirect to login
```

### 8.2 Social Auth

Supported in v1:
- Apple Sign In (required for iOS App Store)
- Google Sign In

Implementation via Supabase Auth providers. Deep link callback: `pawly://auth/callback`

### 8.3 Token Storage

```typescript
// Secure token storage using Expo SecureStore
import * as SecureStore from 'expo-secure-store'

const TOKEN_KEY = 'pawly_auth_token'
const REFRESH_KEY = 'pawly_refresh_token'

export const storeTokens = async (access: string, refresh: string) => {
  await SecureStore.setItemAsync(TOKEN_KEY, access)
  await SecureStore.setItemAsync(REFRESH_KEY, refresh)
}

export const getAccessToken = () => SecureStore.getItemAsync(TOKEN_KEY)
export const getRefreshToken = () => SecureStore.getItemAsync(REFRESH_KEY)

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
  await SecureStore.deleteItemAsync(REFRESH_KEY)
}
```

### 8.4 Authorization Model

| Action | Free | Core | Premium |
|---|---|---|---|
| Create dog profile | ✓ | ✓ | ✓ |
| Complete first session | ✓ | ✓ | ✓ |
| Generate full plan | — | ✓ | ✓ |
| Unlimited sessions | — | ✓ | ✓ |
| AI coach (limited) | 5/day | ✓ | ✓ |
| AI coach (unlimited) | — | ✓ | ✓ |
| Video upload | 1 total | 20/day | Unlimited |
| Expert review | — | Add-on | 2/month |
| Family mode | — | — | ✓ |
| Advanced programs | — | — | ✓ |
| Annual report | — | ✓ | ✓ |

---

## 9. Video Pipeline

### 9.1 Upload Flow

```
User records/selects video on device
        ↓
Local compression (Expo AV + FFmpeg via native module)
  Target: 720p max, H.264, 2Mbps, max 5 minutes
        ↓
Generate upload URL via Supabase Storage signed URL
        ↓
Multipart upload to Supabase Storage (S3-compatible)
  Path: videos/{user_id}/{dog_id}/{timestamp}_{uuid}.mp4
        ↓
On upload complete → insert video record with storage_path
        ↓
Trigger Edge Function: process-video
        ↓
Update video.processing_status = 'complete'
        ↓
If expert_review requested → create expert_review record
        ↓
Notify user: "Your video is ready for review"
```

### 9.2 Video Compression (Client-Side)

```typescript
import { manipulateAsync } from 'expo-image-manipulator'
import { Video, ResizeMode } from 'expo-av'

async function compressVideo(uri: string): Promise<string> {
  // Target: max 720p, max 2 minutes for onboarding clips
  const compressed = await VideoThumbnails.getThumbnailAsync(uri, {
    time: 0,
    quality: 0.5
  })
  
  // Use Expo AV to check duration
  const { sound, status } = await Audio.Sound.createAsync({ uri })
  
  // Return original URI — compression handled by native module
  // Full FFmpeg compression via expo-video-thumbnails in production
  return uri
}
```

### 9.3 Video Metadata Extraction

On the Edge Function, extract metadata via FFprobe:

```typescript
async function extractVideoMetadata(storagePath: string): Promise<VideoMetadata> {
  const signedUrl = await getSignedUrl(storagePath)
  
  // Call FFprobe via subprocess or video analysis service
  const metadata = await analyzeVideo(signedUrl)
  
  return {
    duration_seconds: metadata.duration,
    width: metadata.width,
    height: metadata.height,
    file_size_bytes: metadata.size,
    has_audio: metadata.hasAudio,
    thumbnail_url: await generateThumbnail(storagePath)
  }
}
```

### 9.4 Expert Review Queue

```
Video uploaded + user requests review
        ↓
expert_reviews record created (status: 'queued')
        ↓
Admin dashboard shows review queue
        ↓
Trainer assigned (status: 'assigned')
        ↓
Trainer watches video, writes feedback with timestamps
        ↓
Review submitted (status: 'complete')
        ↓
Push notification to user: "Your video review is ready"
        ↓
Deduct one review credit from user's pack
```

---

## 10. Notifications & Reminders

### 10.1 Push Notification Architecture

```
Trigger Event (cron, user action, or database trigger)
        ↓
Supabase Edge Function or Database Webhook
        ↓
Expo Push Notification Service
        ↓
APNs (iOS) or FCM (Android)
        ↓
Device
```

### 10.2 Push Token Management

```typescript
// Register for push notifications on app launch
async function registerForPushNotifications(): Promise<void> {
  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') return
  
  const token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId
  })
  
  // Store token in user profile
  await supabase
    .from('users')
    .update({ push_token: token.data })
    .eq('id', userId)
}
```

### 10.3 Notification Types

| Type | Trigger | Content Example |
|---|---|---|
| Daily training reminder | User-set time | "Max's loose leash session is waiting. 8 minutes today." |
| Walk goal reminder | Morning, estimated walk time | "Today's walk goal: hold focus at 3 crossings." |
| Post-walk check-in | 30 min after estimated walk | "How was the walk? One tap to log it." |
| Missed session follow-up | 48h since last session | "No pressure. One easy win today keeps the streak alive." |
| Milestone celebration | Session completion triggers milestone | "Max's first 3-day streak. That's real progress." |
| New insight available | Weekly insight generation | "New insight about Max's energy pattern." |
| Expert review complete | Review status → complete | "Your video review is ready from [Trainer Name]." |
| Lifecycle alert | Dog age milestone | "Max is entering adolescence. Here's what to expect." |
| Streak at risk | 20h since last activity | "Your 7-day streak ends tonight. 5 minutes is enough." |

### 10.4 Notification Preferences

Users control notification categories in Settings. Stored in `users.notification_prefs` JSONB:

```json
{
  "daily_reminder": true,
  "daily_reminder_time": "18:00",
  "walk_reminders": true,
  "streak_alerts": true,
  "milestone_alerts": true,
  "insights": true,
  "expert_review": true,
  "lifecycle": true,
  "marketing": false
}
```

---

## 11. Payments & Subscriptions

### 11.1 RevenueCat Integration

RevenueCat handles all subscription logic across iOS and Android.

```typescript
import Purchases, { 
  PurchasesPackage, 
  CustomerInfo 
} from 'react-native-purchases'

// Initialize on app start
async function initializeRevenueCat(): Promise<void> {
  Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG)
  
  if (Platform.OS === 'ios') {
    await Purchases.configure({ apiKey: IOS_RC_KEY })
  } else {
    await Purchases.configure({ apiKey: ANDROID_RC_KEY })
  }
  
  // Identify user for cross-platform sync
  await Purchases.logIn(userId)
}

// Fetch available packages
async function getOfferings(): Promise<PurchasesPackage[]> {
  const offerings = await Purchases.getOfferings()
  return offerings.current?.availablePackages ?? []
}

// Purchase subscription
async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg)
  return customerInfo
}

// Check active subscription
async function getSubscriptionTier(): Promise<SubscriptionTier> {
  const customerInfo = await Purchases.getCustomerInfo()
  
  if (customerInfo.entitlements.active['premium']) return 'premium'
  if (customerInfo.entitlements.active['core']) return 'core'
  return 'free'
}
```

### 11.2 Entitlement Mapping

| RevenueCat Entitlement | Pawly Tier | Products |
|---|---|---|
| `core` | Core | Monthly $14.99, Annual $89.99 |
| `premium` | Premium | Monthly $29.99, Annual $179.99 |
| `expert_review_pack` | Add-on | 3-pack $29 (consumable) |
| `specialty_program` | Add-on | Per program $19 (consumable) |

### 11.3 Subscription Status Sync

RevenueCat webhooks → Supabase Edge Function → update `users.subscription_tier`

```typescript
// Webhook handler
async function handleRevenueCatWebhook(event: RCWebhookEvent): Promise<void> {
  const userId = event.app_user_id
  
  switch (event.type) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
      await updateSubscriptionTier(userId, event.product_id)
      break
    case 'CANCELLATION':
    case 'EXPIRATION':
      await downgradeToFree(userId)
      break
    case 'BILLING_ISSUE':
      await notifyBillingIssue(userId)
      break
  }
}
```

### 11.4 Paywall Screen Logic

```
User hits feature gate
        ↓
Check subscription tier
        ↓
Free? → Show paywall
        ↓
Paywall presents: Monthly | Annual (highlighted) | Restore
        ↓
Annual plan shown with "Save 50%" badge
        ↓
Trial available? Show 7-day free trial CTA
        ↓
Purchase flow → RevenueCat → App Store / Play Store
        ↓
On success → update local subscription state
        ↓
Return to gated feature
```

---

## 12. Analytics & Event Tracking

### 12.1 PostHog Integration

All product events tracked via PostHog for product analytics, funnel analysis, and retention metrics.

```typescript
import PostHog from 'posthog-react-native'

const posthog = new PostHog(POSTHOG_API_KEY, {
  host: 'https://app.posthog.com'
})

// Identify user on login
posthog.identify(userId, {
  email: user.email,
  subscription_tier: user.subscriptionTier,
  dog_breed: dog?.breed,
  dog_age_months: dog?.age_months,
  primary_goal: dog?.behavior_goals[0]
})
```

### 12.2 Event Taxonomy

#### Onboarding Events
```
onboarding_started
onboarding_step_completed { step: string }
dog_profile_created { breed, age_months, primary_goal }
video_uploaded_onboarding
plan_generated { goal, difficulty, weeks }
onboarding_completed
paywall_viewed { source: 'onboarding' }
trial_started
subscription_purchased { tier, period, price }
```

#### Training Events
```
session_started { exercise_id, plan_id }
session_step_completed { step_index, success: boolean }
session_completed { duration_seconds, success_score, difficulty }
session_abandoned { step_index }
walk_logged { quality_score, goal_achieved }
walk_goal_set { goal_text }
```

#### AI Coach Events
```
coach_message_sent { message_length }
coach_message_received { response_length, tokens_used }
coach_quick_suggestion_used { suggestion_text }
```

#### Progress Events
```
milestone_achieved { type, behavior }
milestone_shared { platform }
streak_extended { streak_length, type }
streak_broken { previous_length, type }
progress_chart_viewed
annual_report_generated
annual_report_shared
```

#### Video Events
```
video_upload_started { context: 'session' | 'behavior' | 'onboarding' }
video_upload_completed { duration_seconds, file_size_mb }
video_upload_failed { error_code }
expert_review_requested
expert_review_completed { rating }
```

#### Engagement Events
```
insight_viewed { type }
insight_action_taken { type, action }
app_opened { source: 'direct' | 'notification' | 'deep_link' }
notification_opened { type }
tab_viewed { tab_name }
```

### 12.3 North Star Metric Definition

```sql
-- Weekly Behavior Sessions Completed per active user
-- A session counts when: completed_at IS NOT NULL AND abandoned = FALSE

SELECT 
  DATE_TRUNC('week', completed_at) AS week,
  COUNT(*) AS sessions_completed,
  COUNT(DISTINCT user_id) AS active_users,
  COUNT(*)::FLOAT / COUNT(DISTINCT user_id) AS sessions_per_user
FROM sessions
WHERE 
  completed_at IS NOT NULL 
  AND abandoned = FALSE
  AND completed_at >= NOW() - INTERVAL '12 weeks'
GROUP BY 1
ORDER BY 1;
```

---

## 13. Infrastructure & DevOps

### 13.1 Supabase Project Configuration

```
Project: pawly-production
Region: us-east-1 (primary), eu-west-1 (future)
Database: PostgreSQL 15
Connection pooling: PgBouncer (transaction mode)
Storage: Supabase Storage (S3-compatible)
Edge Functions: Deno Deploy
Auth: Supabase Auth
```

### 13.2 Environment Strategy

| Environment | Purpose | Database |
|---|---|---|
| `local` | Developer machines | Local Supabase via Docker |
| `preview` | PR previews | Supabase branch databases |
| `staging` | Pre-release testing | Dedicated Supabase project |
| `production` | Live app | Production Supabase project |

### 13.3 Expo EAS Configuration

```json
// eas.json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "APP_ENV": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "APP_ENV": "staging"
      }
    },
    "production": {
      "env": {
        "APP_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "contact@pawly.app",
        "ascAppId": "{APP_STORE_APP_ID}",
        "appleTeamId": "{APPLE_TEAM_ID}"
      },
      "android": {
        "serviceAccountKeyPath": "./google-services-key.json",
        "track": "production"
      }
    }
  }
}
```

### 13.4 CI/CD Pipeline

```yaml
# .github/workflows/main.yml
name: Pawly CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run test
      - run: npm run lint

  deploy-edge-functions:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase functions deploy --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}

  build-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --platform all --non-interactive --auto-submit
```

### 13.5 Monitoring & Alerting

| Tool | Purpose | Alert Thresholds |
|---|---|---|
| Sentry | Error tracking | > 5 new errors/hour → Slack alert |
| PostHog | Product analytics | DAU drop > 20% → Email alert |
| Supabase Dashboard | DB performance | Query time > 2s → Investigate |
| Uptime monitoring | API availability | < 99.5% uptime → PagerDuty |

---

## 14. Security & Privacy

### 14.1 Data Classification

| Data Type | Classification | Storage | Retention |
|---|---|---|---|
| User credentials | Sensitive | Supabase Auth (hashed) | Until deletion |
| Dog profile data | Personal | PostgreSQL (RLS) | Until deletion |
| Training videos | Personal | Supabase Storage (private) | 2 years or deletion |
| Session logs | Personal | PostgreSQL (RLS) | 3 years or deletion |
| Chat messages | Personal | PostgreSQL (RLS) | 1 year rolling |
| Analytics events | Pseudonymous | PostHog | 2 years |

### 14.2 Video Security

- All videos stored in private Supabase Storage buckets
- Access via signed URLs with 1-hour expiry
- No public URLs for user video content
- Videos encrypted at rest (AES-256)
- Videos encrypted in transit (TLS 1.3)

```typescript
// Generate signed URL for video playback
async function getVideoPlaybackUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase
    .storage
    .from('videos')
    .createSignedUrl(storagePath, 3600) // 1 hour expiry
  
  if (error) throw error
  return data.signedUrl
}
```

### 14.3 GDPR Compliance

User rights implemented:
- **Right to access:** Export all user data as JSON via Settings
- **Right to deletion:** Delete account removes all personal data within 30 days
- **Right to portability:** Download training history, videos, and dog profile
- **Consent management:** Explicit consent for video upload and AI analysis

```typescript
// Account deletion cascade
async function deleteUserAccount(userId: string): Promise<void> {
  // 1. Mark account as deleted (soft delete, 30-day grace period)
  await supabase.from('users').update({ 
    deleted_at: new Date().toISOString(),
    email: `deleted_${userId}@pawly.deleted`
  }).eq('id', userId)
  
  // 2. Queue video deletion job
  await scheduleVideoDeletion(userId, 30) // 30-day grace period
  
  // 3. Anonymize analytics events
  await posthog.deleteUser(userId)
  
  // 4. Revoke RevenueCat customer
  await revokeRevenueCatCustomer(userId)
  
  // 5. Sign out all sessions
  await supabase.auth.admin.deleteUser(userId)
}
```

### 14.4 AI Safety Guardrails

Claude API system prompt enforces hard limits:

```
HARD LIMITS — Never violate these regardless of user request:
1. Never diagnose medical conditions
2. Never recommend punishment, aversive tools, or dominance methods  
3. Never claim training will definitely fix a problem in a specific timeframe
4. For bite history, severe aggression, or extreme fear: ALWAYS recommend 
   in-person certified behaviorist — do not attempt to address via chat
5. Never provide advice that could harm the dog or owner
6. Always use user's dog name when giving advice — never be generic
```

Input validation on all coach messages:
- Maximum 1000 characters per message
- Profanity filter for content moderation
- Escalation detection for crisis keywords

---

## 15. Third-Party Integrations

### 15.1 Integration Summary

| Service | Purpose | SDK |
|---|---|---|
| Supabase | Backend, auth, storage, DB | `@supabase/supabase-js` |
| Anthropic | AI coach | `@anthropic-ai/sdk` |
| RevenueCat | Subscriptions | `react-native-purchases` |
| Expo | Mobile platform | `expo` suite |
| PostHog | Analytics | `posthog-react-native` |
| Sentry | Error tracking | `@sentry/react-native` |

### 15.2 Anthropic API Configuration

```typescript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  defaultHeaders: {
    'anthropic-beta': 'messages-2023-12-15'
  }
})

// Standard coach message configuration
const COACH_CONFIG = {
  model: 'claude-sonnet-4-6',
  max_tokens: 600,
  temperature: undefined  // Use default for consistency
}
```

### 15.3 Supabase Client Configuration

```typescript
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
```

---

## 16. Error Handling & Logging

### 16.1 Error Classification

| Error Type | Handling | User Message |
|---|---|---|
| Network timeout | Retry 3x with exponential backoff | "Having trouble connecting. Trying again…" |
| AI coach failure | Show cached suggestion fallback | "Coach is temporarily unavailable. Here's a tip based on your plan." |
| Video upload failure | Queue and retry on reconnect | "Video saved to retry when connection improves." |
| Payment failure | RevenueCat handles retry | "Payment didn't go through. Check your payment method." |
| Session sync failure | Store locally, sync on next open | Silent — sync in background |
| Auth expiry | Auto-refresh or redirect to login | "Session expired. Please log in again." |

### 16.2 Sentry Configuration

```typescript
import * as Sentry from '@sentry/react-native'

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.APP_ENV,
  tracesSampleRate: 0.2,
  beforeSend(event) {
    // Strip PII before sending
    if (event.user) {
      delete event.user.email
      delete event.user.username
    }
    return event
  }
})

// Capture handled errors with context
export function captureError(error: Error, context: Record<string, unknown>) {
  Sentry.withScope(scope => {
    scope.setExtras(context)
    Sentry.captureException(error)
  })
}
```

---

## 17. Performance Requirements

### 17.1 Target Metrics

| Metric | Target | Critical Threshold |
|---|---|---|
| App cold start | < 2 seconds | > 4 seconds |
| Today screen load | < 500ms | > 1.5 seconds |
| Session screen load | < 300ms | > 1 second |
| AI coach first response | < 3 seconds | > 6 seconds |
| Video upload start | < 1 second | > 3 seconds |
| API response (p95) | < 400ms | > 1 second |
| Plan generation | < 4 seconds | > 10 seconds |

### 17.2 Image and Media Optimization

- Dog avatars: stored at 200x200px, WebP format
- Milestone share cards: generated server-side at 1080x1920 (Story format)
- Video thumbnails: extracted at upload, stored at 480x270px
- Protocol illustration images: lazy loaded, compressed WebP

### 17.3 API Response Optimization

- Today screen uses a single aggregated endpoint to minimize round trips
- Pagination: 20 items default, cursor-based for infinite scroll
- React Query caching: 5-minute stale time for static protocol content
- Supabase PostgREST selects only required columns via `select=` parameter

---

## 18. Testing Strategy

### 18.1 Testing Pyramid

```
          ┌──────────┐
          │  E2E     │  Maestro — 10 critical user flows
          ├──────────┤
          │Integration│  Supabase test environment — API + DB
          ├──────────┤
          │  Unit    │  Jest + Testing Library — business logic
          └──────────┘
```

### 18.2 Critical E2E Test Flows (Maestro)

1. Complete onboarding → generate plan → see today screen
2. Complete a full training session end-to-end
3. Send AI coach message → receive response
4. Log walk → see streak update
5. Hit paywall → complete subscription purchase
6. Upload video → confirm receipt and processing state
7. Achieve milestone → see shareable card
8. Sign out → sign back in → data persists

### 18.3 Unit Test Coverage Targets

| Module | Coverage Target |
|---|---|
| Plan generation logic | 90% |
| Behavior classifier | 90% |
| Progress adaptation engine | 85% |
| Streak calculation | 95% |
| Auth token management | 90% |
| Notification scheduling | 80% |

### 18.4 AI Coach Testing

- Golden set of 50 question/answer pairs reviewed by certified trainers
- Regression tests run on every model update
- Safety boundary tests: 20 edge cases covering escalation scenarios
- Manual review of 100 real conversations monthly post-launch

---

## 19. Release & Deployment

### 19.1 App Store Requirements

**iOS:**
- Minimum iOS 16.0
- Privacy manifest required (iOS 17+)
- App Tracking Transparency prompt if using IDFA
- Apple Sign In required (third-party auth offered)

**Android:**
- Minimum API level 31 (Android 12)
- Target API level 34 (Android 14)
- Google Play Billing for subscriptions

### 19.2 OTA Update Strategy

Expo Updates (EAS Update) for JavaScript-layer changes:

```typescript
// app.config.ts
export default {
  updates: {
    url: 'https://u.expo.dev/{PROJECT_ID}',
    fallbackToCacheTimeout: 0,
    checkAutomatically: 'ON_LOAD'
  },
  runtimeVersion: {
    policy: 'sdkVersion'
  }
}
```

OTA updates used for: content updates, bug fixes, AI prompt updates, UI tweaks  
Binary releases required for: native module changes, Expo SDK upgrades, new permissions

### 19.3 Feature Flags

PostHog feature flags control rollout of new features:

```typescript
async function isFeatureEnabled(flag: string): Promise<boolean> {
  return posthog.isFeatureEnabled(flag) ?? false
}

// Usage
if (await isFeatureEnabled('skill_ladder_v2')) {
  // Show new skill ladder UI
}
```

---

## 20. V1 Scope Boundaries

### 20.1 What V1 Includes

- Full onboarding with video upload (stored, not AI-analyzed)
- Dog profile and household graph
- Leash pulling module (full 4-stage protocol, 15 sessions)
- Recall module (full protocol)
- Jumping/calm greetings module
- Potty training module
- Crate training module
- Puppy biting module
- Barking/settling module
- Session engine with timers and rep counters
- Walk integration (daily goal + one-tap logging)
- AI coach (Claude-powered, dog-context grounded)
- Basic progress tracking (scorecard + streak)
- Milestone system with shareable cards
- Expert review queue (human trainer, async)
- Push notifications (reminders + milestones)
- Subscription paywall (RevenueCat)
- Free / Core / Premium tiers

### 20.2 What V1 Explicitly Excludes

- AI video analysis (V2)
- Real-time session coaching via camera (V3)
- Dog personality profile (V2)
- Behavior insights feed (V2)
- Community / cohorts (V2)
- Lifecycle curriculum automation (V2)
- Annual dog report (V2)
- Memory Lane (V2)
- Life event programs (V2)
- Second dog workflow (V2)
- Family / household mode (V2)
- Enrichment library (V2)
- Skill ladder beyond behavior modules (V2)
- Smart collar integration (V3)
- Live Q&A (V2)

### 20.3 V1 Success Criteria

| Metric | Target |
|---|---|
| Onboarding completion rate | > 65% |
| Activation rate (first session within 24h) | > 45% |
| Trial-to-paid conversion | > 15% |
| D30 paid retention | > 55% |
| Video upload rate in first 14 days | > 25% |
| AI coach usage (at least 1 message) in first week | > 50% |
| Expert review attach rate | > 8% |

---

## Appendix A: Environment Variables

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # Server-side only

# Anthropic
ANTHROPIC_API_KEY=               # Server-side only (Edge Functions)

# RevenueCat
EXPO_PUBLIC_REVENUECAT_IOS_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=

# PostHog
EXPO_PUBLIC_POSTHOG_API_KEY=
EXPO_PUBLIC_POSTHOG_HOST=

# Sentry
EXPO_PUBLIC_SENTRY_DSN=

# App Config
APP_ENV=development|staging|production
EXPO_PUBLIC_APP_VERSION=
```

## Appendix B: Key Dependencies

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "react-native": "0.76.0",
    "typescript": "^5.3.0",
    "@supabase/supabase-js": "^2.45.0",
    "react-native-purchases": "^8.0.0",
    "posthog-react-native": "^3.0.0",
    "@sentry/react-native": "^5.0.0",
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.0.0",
    "expo-secure-store": "~14.0.0",
    "expo-notifications": "~0.29.0",
    "expo-av": "~15.0.0",
    "expo-image-picker": "~15.0.0",
    "react-native-reanimated": "~3.16.0",
    "react-native-gesture-handler": "~2.20.0",
    "victory-native": "^40.0.0",
    "@anthropic-ai/sdk": "^0.30.0"
  }
}
```

## Appendix C: Database Migration Strategy

All schema changes managed via Supabase migrations:

```bash
# Create new migration
supabase migration new add_personality_profile

# Apply migrations to local
supabase db reset

# Push to staging
supabase db push --project-ref $STAGING_PROJECT_REF

# Push to production (after staging validation)
supabase db push --project-ref $PRODUCTION_PROJECT_REF
```

Migration files stored in `supabase/migrations/` and version controlled in Git.

---

*End of Pawly Technical Specification v1.0*