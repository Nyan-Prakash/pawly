# Pawly — Technical Specification
**Version:** 1.4
**Date:** March 17, 2026
**Status:** Current (updated to match implemented codebase including PR17 Post-Session Reflection)

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

Pawly is a mobile-first subscription application that delivers personalized dog training plans, AI-powered coaching, video feedback, and a lifecycle content system across the full lifespan of a dog. The system maintains a persistent behavioral memory of each dog and adapts its guidance based on ongoing session outcomes, structured post-session handler reflections, user-submitted video, and lifecycle stage. Sessions can be completed in manual mode or via a live camera coaching mode that uses on-device pose detection to count reps and provide real-time posture feedback.

### 1.2 Core User Flow (Happy Path)

```
Download App
     ↓
Onboarding (multi-step wizard: dog profile + goal + schedule preferences)
     ↓
Plan Generated (AI-powered via Claude API, 4-week, 8 behavior goals supported)
     ↓
Plan Preview → Account Creation → First Session
     ↓
Daily Session Loop (Manual Mode or Live Camera Coach Mode) + Walk Logging
     ↓
Post-Session Reflection (structured handler feedback captured after each session)
     ↓
AI Coach Available Throughout
     ↓
Plan Adapts Based on Session Outcomes + Reflection Signals
     ↓
Progress Tracked → Streaks → Milestones
     ↓
Expert Video Review (optional, premium add-on)
     ↓
Lifecycle Events Triggered as Dog Ages
```

### 1.3 Product Zones

| Zone | Name | Purpose | V1 Status |
|---|---|---|---|
| 1 | Train | Behavior problem solving — acquisition wedge | ✅ Implemented |
| 2 | Progress | Streaks, behavior scores, milestones, walk data | ✅ Implemented |
| 3 | Coach | AI-powered conversational training coach | ✅ Implemented |
| 4 | Know | Expert video library, articles, insights feed | ✅ Implemented (basic) |
| 5 | Profile | Settings, notifications, theme, subscription | ✅ Implemented |

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
- **AI-driven planning:** Plan generation uses Claude API via `generate-adaptive-plan` Edge Function; rules-based fallback available
- **On-device ML inference:** Dog pose detection runs entirely on-device via TFLite (no server round-trip)
- **Structured handler feedback:** Post-session reflection captures structured handler observations to enrich adaptation signals

### 2.3 Technology Stack Summary

| Layer | Technology | Rationale |
|---|---|---|
| Mobile | Expo + React Native + TypeScript | Cross-platform, fast iteration, large AI tooling support |
| Styling | NativeWind (Tailwind CSS for RN) | Utility-first styling with dark mode support |
| State Management | Zustand | Lightweight, minimal boilerplate |
| Navigation | Expo Router (file-based) | Native feel, deep linking support |
| Backend | Supabase (PostgreSQL + Edge Functions) | Full backend in one service for v1 |
| AI Coach | Anthropic Claude API (claude-sonnet-4-6) | Best conversational quality, context handling |
| AI Planning | Anthropic Claude API (claude-sonnet-4-6) | Personalized plan generation |
| Pose Detection | TFLite (MobileNet-based dog pose model) | On-device real-time dog keypoint detection |
| Camera | react-native-vision-camera v4 | High-performance frame processing |
| Payments | RevenueCat | Cross-platform subscription management (dependency included, not yet initialized) |
| Push Notifications | Expo Notifications + Supabase triggers | Integrated with existing stack |
| In-App Notifications | Supabase table + in-app store | Notification center within the app |
| Video Storage | Supabase Storage (S3-compatible) | Unified with backend stack |
| Analytics | PostHog (dependency included, not yet initialized) | Product analytics with event tracking |
| Error Monitoring | Sentry (dependency included, not yet initialized) | Mobile and backend error tracking |
| CI/CD | GitHub Actions + EAS Build | Automated builds and submissions |

---

## 3. Mobile Application

### 3.1 Project Structure

```
pawly/
├── app/                          # Expo Router file-based navigation
│   ├── (auth)/                   # Auth group — unauthenticated screens
│   │   ├── welcome.tsx           # Hero landing screen
│   │   ├── login.tsx             # Email/password + OAuth login
│   │   ├── signup.tsx            # Email/password + OAuth signup
│   │   └── forgot-password.tsx  # Password reset request
│   ├── (onboarding)/             # Onboarding flow
│   │   ├── dog-basics.tsx        # Primary onboarding wizard (dog name, breed, age, sex)
│   │   ├── dog-problem.tsx       # Select primary behavior goal & severity
│   │   ├── dog-environment.tsx   # Home environment type, household members, other pets
│   │   ├── video-upload.tsx      # Upload video of dog's current behavior
│   │   └── plan-preview.tsx      # Plan summary + paywall gate
│   ├── (tabs)/                   # Main authenticated tab navigator
│   │   ├── train/
│   │   │   ├── index.tsx         # Today card / home screen
│   │   │   ├── calendar.tsx      # Monthly training calendar view
│   │   │   ├── session.tsx       # Active session screen (manual + live camera modes + post-session reflection)
│   │   │   ├── plan.tsx          # Full plan view (all sessions)
│   │   │   ├── notifications.tsx # In-app notification center
│   │   │   ├── pose-debug.tsx    # Dev-only: pose detection debug (entry)
│   │   │   ├── pose-debug-impl.tsx  # Dev-only: pose detection debug (implementation)
│   │   │   └── upload-video.tsx  # Video submission for expert review
│   │   ├── progress/
│   │   │   ├── index.tsx         # Progress dashboard
│   │   │   └── milestones.tsx    # All milestones screen
│   │   ├── coach/
│   │   │   └── index.tsx         # AI coach chat
│   │   ├── know/
│   │   │   ├── index.tsx         # Education hub
│   │   │   ├── videos.tsx        # Video library and expert reviews
│   │   │   └── video-player.tsx  # Video playback with timestamps
│   │   └── profile/
│   │       ├── index.tsx         # Profile screen
│   │       └── notification-settings.tsx  # Notification preferences
│   └── _layout.tsx               # Root layout with navigation gate
├── components/                   # Reusable components
│   ├── ui/                       # Button, Text, Input, Card, StreakBadge, etc.
│   ├── session/                  # TimerRing, RepCounter, StepCard, SessionModePicker, LiveCoachOverlay, PostSessionReflectionCard
│   ├── coach/                    # MessageBubble, TypingIndicator, QuickSuggestions, FormattedCoachMessage
│   ├── progress/                 # MilestoneCard, ShareCard
│   ├── train/                    # TrainingCalendar, CalendarDayCell, DaySessionList
│   ├── vision/                   # DogKeypointOverlay, LiveCoachOverlay, TrackingQualityBadge
│   ├── adaptive/                 # LearningInsightCard, AdaptationNotice, WhyThisChangedSheet, PlanReasonCard, SessionChangeBadge
│   ├── notifications/            # NotificationBell, NotificationItem
│   ├── video/                    # VideoUploadProgress, ExpertReviewRequest
│   ├── onboarding/               # OptionCard, QuestionScreen, ScheduleSelector
│   └── shared/                   # WalkLogModal
├── stores/                       # Zustand state stores
│   ├── authStore.ts
│   ├── dogStore.ts
│   ├── sessionStore.ts
│   ├── planStore.ts
│   ├── coachStore.ts
│   ├── progressStore.ts
│   ├── notificationStore.ts
│   ├── videoStore.ts
│   ├── themeStore.ts
│   └── onboardingStore.ts
├── hooks/
│   ├── usePoseSession.ts         # Real-time dog pose detection hook
│   └── useLiveCoachingSession.ts # Live coaching session lifecycle hook
├── lib/                          # Utilities and service helpers
│   ├── supabase.ts               # Supabase client + createUserRecord()
│   ├── planGenerator.ts          # Goal maps, sequences, plan building (rules-based fallback)
│   ├── scheduleEngine.ts         # Schedule logic, session timing, rescheduling
│   ├── sessionManager.ts         # Session saving, streak updates, milestone checks, live coaching metrics, reflection persistence
│   ├── milestoneEngine.ts        # 13 milestone definitions and check functions
│   ├── analytics.ts              # Event capture (console-only in dev; PostHog pending)
│   ├── modelMappers.ts           # DB row → TypeScript type converters (includes reflection normalization)
│   ├── notifications.ts          # Expo Notifications wrapper, scheduling
│   ├── inAppNotifications.ts     # In-app notification logic
│   ├── videoUploader.ts          # Video upload utilities
│   ├── calendarSessions.ts       # Calendar date ops, session grouping by date
│   ├── planScheduleDiff.ts       # Plan change diffing
│   ├── theme.ts                  # useTheme() hook
│   ├── reflectionAnswerHelpers.ts  # Pure functions for PostSessionReflection (testable without RN)
│   ├── adaptivePlanning/         # Full adaptive planning engine (27 files)
│   │   ├── types.ts              # Adaptation types and interfaces
│   │   ├── config.ts             # Feature flags and configuration
│   │   ├── featureFlags.ts       # Runtime feature control
│   │   ├── initialPlanner.ts     # Rules-based fallback planner
│   │   ├── adaptationEngine.ts   # Decides when & what to adapt (uses reflection signals)
│   │   ├── adaptationRules.ts    # Adaptation trigger rules and candidate scoring (includes reflection-based rules)
│   │   ├── adaptationCompiler.ts # Converts adaptations to plan updates
│   │   ├── adaptationAudit.ts    # Audit trail for adaptations
│   │   ├── hypothesisEngine.ts   # Learning hypothesis generation (incorporates reflection evidence)
│   │   ├── learningStateEngine.ts    # Updates learning state from signals (includes reflection signals)
│   │   ├── learningStateScoring.ts   # Scores 7 dog learning dimensions
│   │   ├── learningStateSummary.ts   # Summarizes learning state
│   │   ├── learningSignals.ts        # Extracts signals from session/walk logs and post-session reflections
│   │   ├── skillGraph.ts             # Skill prerequisite/advancement graph
│   │   ├── graphTraversal.ts         # Graph traversal for skill pathfinding
│   │   ├── graphValidation.ts        # Validates skill graph integrity
│   │   ├── planValidation.ts         # Validates generated plans
│   │   ├── planDiff.ts               # Diff between plan versions
│   │   ├── planCompiler.ts           # Compiles AI planner output to concrete plan
│   │   ├── plannerPrompt.ts          # AI prompt engineering for plan generation
│   │   ├── repositories.ts           # Supabase queries for adaptation & learning state
│   │   ├── reflectionQuestionTypes.ts    # Types for reflection questions and engine input
│   │   ├── reflectionQuestionCatalog.ts  # 8 pre-defined question configs
│   │   ├── reflectionQuestionEngine.ts   # Selects questions based on session context (Rules A–G)
│   │   └── reflectionNormalizer.ts       # Validates/normalizes PostSessionReflection from raw DB JSONB
│   ├── liveCoach/                # Live coaching engine (6 files)
│   │   ├── liveCoachingTypes.ts  # CoachingEngineState, CoachingDecision, CoachingFrameInput, ResolvedCoachingConfig
│   │   ├── liveCoachingEngine.ts # Per-frame coaching state machine
│   │   ├── liveCoachingRules.ts  # Success/reset rule evaluation, feedback template selection
│   │   ├── liveCoachingSession.ts # Session lifecycle management
│   │   └── (additional support files)
│   └── vision/                   # On-device vision utilities (11 files)
│       ├── poseDecoder.ts        # Decodes TFLite output to PoseObservation
│       ├── TFLitePoseProvider.ts # TFLite model wrapper
│       ├── nativeSupport.ts      # Platform support checks
│       ├── poseStateMachine.ts   # Posture transition state machine
│       ├── postureClassifier.ts  # Classifies keypoints into posture labels (sit/down/stand)
│       ├── poseFeatureExtractor.ts  # Extracts geometric features from keypoints
│       ├── poseStabilizer.ts     # One-Euro filter smoothing of keypoints over time
│       ├── poseTrackingQuality.ts   # Computes per-frame tracking quality (good/fair/poor)
│       ├── poseEventDetector.ts  # Detects motion/tracking events
│       ├── poseOutlierRejection.ts  # Filters outlier keypoints
│       └── oneEuroFilter.ts      # One-Euro adaptive smoothing filter
├── types/                        # TypeScript type definitions
│   ├── index.ts                  # All app types (~618 lines)
│   └── pose.ts                   # Dog pose keypoint types
├── tests/                        # Unit tests (Node.js test runner)
│   ├── scheduleEngine.test.ts
│   ├── postSessionReflection.test.ts
│   ├── postSessionReflectionUI.test.ts
│   ├── reflectionAdaptation.test.ts
│   ├── reflectionPersistence.test.ts
│   ├── reflectionPolish.test.ts
│   ├── reflectionQuestionEngine.test.ts
│   └── reflectionSignals.test.ts
├── constants/                    # App-wide constants
│   ├── protocols.ts              # Full training protocol library (1,360+ lines)
│   └── colors.ts                 # Brand color palette
└── assets/                       # Images, fonts, animations, TFLite model
```

### 3.2 Navigation Architecture

```
Root Layout (RootNavigationGate)
├── Auth Stack (unauthenticated)
│   ├── Welcome Screen
│   ├── Login Screen
│   ├── Signup Screen
│   └── Forgot Password Screen
├── Onboarding Stack (authenticated but no dog profile)
│   ├── Dog Basics (dog name, breed, age, sex)
│   ├── Dog Problem (behavior goal selection)
│   ├── Dog Environment (environment type, household members, other pets)
│   ├── Video Upload (optional onboarding video)
│   └── Plan Preview → Account creation
└── Main Tab Navigator (authenticated + dog profile exists)
    ├── Train Tab
    │   ├── Today Screen (home)
    │   ├── Calendar Screen (monthly plan view)
    │   ├── Session Screen (step-by-step execution, manual or live camera, post-session reflection)
    │   ├── Full Plan Screen (all sessions, week view)
    │   ├── Notifications Screen (in-app notification center)
    │   └── Upload Video Screen
    ├── Progress Tab
    │   ├── Dashboard (streaks, behavior scores, charts, milestones)
    │   └── Milestones (full list)
    ├── Coach Tab
    │   └── Chat Screen (AI coach, hides bottom nav bar)
    ├── Know Tab
    │   ├── Education Hub
    │   ├── Video Library
    │   └── Video Player
    └── Profile Tab
        ├── Profile Screen (dog info, stats, theme)
        └── Notification Settings Screen
```

#### Navigation Gate Logic (`app/_layout.tsx`)

The `RootNavigationGate` component controls routing based on auth and dog profile state:

```
App starts
     ↓
Initialize auth session (authStore.initialize())
     ↓
Unauthenticated?
  → User can browse onboarding (dog-basics, plan-preview) freely
  → Attempting to access (tabs) → redirect to /welcome
     ↓
Authenticated, no dog profile?
  → Redirect to /(onboarding)/dog-basics
     ↓
Authenticated, dog profile exists?
  → Redirect to /(tabs)/train (Today screen)
```

Also sets up a notification response listener to deep-link into the app when users tap push notifications.

### 3.3 State Management

Zustand stores are the single source of truth for application state. Supabase provides persistence; stores are populated on app load and kept in sync.

#### authStore

```typescript
interface AuthStore {
  user: AppUser | null
  session: Session | null
  subscriptionTier: 'free' | 'core' | 'premium'
  hasDogProfile: boolean
  dogProfile: DogProfile | null
  isLoading: boolean
  isInitialized: boolean
  initialize: () => Promise<void>
  signUp: (email, password) => Promise<void>
  signIn: (email, password) => Promise<void>
  signInWithApple: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  setSubscriptionTier: (tier) => void
  setDogProfile: (profile) => void
}
```

#### dogStore

```typescript
interface DogStore {
  dog: Dog | null
  activePlan: Plan | null
  behaviorGoals: BehaviorGoal[]
  dogLearningState: DogLearningState | null
  isLoading: boolean
  setDog: (dog: Dog) => void
  setActivePlan: (plan: Plan) => void
  fetchDog: (dogId: string) => Promise<void>
  updateDog: (updates: Partial<Dog>) => Promise<void>
  fetchActivePlan: () => Promise<void>
  fetchDogLearningState: (dogId: string) => Promise<DogLearningState | null>
}
```

Uses `modelMappers.mapDogRowToDog()` and `modelMappers.mapPlanRowToPlan()` to convert DB snake_case rows to TypeScript camelCase types.

#### sessionStore

```typescript
// Session state machine
type SessionState =
  | 'LOADING' | 'INTRO' | 'SETUP'
  | 'STEP_ACTIVE' | 'STEP_COMPLETE'
  | 'SESSION_REVIEW' | 'COMPLETE' | 'ABANDONED'

interface SessionStore {
  activeSession: ActiveSession | null  // includes protocol, stepResults, timer, repCount, state
  startSession: (sessionId: string, exerciseId: string, protocol: Protocol) => void
  setState: (state: SessionState) => void
  completeStep: (result: StepResult) => void
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: (seconds?: number) => void
  incrementRep: () => void
  resetReps: () => void
  advanceToNextStep: () => void
  submitSession: (difficulty, notes, onComplete) => Promise<void>
  abandonSession: () => void
  tick: () => void
  clearSession: () => void
}
```

#### planStore

```typescript
interface PlanStore {
  activePlan: Plan | null
  protocols: Record<string, Protocol>
  todaySession: PlanSession | null      // derived from activePlan
  completionPercentage: number          // derived from activePlan
  recentAdaptations: PlanAdaptation[]
  isLoading: boolean
  fetchActivePlan: (dogId: string) => Promise<void>
  fetchProtocol: (exerciseId: string) => Promise<Protocol>
  markSessionComplete: (sessionId: string, score?: SessionScore) => Promise<void>
  getTodaySession: () => PlanSession | null
  getUpcomingSessions: (limit?: number) => PlanSession[]
  getMissedScheduledSessions: () => PlanSession[]
  rescheduleMissedSession: (sessionId: string) => Promise<void>
  refreshPlan: (dogId: string) => Promise<void>
  setActivePlan: (plan: Plan | null) => void
  fetchRecentAdaptations: (planId: string) => Promise<void>
}
```

If a loaded plan's sessions lack `scheduledDate` fields, the store calls `buildWeeklySchedule()` automatically and persists the result.

#### coachStore

```typescript
interface CoachStore {
  conversation: CoachConversation | null
  messages: ChatMessage[]
  isTyping: boolean
  rateLimitError: boolean
  initConversation: (userId: string, dogId: string) => Promise<void>
  resetConversation: () => Promise<void>
  loadHistory: () => Promise<void>
  sendMessage: (content: string) => Promise<void>
  clearRateLimitError: () => void
}
```

#### progressStore

```typescript
interface ProgressStore {
  sessionStreak: number
  walkStreak: number
  longestSessionStreak: number
  totalSessionsCompleted: number
  sessionsByWeek: WeeklyData[]
  walkQualityByWeek: WeeklyWalkData[]
  behaviorScores: BehaviorScore[]
  milestones: Milestone[]
  walkLoggedToday: boolean
  fetchProgressData: (dogId: string) => Promise<void>
  logWalk: (dogId: string, quality: 1|2|3, notes?: string, durationMinutes?: number) => Promise<void>
  fetchMilestones: (dogId: string) => Promise<void>
  checkAndCreateMilestones: (dogId: string) => Promise<void>
}
```

#### notificationStore

```typescript
interface NotificationStore {
  prefs: NotificationPrefs
  pendingNotifications: ScheduledNotification[]
  permissionStatus: PermissionStatus | null
  hasRequestedPermission: boolean
  isLoading: boolean
  items: InAppNotification[]        // in-app inbox
  unreadCount: number
  isLoadingInbox: boolean
  loadPrefs: (userId: string) => Promise<void>
  updatePrefs: (userId: string, updates: Partial<NotificationPrefs>) => Promise<void>
  refreshSchedules: (dog: Dog) => Promise<void>
  ensurePermissionAfterMeaningfulAction: () => Promise<boolean>
  fetchInbox: (userId: string) => Promise<void>
  addNotification: (notification: InAppNotification) => void
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: (userId: string) => Promise<void>
  hydrateRealtime: (userId: string) => void
}
```

#### themeStore

```typescript
interface ThemeStore {
  preference: 'system' | 'light' | 'dark'
  isDark: boolean       // computed from preference + system setting
  colorScheme: 'light' | 'dark'
  setPreference: (preference) => void
}
```

### 3.4 Offline Handling

V1 offline strategy: graceful degradation, not full offline-first.

| Feature | Offline Behavior |
|---|---|
| Today card | Show last cached plan from AsyncStorage (onboardingStore persisted) |
| Active session | Fully functional offline; syncs on reconnect |
| AI coach | Show rate limit / connectivity error message |
| Progress charts | Show cached data from last fetch |
| Video upload | Queue upload, retry on reconnect |

### 3.5 Core Screens — Detailed Spec

#### Today Screen (`app/(tabs)/train/index.tsx`)

Purpose: The primary daily engagement surface. One clear action every day.

Components:
- Greeting header — time-based greeting + dog name (from `getGreeting()` in scheduleEngine)
- `TodayCard` — primary CTA card with today's session (from `planStore.todaySession`)
- `QuickWinStrip` — horizontal scroll of 4 hardcoded enrichment quick wins (sniff walk, find it game, name drill, hand touch)
- Upcoming sessions — next 3 sessions from plan
- `WalkLogModal` — tap to log a walk
- Streak badge — current session streak
- `NotificationBell` — header badge with unread in-app notification count

State transitions:
```
No plan → show "Complete onboarding" CTA
Plan exists, session incomplete → show session CTA
Session complete today → show walk check-in or enrichment
```

#### Training Calendar Screen (`app/(tabs)/train/calendar.tsx`)

Purpose: Monthly overview of all scheduled and completed training sessions.

Components:
- `TrainingCalendar` — 6×7 monthly grid with navigation arrows
- `CalendarDayCell` — individual day cell with status indicator (completed: green dot, upcoming: secondary color)
- `DaySessionList` — session list for the selected date; shows `insertedByAdaptation` support sessions with their `supportSessionType` when present

Behavior:
- Month navigation via prev/next arrows
- Today's date is highlighted with a border
- Non-current-month dates are grayed out
- Tapping a day shows sessions scheduled for that date
- Sessions are grouped by `scheduledDate` (YYYY-MM-DD) and sorted by `scheduledTime`
- Tapping a session navigates to `/(tabs)/train/session?id={sessionId}`

#### Session Screen (`app/(tabs)/train/session.tsx`)

Purpose: Guide the user through a training session step by step. Supports two execution modes: Manual (step-by-step guided) and Live Camera Coach (on-device pose tracking with real-time rep counting and posture feedback). After completion, captures structured post-session reflection from the handler.

**Session State Machine:**
```
LOADING
  ↓ protocol fetched
INTRO           ← Show exercise title, objective, duration
  ↓ tap "Start"
SETUP           ← Show environment/equipment checklist
  ↓ confirm ready → triggers SessionModePicker overlay
MODE_PICKER     ← Choose Live Camera Coach or Do Normally (local overlay, not store state)
  ↓ select mode
STEP_ACTIVE     ← Show current step card, timer ring, rep counter
                   (Live Camera mode: LiveCoachOverlay replaces manual controls)
  ↓ completeStep() or timer expires
STEP_COMPLETE   ← Show step summary
  ↓ next step or last step
SESSION_REVIEW  ← PostSessionReflectionCard multi-step flow:
                   1. Difficulty selector (easy/okay/hard)
                   2. Dynamic reflection questions (2–4, selected by engine)
                   3. Optional freeform notes
  ↓ submitSession()
COMPLETE        ← Saved to DB, streaks updated, milestones checked
  ↓ navigate back to Today
ABANDONED       ← Logged as abandoned in DB
```

**Local overlay states** (managed outside sessionStore):
- `NONE` — normal session view
- `MODE_PICKER` — `SessionModePicker` component shown after SETUP confirms
- `LIVE_COACHING` — `LiveCoachOverlay` shown during camera-based session

**Session completion flow:**
1. Handler selects difficulty rating (easy/okay/hard) — auto-advances after 180ms
2. Reflection question engine selects 2–4 contextual questions based on session outcome, recent history, and learning state
3. Handler answers questions (non-required questions can be skipped); optional freeform note
4. Calls `sessionManager.saveSession()` with:
   - `difficulty`, `notes`
   - `liveCoachingUsed`, `liveCoachingSummary`, `poseMetrics` (if camera mode used)
   - `postSessionReflection` (structured reflection answers, or null if skipped)
5. `saveSession()` persists to `session_logs`, calls `updateLearningStateFromSessionLog()`, invokes `adapt-plan` Edge Function
6. `updateStreak()` + `checkMilestones()` run non-blocking
7. `refreshPlan()` + `notificationStore.refreshSchedules()` update downstream state
8. `dogStore.fetchDogLearningState()` refreshes coach context

Components:
- `SessionModePicker` — mode selection after SETUP (see §3.5.1)
- `ProgressBar` — steps N of total
- `StepCard` — instruction text, timer mode indicator
- `TimerRing` — circular countdown timer with pause/resume
- `RepCounter` — tap to increment reps (manual mode)
- `LiveCoachOverlay` — camera + pose overlay for Live Camera mode
- `PostSessionReflectionCard` — multi-step post-session reflection UI (see §3.5.2)

##### SessionModePicker (`components/session/SessionModePicker.tsx`)

Presented as a full-screen overlay after the user confirms ready in SETUP state. Allows choosing session execution mode.

```typescript
interface SessionModePickerProps {
  dogName: string
  onNormal: () => void    // proceed with manual mode
  onCamera: () => void    // proceed with live camera mode
  onBack: () => void      // return to SETUP
}
```

UI:
- Two option cards:
  1. **Live Camera Coach** (featured, primary) — "Point your camera at {dogName}. The app tracks posture and counts reps in real time." Feature pills: Auto rep count, Posture feedback, Hands-free. Shows "NEW" badge.
  2. **Do Normally** (secondary, outlined) — "Follow the step-by-step guide and mark reps manually."
- Footer note: "You can switch modes anytime from a session"

##### PostSessionReflectionCard (`components/session/PostSessionReflectionCard.tsx`)

Presented in the `SESSION_REVIEW` state as the primary completion UI. A multi-step form that captures structured handler feedback.

```typescript
interface PostSessionReflectionCardProps {
  dogName: string
  durationLabel: string              // pre-formatted e.g. "3 minutes 45 seconds"
  questions: ReflectionQuestionConfig[]
  answers: PostSessionReflection
  difficulty: 'easy' | 'okay' | 'hard' | null
  notes: string
  onSelectDifficulty: (d: 'easy' | 'okay' | 'hard') => void
  onAnswer: (questionId: ReflectionQuestionId, value: string | number) => void
  onNotesChange: (text: string) => void
  onSubmit: () => void
  isSaving: boolean
  insets: { top: number; bottom: number }
}
```

**Steps:**
1. **Difficulty Step** (always first) — "How did it go?" — Easy / Okay / Hard large button cards with icon, label, subtitle. Selection auto-advances after 180ms.
2. **Question Steps** (1 per selected question) — rendered as `single_select` (chip options) or `scale` (numeric 1–N). Non-required questions show "Optional" badge and Skip button. Helper text shown when grounded in session history. Selection auto-advances after 180ms.
3. **Notes Step** (always last) — large multiline text input, placeholder grounded in context. Submit button; shows "Saving…" while `isSaving`.

**UI Features:**
- Fixed header: back button + "Session complete" badge + `durationLabel`
- Segmented progress bar (one segment per step)
- Animated transitions (slide + opacity: 100ms out, 160ms spring in)
- Safe-area-aware bottom padding

#### AI Coach Screen (`app/(tabs)/coach/index.tsx`)

Purpose: Conversational support grounded in the dog's full context and current learning state.

Components:
- `MessageList` (FlatList) — chat history with role-based styling
- `TypingIndicator` — animated dots while waiting for response
- `QuickSuggestions` — contextual suggestion chips above input
- `MessageInput` — text input with send button
- `FormattedCoachMessage` — renders markdown-formatted coach responses
- Reset button (archive conversation and start fresh)

Calls Supabase Edge Function `ai-coach-message` for each message. Coach context includes the dog's current `DogLearningState` and recent plan adaptations. Handles rate limit errors with `rateLimitError` state flag.

#### Plan Screen (`app/(tabs)/train/plan.tsx`)

Purpose: Show the full training plan with completion status for all sessions.

Components:
- Completion ring (72px circular progress)
- Session list grouped by week
- Session rows: status icon (completed/locked/playable), title, scheduled day/time, duration
- `AdaptationNotice` — shown when the plan has been recently adapted; displays reason from `reasonCode` including reflection-based codes
- "TODAY" badge for today's session
- Tap to navigate to session screen

#### Progress Dashboard (`app/(tabs)/progress/index.tsx`)

Purpose: Show training momentum and behavior improvement over time.

Components:
- Session streak card (flame icon, activity dots for 14 days)
- Walk streak card
- Behavior score cards (4-stage progression per goal)
- Weekly sessions chart (sessions completed per week)
- Walk quality chart (14-day history, 3-point quality scale)
- Milestones carousel (achieved milestones)
- Share card for celebrating milestones

#### Know Tab (`app/(tabs)/know/`)

Purpose: Expert content and video feedback.

Screens:
- `index.tsx` — Education hub landing
- `videos.tsx` — Video library: user-uploaded videos and their expert review status
- `video-player.tsx` — Video playback with expert-added timestamps and feedback

#### Notification Settings Screen (`app/(tabs)/profile/notification-settings.tsx`)

Purpose: Let users control which alerts and reminders they receive.

Controls all 13 `NotificationPrefs` fields:
- Daily reminder (toggle + time picker)
- Walk reminders
- Post-walk check-in
- Streak alerts
- Milestone alerts
- Insights
- Expert review
- Lifecycle alerts
- Weekly summary
- Scheduled session reminders
- Reminder lead time (minutes before session)
- Fallback missed session reminders

Calls `notificationStore.refreshSchedules()` on every preference change.

#### In-App Notification Center (`app/(tabs)/train/notifications.tsx`)

Purpose: Central list of all in-app notifications (plan adaptations, milestones, coach nudges, etc.).

Components:
- `NotificationItem` — individual notification row with icon, title, body, and timestamp
- `NotificationBell` — badge indicator used in screen headers

Notifications are stored in the `in_app_notifications` Supabase table and managed by `notificationStore` (inbox + unread count + realtime subscription).

---

## 4. Backend Services

### 4.1 Supabase Project Structure

All backend logic in v1 runs through Supabase:

| Supabase Feature | Used For |
|---|---|
| PostgreSQL | All relational data |
| Auth | User authentication (email, Apple, Google) |
| Storage | Video and image files (`pawly-videos` bucket) |
| Edge Functions | Plan generation, AI coach calls, plan adaptation, expert review notifications |
| Real-time | Live session sync, notification triggers |
| Row Level Security | Data access control per user |

### 4.2 Edge Functions

Edge functions are Deno-based serverless functions running at the Supabase edge.

#### `generate-adaptive-plan`

Triggered: after onboarding completion or when a new plan is requested
Input: `{ dogId: string, userId: string }`
Process:
1. Fetch dog profile from DB
2. Build training preferences from dog config
3. Fetch skill graph (nodes & edges from DB)
4. Construct AI prompt with dog profile, behavior goals, skill graph, and training constraints
5. Call Claude API to generate `AIPlannerOutput`
6. Compile output into concrete plan with scheduled sessions (server-side schedule engine)
7. Assign dates/times respecting dog's preferred days, windows, and timezone
8. Insert plan record to `plans` table

Output: `{ plan: Plan, plannerMode: 'adaptive_ai' | 'rules_fallback', planningSummary?, fallbackReason? }`

Falls back to rules-based `initialPlanner.ts` if Claude call fails.

#### `adapt-plan`

Triggered: after session completion (invoked by `sessionManager.saveSession()`)
Input: plan ID, session outcome data (includes `post_session_reflection` JSONB)
Process:
1. Fetch session log including `post_session_reflection`
2. Normalize reflection via `normalizePostSessionReflection()`
3. Pass normalized reflection to adaptation engine
4. Runs adaptation engine to check rules — including reflection-based rules (Rules A–G signals)
5. Generates adaptations with `reasonCode` (may be `reflection_*` prefixed)
6. Compiles plan updates and writes audit record

Output: updated plan with adaptation audit record; reason codes may reference reflection signals (e.g., `reflection_understanding_gap`, `reflection_distraction_blocker`, `reflection_duration_breakdown`, `reflection_over_arousal`, `reflection_handler_friction`)

#### `ai-coach-message`

Triggered: user sends message in coach chat
Input: message content, conversation history, dog context (including `DogLearningState`)
Process: assemble system prompt with full dog context → call Anthropic API → store response
Output: assistant message stored and returned to client (with rich markdown formatting)

#### `complete-expert-review`

Triggered: admin marks a video review as complete
Input: review ID, trainer feedback, timestamps
Process: updates `expert_reviews` record to `complete` status
Output: triggers push notification to user

#### `notify-expert-review`

Triggered: expert review submission or status transition
Input: review ID, user ID
Process: creates expert_review record; sends email to trainer queue via Resend API; sends push notification to user device via Expo Push Service
Output: notification delivered

### 4.3 Real-time Subscriptions

Mobile clients subscribe to relevant Supabase real-time channels:

| Channel | Table | Event | Mobile Action |
|---|---|---|---|
| `dog-updates` | dogs | UPDATE | Refresh dog store |
| `plan-updates` | plans | UPDATE | Refresh plan store |
| `new-insight` | insights | INSERT | Show insight badge |
| `session-sync` | session_logs | INSERT | Update progress charts |
| in-app notifications | in_app_notifications | INSERT | Update notificationStore inbox + badge count |

---

## 5. Database Schema

### 5.1 Core Tables

Applied via Supabase migrations in `supabase/migrations/`. Migration files (in order):
- `pr03_dog_profile.sql` — dogs table
- `pr04_protocols.sql` — exercises and protocols
- `pr05_session_logs.sql` — session completion logging
- `pr06_coach.sql` — coach conversations and messages
- `pr07_progress.sql` — streaks, walk_logs, walk_streaks, milestones
- `pr08_videos.sql` — videos, expert_reviews, review_credits
- `pr09_coach_conversation_active_unique.sql` — coach conversation constraints
- `pr10_schedule_preferences.sql` — notification_prefs on user_profiles
- `pr11_adaptive_planning_foundation.sql` — skill_nodes and skill_edges foundation tables
- `pr11_seed_skill_graph.sql` — initial skill graph data seed
- `pr12_full_skill_graph.sql` — complete skill graph for all supported behaviors
- `pr13_learning_state_signals.sql` — dog_learning_state and learning_signals tables
- `pr14_plan_adaptation_flow.sql` — plan_adaptations and adaptation_audit tables
- `pr15_in_app_notifications.sql` — in_app_notifications table
- `pr16_live_pose_coaching.sql` — live_coaching_summary and pose_metrics columns on session_logs
- `pr17_post_session_reflection.sql` — post_session_reflection column on session_logs

#### `users` (managed by Supabase Auth + `user_profiles` table)

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
  onboarding_completed_at TIMESTAMPTZ
);

-- user_profiles (extended user data including notification preferences)
CREATE TABLE user_profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id),
  notification_prefs JSONB DEFAULT '{}',
  push_token       TEXT,
  -- additional profile fields
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
  -- Schedule preferences (stored as JSONB)
  preferred_days        TEXT[] DEFAULT '{}',
  preferred_windows     TEXT[] DEFAULT '{}',
  exact_times           JSONB DEFAULT '{}',
  walk_times            JSONB DEFAULT '{}',
  schedule_flexibility  TEXT DEFAULT 'move_tomorrow',
  schedule_intensity    TEXT DEFAULT 'balanced',
  session_style         TEXT DEFAULT 'balanced',
  timezone              TEXT DEFAULT 'UTC',
  personality_profile   JSONB DEFAULT '{}',
  lifecycle_stage       TEXT DEFAULT 'puppy',
  avatar_url            TEXT
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
  -- sessions stored as JSONB array of PlanSession objects
  sessions         JSONB DEFAULT '[]',
  metadata         JSONB DEFAULT '{}'  -- includes schedule explanation, preferred days/windows, AI planning summary
);
```

**PlanSession JSONB structure:**
```typescript
interface PlanSession {
  id: string
  exerciseId: string
  weekNumber: number
  dayNumber: number
  title: string
  durationMinutes: number
  isCompleted: boolean
  scheduledDay?: Weekday
  scheduledTime?: string         // "HH:MM"
  scheduledDate?: string         // "YYYY-MM-DD"
  isReschedulable?: boolean
  autoRescheduledFrom?: string   // original date if rescheduled
  schedulingReason?: string
  isMissed?: boolean
  skillId?: string
  parentSkillId?: string
  environment?: PlanEnvironment
  sessionKind?: 'core' | 'repeat' | 'proofing'
  adaptationSource?: 'initial_plan' | 'adaptation_engine'
  reasoningLabel?: string | null
  insertedByAdaptation?: boolean       // true if session was inserted by adaptation engine
  supportSessionType?: SupportSessionType | null  // 'foundation' | 'transition' | 'duration_building' | 'calm_reset'
  insertionReasonCode?: string | null  // reason code from adaptation that created this session
}
```

#### `session_logs`

```sql
CREATE TABLE session_logs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES users(id) NOT NULL,
  dog_id                UUID REFERENCES dogs(id) NOT NULL,
  plan_id               UUID REFERENCES plans(id),
  plan_session_id       TEXT,           -- references PlanSession.id
  exercise_id           TEXT NOT NULL,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  completed_at          TIMESTAMPTZ,
  duration_seconds      INTEGER,
  success_score         INTEGER CHECK (success_score BETWEEN 1 AND 5),
  difficulty            TEXT CHECK (difficulty IN ('easy', 'okay', 'hard')),
  notes                 TEXT,
  step_results          JSONB DEFAULT '[]',
  abandoned             BOOLEAN DEFAULT FALSE,
  -- Live coaching fields (added in pr16)
  live_coaching_used    BOOLEAN DEFAULT FALSE,
  live_coaching_summary JSONB,   -- LiveCoachingSummary: mode, targetPostures, successCount, resetCount, avgTrackingQuality, assessment
  pose_metrics          JSONB,   -- PoseMetrics: detailed keypoint confidence, hold durations, tracking events, quality breakdown
  -- Post-session reflection (added in pr17)
  post_session_reflection JSONB  -- PostSessionReflection | null; null if handler skipped
);
```

**LiveCoachingSummary JSONB structure:**
```typescript
interface LiveCoachingSummary {
  mode: string
  targetPostures: string[]
  successCount: number
  resetCount: number
  avgTrackingQuality: number
  assessment: string
}
```

**PoseMetrics JSONB structure:**
```typescript
interface PoseMetrics {
  keypointConfidence: Record<string, number>
  qualityBreakdown: { good: number; fair: number; poor: number }
  postureDurations: Record<string, number>
  holdDurations: number[]
  trackingEvents: { type: string; timestamp: number }[]
}
```

**PostSessionReflection JSONB structure:**
```typescript
interface PostSessionReflection {
  overallExpectation: 'better_than_expected' | 'as_expected' | 'worse_than_expected' | null
  mainIssue: 'did_not_understand' | 'broke_position' | 'distracted' | 'over_excited' | 'tired_done' | 'handler_inconsistent' | 'no_major_issue' | null
  failureTiming: 'immediately' | 'midway' | 'near_end' | 'never_stabilized' | null
  distractionType: 'dogs' | 'people' | 'smells' | 'noise_movement' | 'other' | null
  cueUnderstanding: 'yes' | 'not_yet' | 'unsure' | null
  arousalLevel: 'calm' | 'slightly_up' | 'very_up' | null
  handlerIssue: 'timing_rewards' | 'cue_consistency' | 'leash_setup' | 'session_focus' | 'other' | null
  confidenceInAnswers: 1 | 2 | 3 | 4 | 5 | null
  freeformNote: string | null  // max 2000 chars
}
```

Null values mean the question was not asked or handler skipped it. A null `post_session_reflection` column means the reflection was skipped entirely. Validated and normalized by `reflectionNormalizer.ts` before use in the adaptation engine.

#### `walk_logs`

```sql
CREATE TABLE walk_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) NOT NULL,
  dog_id        UUID REFERENCES dogs(id) NOT NULL,
  logged_at     TIMESTAMPTZ DEFAULT NOW(),
  quality       INTEGER CHECK (quality BETWEEN 1 AND 3),  -- 1=rough, 2=okay, 3=great
  goal_achieved BOOLEAN,
  notes         TEXT,
  duration_minutes INTEGER
);
```

#### `streaks`

```sql
CREATE TABLE streaks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) NOT NULL,
  dog_id           UUID REFERENCES dogs(id) NOT NULL,
  current_streak   INTEGER DEFAULT 0,
  longest_streak   INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE walk_streaks (
  -- same structure as streaks, for walk activity
);
```

#### `milestones`

```sql
CREATE TABLE milestones (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id       UUID REFERENCES dogs(id) NOT NULL,
  user_id      UUID REFERENCES users(id) NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  milestone_id TEXT NOT NULL,   -- references MILESTONE_DEFINITIONS[].id
  title        TEXT NOT NULL,
  description  TEXT,
  emoji        TEXT,
  achieved_at  TIMESTAMPTZ DEFAULT NOW()
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
  thumbnail_path    TEXT,
  duration_seconds  INTEGER,
  context           TEXT CHECK (context IN ('onboarding', 'session', 'behavior')),
  behavior_context  TEXT,
  before_context    TEXT,
  goal_context      TEXT,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'complete', 'failed')),
  uploaded_at       TIMESTAMPTZ DEFAULT NOW()
);
```

#### `expert_reviews`

```sql
CREATE TABLE expert_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id        UUID REFERENCES videos(id) NOT NULL,
  user_id         UUID REFERENCES users(id) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  trainer_name    TEXT,
  trainer_photo_url TEXT,
  status          TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'in_review', 'complete')),
  feedback        TEXT,
  timestamps      JSONB DEFAULT '[]',  -- array of { time, note }
  requested_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE review_credits (
  user_id           UUID REFERENCES users(id) PRIMARY KEY,
  credits_remaining INTEGER DEFAULT 0
);
```

#### `coach_conversations` and `coach_messages`

```sql
CREATE TABLE coach_conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) NOT NULL,
  dog_id     UUID REFERENCES dogs(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active  BOOLEAN DEFAULT TRUE,
  UNIQUE (user_id, dog_id, is_active)  -- enforced by pr09 migration
);

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

#### `skill_nodes` and `skill_edges` (adaptive planning foundation)

```sql
CREATE TABLE skill_nodes (
  id          TEXT PRIMARY KEY,       -- e.g., 'llw_foundation_1'
  behavior    TEXT NOT NULL,           -- behavior goal this skill belongs to
  skill_code  TEXT NOT NULL,
  stage       TEXT NOT NULL,           -- 'foundation', 'building', 'proofing', 'mastery'
  title       TEXT NOT NULL,
  description TEXT,
  kind        TEXT NOT NULL,           -- 'foundation' | 'core' | 'proofing' | 'recovery' | 'diagnostic'
  difficulty  INTEGER,
  protocol_id TEXT,
  metadata    JSONB DEFAULT '{}',
  is_active   BOOLEAN DEFAULT TRUE
);

CREATE TABLE skill_edges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_skill_id TEXT REFERENCES skill_nodes(id),
  to_skill_id   TEXT REFERENCES skill_nodes(id),
  edge_type   TEXT NOT NULL,           -- 'prerequisite' | 'advance' | 'regress' | 'detour' | 'proofing'
  condition_summary TEXT,
  metadata    JSONB DEFAULT '{}'
);
```

#### `dog_learning_state` and `learning_signals`

```sql
CREATE TABLE dog_learning_state (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id                 UUID REFERENCES dogs(id) NOT NULL UNIQUE,
  updated_at             TIMESTAMPTZ DEFAULT NOW(),
  version                INTEGER DEFAULT 1,
  motivation_score       DECIMAL,
  distraction_sensitivity DECIMAL,
  confidence_score       DECIMAL,
  impulse_control_score  DECIMAL,
  handler_consistency_score DECIMAL,
  fatigue_risk_score     DECIMAL,
  recovery_speed_score   DECIMAL,
  environment_confidence JSONB DEFAULT '{}',  -- per-environment confidence scores
  behavior_signals       JSONB DEFAULT '{}',
  recent_trends          JSONB DEFAULT '{}',
  current_hypotheses     JSONB DEFAULT '[]',  -- LearningHypothesis[]
  last_evaluated_at      TIMESTAMPTZ
);

CREATE TABLE learning_signals (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id     UUID REFERENCES dogs(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  source     TEXT NOT NULL,    -- 'session_log', 'walk_log', 'manual'
  signal     JSONB NOT NULL
);
```

**DogLearningState dimensions** (7 scored dimensions):
- `motivationScore` — responsiveness to rewards
- `distractionSensitivity` — reaction to environmental stimuli
- `confidenceScore` — willingness to attempt behaviors
- `impulseControlScore` — ability to inhibit responses
- `handlerConsistencyScore` — consistency of handler cues
- `fatigueRiskScore` — likelihood of mental/physical fatigue
- `recoverySpeedScore` — ability to recover after errors

**Learning signals include reflection-derived signals** (when `post_session_reflection` is present):
- `understandingIssue` (0–1, confidence-weighted) — cue comprehension problems
- `distractionIssue` (0–1, confidence-weighted) — environmental distraction impact
- `durationBreakdownIssue` (0–1, confidence-weighted) — session length issues
- `arousalIssue` (0–1, confidence-weighted) — over-arousal during session
- `handlerFrictionIssue` (0–1, confidence-weighted) — handler technique inconsistency
- `reflectionConfidence` (0–1, raw) — handler's reported confidence in their own answers

Each signal is weighted by the handler's `confidenceInAnswers` rating (1–5 → 0–1 scale) before being incorporated into learning state updates.

#### `plan_adaptations` and `adaptation_audit`

```sql
CREATE TABLE plan_adaptations (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id                  UUID REFERENCES plans(id) NOT NULL,
  dog_id                   UUID REFERENCES dogs(id) NOT NULL,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  adaptation_type          TEXT NOT NULL,   -- AdaptationType enum
  status                   TEXT DEFAULT 'pending',  -- 'applied', 'skipped', 'rolled_back'
  reason_code              TEXT,
  reason_summary           TEXT,
  evidence                 JSONB,
  previous_snapshot        JSONB,           -- snapshot of plan before adaptation
  new_snapshot             JSONB,           -- snapshot of plan after adaptation
  changed_session_ids      TEXT[],
  changed_fields           TEXT[],
  triggered_by_session_log_id UUID,
  model_name               TEXT,
  latency_ms               INTEGER,
  was_user_visible         BOOLEAN DEFAULT FALSE,
  applied_at               TIMESTAMPTZ
);

CREATE TABLE adaptation_audit (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adaptation_id  UUID REFERENCES plan_adaptations(id),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  actor          TEXT,   -- 'system', 'user', 'coach'
  action         TEXT,
  notes          TEXT
);
```

#### `in_app_notifications`

```sql
CREATE TABLE in_app_notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) NOT NULL,
  dog_id     UUID REFERENCES dogs(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT,
  data       JSONB DEFAULT '{}',
  read_at    TIMESTAMPTZ
);
```

#### `protocols` (content table)

```sql
CREATE TABLE protocols (
  id               TEXT PRIMARY KEY,
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
  difficulty       INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  next_protocol_id TEXT,
  regression_protocol_id TEXT,
  version          INTEGER DEFAULT 1
);
```

### 5.2 Row Level Security Policies

All tables have RLS enabled. Key policies:

```sql
-- Users can only read/write their own data
CREATE POLICY "Users own their data" ON dogs
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Users own their session logs" ON session_logs
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users own their conversations" ON coach_conversations
  FOR ALL USING (user_id = auth.uid());

-- Protocols are readable by all authenticated users
CREATE POLICY "Protocols are public to authenticated users" ON protocols
  FOR SELECT USING (auth.role() = 'authenticated');
```

### 5.3 Indexes

```sql
CREATE INDEX idx_session_logs_dog_id ON session_logs(dog_id);
CREATE INDEX idx_session_logs_created_at ON session_logs(created_at DESC);
CREATE INDEX idx_walk_logs_dog_id_logged_at ON walk_logs(dog_id, logged_at DESC);
CREATE INDEX idx_coach_messages_conversation_id ON coach_messages(conversation_id);
CREATE INDEX idx_videos_dog_id ON videos(dog_id);
CREATE INDEX idx_milestones_dog_id ON milestones(dog_id, achieved_at DESC);
CREATE INDEX idx_in_app_notifications_user_id ON in_app_notifications(user_id, created_at DESC);
CREATE INDEX idx_plan_adaptations_plan_id ON plan_adaptations(plan_id);
CREATE INDEX idx_learning_signals_dog_id ON learning_signals(dog_id, created_at DESC);
```

---

## 6. AI & ML Systems

### 6.1 AI Coach — Full Architecture

The AI coach is a conversational system powered by the Anthropic Claude API, grounded in the user's dog profile, training history, learning state, and trainer-authored protocol knowledge.

#### Context Assembly Pipeline

Every message sent to Claude is preceded by context assembly in the `ai-coach-message` Edge Function:

```typescript
async function assembleCoachContext(
  userId: string,
  dogId: string,
  conversationId: string
): Promise<CoachContext> {
  const dog = await fetchDog(dogId)
  const plan = await fetchActivePlan(dogId)
  const recentSessions = await fetchRecentSessions(dogId, 7)  // last 7 days
  const recentWalks = await fetchRecentWalks(dogId, 7)
  const history = await fetchConversationHistory(conversationId, 20)  // last 20 msgs
  const learningState = await fetchDogLearningState(dogId)
  const relevantProtocols = await retrieveRelevantProtocols(
    dog.behavior_goals,
    plan?.goal
  )

  return { dog, plan, recentSessions, recentWalks, history, learningState, relevantProtocols }
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
...

## Current Training Focus
Goal: {{plan.goal}}
Week {{plan.current_week}} of {{plan.duration_weeks}}
...

## Dog's Learning State
Overall progress: {{learningState.overall_score}}
...

## Recent Activity (Last 7 Days)
Sessions completed: {{session_count}}
Average success score: {{avg_success_score}}
...

## Your Guidelines
- Always address {{dog.name}} by name
- Never diagnose medical conditions — refer to vet
- Never recommend aversive, punishment-based, or dominance methods
- For severe aggression / bite history → strongly recommend in-person behaviorist
- Keep responses concise and actionable
- Always end advice with one clear next action
```

#### API Configuration

```typescript
const COACH_CONFIG = {
  model: 'claude-sonnet-4-6',
  max_tokens: 600,
}
```

### 6.2 Adaptive Plan Generation Engine

Plan generation is AI-driven via the `generate-adaptive-plan` Edge Function, with a rules-based fallback.

**Supported behavior goals** (8 total):
- `leash_pulling` — Loose Leash Walking
- `jumping_up` — Calm Greetings
- `barking` — Barking & Settling
- `recall` — Reliable Recall
- `potty_training` — Potty Training
- `crate_anxiety` — Crate Training
- `puppy_biting` — Puppy Biting
- `settling` — Calm Settling

**AI Planning flow:**
1. Dog profile + skill graph → AI prompt
2. Claude generates `AIPlannerOutput` (ordered skill selections + reasoning)
3. `planCompiler.ts` maps AI output to concrete `PlanSession[]`
4. `scheduleEngine.buildWeeklySchedule()` assigns dates/times based on dog preferences
5. Result stored in `plans.sessions` JSONB

**AIPlannerOutput structure:**
```typescript
interface AIPlannerOutput {
  primaryGoal: string
  startingSkillId: string
  planHorizonWeeks: number
  sessionsPerWeek: number
  weeklyStructure: AIWeekStructure[]
  planningSummary: {
    whyThisStart: string
    keyAssumptions: string[]
    risksToWatch: string[]
  }
}

interface AIWeekStructure {
  weekNumber: number
  focus: string
  skillSequence: AISkillSelection[]
}

interface AISkillSelection {
  skillId: string
  sessionCount: number
  environment: PlanEnvironment
  sessionKind: 'core' | 'repeat' | 'proofing'
  reasoningLabel: string
}

type PlanEnvironment =
  | 'indoors_low_distraction'
  | 'indoors_moderate_distraction'
  | 'outdoors_low_distraction'
  | 'outdoors_moderate_distraction'
  | 'outdoors_high_distraction'
```

**Rules-based fallback** (`lib/adaptivePlanning/initialPlanner.ts`): Used when Claude API call fails. Each goal maps to 6–8 protocol IDs cycled based on `sessionsPerWeek` and `durationWeeks`.

**Schedule engine** (`lib/scheduleEngine.ts`):
- `chooseTrainingDays()` — selects training days from user preferences
- `chooseTimeForDay()` — assigns time based on preferred windows or exact times
- `buildWeeklySchedule()` — generates full week schedule with `PlanSession` objects
- `rescheduleMissedSession()` — moves a missed session to the next available slot
- `getMissedScheduledSessions()` — identifies sessions past their scheduled date that were not completed
- `getTodaySession()` — returns the `PlanSession` scheduled for today

### 6.3 Adaptive Planning Engine (`lib/adaptivePlanning/`)

An on-device engine that monitors training outcomes and adapts the active plan. In PR17 this engine was extended to incorporate structured post-session reflections as first-class signals.

**Learning State System:**
- `learningSignals.ts` — extracts signals from `session_logs` (including `post_session_reflection`), `walk_logs`
- `learningStateEngine.ts` — processes signals to update `DogLearningState`; invokes reflection signal extraction when `post_session_reflection` is present
- `learningStateScoring.ts` — scores 7 dimensions: motivation, distraction sensitivity, confidence, impulse control, handler consistency, fatigue risk, recovery speed
- `learningStateSummary.ts` — generates human-readable learning state summary
- `hypothesisEngine.ts` — generates learning hypotheses from patterns; incorporates reflection evidence

**Adaptation Engine:**
- `adaptationRules.ts` — defines triggers and candidate scoring, including reflection-based rules:
  - Repeated hard/abandoned sessions → regress; consistent easy sessions with high scores → advance
  - `understandingIssue` signal above threshold → regress to foundation
  - `distractionIssue` signal → lower environment difficulty
  - `arousalIssue` signal → simplify and shorten sessions
  - `handlerFrictionIssue` signal → conservative adjustments
- `adaptationEngine.ts` — evaluates rules against current learning state and reflection signals, selects adaptation candidate
- `adaptationCompiler.ts` — converts adaptation decisions into plan mutations (rewrites session fields; may insert support sessions with `insertedByAdaptation: true`)
- `adaptationAudit.ts` — writes audit trail to `adaptation_audit` table with snapshots and evidence

**Skill Graph:**
- `skillGraph.ts` — directed graph of skills with prerequisite/progression/regression/detour edges
- `graphTraversal.ts` — pathfinding for next/previous/detour skill recommendations
- Stored in `skill_nodes` and `skill_edges` tables (seeded in pr11–pr12 migrations)

**Adaptation Types** (`AdaptationType`):
- `repeat` — repeat current skill level with more sessions
- `regress` — move back to an easier protocol
- `advance` — move forward to a harder protocol
- `detour` — substitute a parallel skill path
- `difficulty_adjustment` — adjust within-session difficulty parameters
- `schedule_adjustment` — reschedule sessions without changing content
- `environment_adjustment` — modify environment-related session parameters

**Adaptation Reason Codes:**
Standard codes:
- `low_success_score`, `high_difficulty_reports`, `consistent_easy`, `consecutive_abandons`

Reflection-derived codes (PR17):
- `reflection_understanding_gap` — handler reported cue comprehension issues
- `reflection_distraction_blocker` — handler reported environment too challenging
- `reflection_duration_breakdown` — handler reported session length issues
- `reflection_over_arousal` — handler reported dog was over-aroused
- `reflection_handler_friction` — handler reported handler technique inconsistency

**Support Sessions** (PR17): The adaptation compiler may insert additional support sessions into the plan with:
- `insertedByAdaptation: true`
- `supportSessionType`: `'foundation' | 'transition' | 'duration_building' | 'calm_reset'`
- `insertionReasonCode`: the reason code that triggered insertion

**Adaptation Status** (`AdaptationStatus`):
- `applied` — adaptation was applied to the plan
- `skipped` — adaptation was evaluated but not applied
- `rolled_back` — applied adaptation was subsequently reversed

### 6.4 Post-Session Reflection System (`lib/adaptivePlanning/reflectionQuestion*`)

A structured feedback capture system that asks handlers 2–4 targeted questions after each session. Answers are saved with the session log and used as training signals for the adaptive planning engine.

#### Question Selection Engine (`reflectionQuestionEngine.ts`)

```typescript
function buildPostSessionReflectionQuestions(
  input: ReflectionQuestionEngineInput
): ReflectionQuestionConfig[]
```

**Engine Input:**
```typescript
interface ReflectionQuestionEngineInput {
  difficulty: 'easy' | 'okay' | 'hard'
  sessionStatus: 'completed' | 'abandoned'
  durationSeconds?: number | null
  protocolId?: string
  skillId?: string
  environmentTag?: string
  recentSessions: RecentSessionSummary[]    // last 3–5 sessions
  learningState: ReflectionLearningStateSnapshot | null
}

interface ReflectionLearningStateSnapshot {
  distractionSensitivity: number
  handlerConsistencyScore: number
  confidenceScore: number
  inconsistencyIndex?: number | null  // 0–1
}
```

**Selection Rules (A–G):**
- **Rule A (Core):** Always ask `overallExpectation`. Skip `mainIssue` only for clean easy sessions.
- **Rule B (Failure Timing):** Ask `failureTiming` when session was hard or abandoned.
- **Rule C (Distraction):** Ask `distractionType` when environment inconsistency detected or `distractionSensitivity >= 4`.
- **Rule D (Cue Understanding):** Ask `cueUnderstanding` when failure appears early or repeated low-success on skill.
- **Rule E (Arousal):** Ask `arousalLevel` when 3+ recent sessions abandoned/hard (over-excitement pattern).
- **Rule F (Handler Issue):** Ask `handlerIssue` when `handlerConsistencyScore <= 2` or `inconsistencyIndex >= 0.35`.
- **Rule G (Confidence):** Ask `confidenceInAnswers` when session abandoned OR mixed recent signals.

Output: 2–4 questions max (required + at most 3 follow-ups). Helper text grounded in concrete session history when available.

#### Question Catalog (`reflectionQuestionCatalog.ts`)

8 pre-defined question configs exported:
- `OVERALL_EXPECTATION_QUESTION` — required, single_select (3 options)
- `MAIN_ISSUE_QUESTION` — required, single_select (7 options including "no major issue")
- `FAILURE_TIMING_QUESTION` — optional, single_select (4 options)
- `DISTRACTION_TYPE_QUESTION` — optional, single_select (5 options)
- `CUE_UNDERSTANDING_QUESTION` — optional, single_select (3 options)
- `AROUSAL_LEVEL_QUESTION` — optional, single_select (3 options)
- `HANDLER_ISSUE_QUESTION` — optional, single_select (5 options)
- `CONFIDENCE_IN_ANSWERS_QUESTION` — optional, scale 1–5

#### Normalization (`reflectionNormalizer.ts`)

```typescript
function normalizePostSessionReflection(
  raw: unknown
): PostSessionReflection | null
```

- Shared between mobile app and Edge Function (no platform-specific imports)
- Accepts raw DB JSONB (any type)
- Returns `null` if input is null/undefined/not an object
- Validates each enum field against known values; unknown values become `null`
- Validates `confidenceInAnswers` is 1–5 range
- Validates `freeformNote` length ≤ 2000 chars
- Never throws; safe to call from Edge Functions

#### Answer Helpers (`lib/reflectionAnswerHelpers.ts`)

Pure functions, no React Native imports; testable with bare Node.js:

```typescript
function getAnswerValue(
  answers: PostSessionReflection,
  questionId: ReflectionQuestionId
): string | number | null

function applyReflectionAnswer(
  current: PostSessionReflection,
  questionId: ReflectionQuestionId,
  value: string | number
): PostSessionReflection  // immutable update

function areRequiredQuestionsAnswered(
  questions: ReflectionQuestionConfig[],
  answers: PostSessionReflection
): boolean

function makeEmptyReflection(): PostSessionReflection  // all fields null
```

#### Reflection Signal Extraction (`learningSignals.ts`)

When `post_session_reflection` is present on a session log:

```typescript
interface ReflectionSignals {
  understandingIssue: number    // 0–1, confidence-weighted
  distractionIssue: number      // 0–1, confidence-weighted
  durationBreakdownIssue: number // 0–1, confidence-weighted
  arousalIssue: number          // 0–1, confidence-weighted
  handlerFrictionIssue: number  // 0–1, confidence-weighted
  reflectionConfidence: number  // 0–1, raw (from confidenceInAnswers)
}
```

Signal derivation examples:
- `overallExpectation === 'worse_than_expected'` → negative signal across all dimensions
- `mainIssue === 'distracted'` → `distractionIssue += confidence`
- `failureTiming === 'immediately'` → `understandingIssue += confidence`
- `arousalLevel === 'very_up'` → `arousalIssue += confidence`
- `handlerIssue !== null` → `handlerFrictionIssue += confidence`

### 6.5 Progress Adaptation Engine

Adjusts session difficulty recommendations based on recent outcomes:

```typescript
function computeNextSessionDifficulty(
  currentProtocol: Protocol,
  recentSessions: SessionLog[]
): 'regress' | 'maintain' | 'advance' {
  const last3 = recentSessions.slice(-3)
  if (last3.length < 2) return 'maintain'

  const avgScore = average(last3.map(s => s.success_score))
  const allEasy = last3.every(s => s.difficulty === 'easy')
  const consecutiveHard = last3.every(s => s.difficulty === 'hard')

  if (avgScore >= 4 && allEasy) return 'advance'
  if (avgScore <= 2 || consecutiveHard) return 'regress'
  return 'maintain'
}
```

### 6.6 Milestone Engine (`lib/milestoneEngine.ts`)

13 milestone definitions, each with a `checkFn` that receives `MilestoneCheckData`:

| Milestone ID | Title | Trigger |
|---|---|---|
| `first_session` | First Session Complete | 1 total session |
| `streak_3` | 3-Day Streak | 3 consecutive session days |
| `streak_7` | 7-Day Streak | 7 consecutive session days |
| `streak_14` | 2-Week Warrior | 14-day streak |
| `streak_30` | 30-Day Champion | 30-day streak |
| `sessions_10` | 10 Sessions | 10 total sessions |
| `sessions_25` | 25 Sessions | 25 total sessions |
| `sessions_50` | 50 Sessions | 50 total sessions |
| `stage_advance` | Stage Unlocked | Plan advances to next stage |
| `walk_streak_5` | 5-Day Walk Streak | 5 consecutive walk days |
| `walk_streak_14` | 2-Week Walker | 14-day walk streak |
| `walk_improvement` | Walk Quality Rising | Improving walk quality trend |
| `first_video` | First Video Uploaded | 1 video uploaded |

### 6.7 On-Device Dog Pose Detection

Real-time pose estimation runs on-device using a TFLite model, used by the Live Camera Coach session mode for rep counting and posture feedback.

#### Architecture

```
Camera Frame (Vision Camera v4)
    ↓
Frame Processor (JS Worklet, every 10th frame)
    ↓
vision-camera-resize-plugin (640×640 RGB float32)
    ↓
react-native-fast-tflite (sync inference)
    ↓
poseDecoder.ts (D-first tensor layout)
    ↓
PoseObservation { keypoints: PoseKeypoint[], bbox: NormalizedBBox }
    ↓
poseOutlierRejection.ts (filter outliers)
    ↓
poseStabilizer.ts (One-Euro filter smoothing)
    ↓
poseFeatureExtractor.ts (geometric features)
    ↓
postureClassifier.ts → PostureLabel (sit / down / stand / unknown)
    ↓
poseStateMachine.ts (posture transition state machine)
    ↓
poseTrackingQuality.ts → TrackingQuality (good / fair / poor)
    ↓
poseEventDetector.ts (motion/tracking events)
    ↓
liveCoachingEngine.ts (rep counting + posture feedback state machine)
    ↓
CoachingDecision { state, message, cue, incrementRep, holdTimerMs, ... }
    ↓
LiveCoachOverlay (UI feedback to user)
```

#### Model I/O

- **Input:** `[1, 640, 640, 3]` float32 RGB tensor
- **Output:** `[1, 77, 8400]` D-first tensor layout
  - `d[0–3]`: bounding box (cx, cy, w, h) normalized [0, 1]
  - `d[4]`: detection confidence
  - `d[5–76]`: 24 keypoints × 3 values each (x, y, visibility)
- **Thresholds:** detection confidence ≥ 0.35, keypoint visibility ≥ 0.35

#### Keypoints (24 canonical dog keypoints)

Defined in `types/pose.ts` as `DOG_KEYPOINT_NAMES`:
- Head: nose, chin, left/right eye, left/right ear
- Torso: throat, withers, tail base, back center
- Front legs: left/right shoulder, elbow, wrist, front paw
- Rear legs: left/right hip, knee, ankle, rear paw

#### Skeleton Visualization (`components/vision/DogKeypointOverlay.tsx`)

SVG overlay rendered atop the camera preview. Color-coded limb groups:
- **Blue** — head connections (eyes, ears, nose, throat)
- **Gold** — spine connections (withers, back, tail)
- **Green** — front-left leg
- **Purple** — front-right leg
- **Pink** — rear-left leg
- **Orange** — rear-right leg

Dual-pass rendering: glow stroke + core stroke per bone, with joint dots and specular highlights.

#### `usePoseSession` hook (`hooks/usePoseSession.ts`)

```typescript
function usePoseSession(options: PoseSessionOptions): {
  frameProcessor: FrameProcessor
  currentPose: PoseObservation | null
  fps: number
  isDetecting: boolean
}
```

Runs at ~10 FPS (throttled, every 10th frame). Module-level dispatch pattern for worklet-to-React communication. Requires native dev build (not Expo Go).

#### `useLiveCoachingSession` hook (`hooks/useLiveCoachingSession.ts`)

Manages the live coaching session lifecycle:
- Creates and drives the `liveCoachingEngine` with pose frames
- Aggregates `CoachingSessionMetrics` over the session duration
- Exposes current `CoachingDecision` to the `LiveCoachOverlay`
- On session end, returns `CoachingSessionMetrics` for storage in `session_logs`

#### Live Coaching Engine (`lib/liveCoach/`)

State machine with the following states:
- `waiting` — no dog detected or pose not ready
- `hold_in_progress` — dog in target posture, counting hold duration
- `good_rep` — successful rep completed (displayed briefly)
- `reset` — dog broke posture (displayed briefly)
- `lost_tracking` — tracking quality too low
- `complete` — required reps reached

Per-frame processing:
```typescript
interface CoachingFrameInput {
  postureState: PostureLabel
  poseEvents: PoseEvent[]
  trackingQuality: TrackingQuality
  postureConfidence: number
  elapsedSessionMs: number
  timestamp: number
}

interface CoachingDecision {
  state: CoachingEngineState
  message: string
  cue: string
  incrementRep: boolean
  markSuccess: boolean
  activePosture: PostureLabel
  holdTimerMs: number
  targetHoldMs: number
  trackingBlocked: boolean
  repCount: number
  requiredReps: number
}
```

#### Pose Debug Screen (`app/(tabs)/train/pose-debug.tsx` + `pose-debug-impl.tsx`)

Developer-only full-screen camera view with:
- Real-time skeleton overlay
- FPS counter
- Detection confidence bar
- Scanning pulse animation

### 6.8 Insight Generation

Weekly cron job generates personalized insights per dog using Claude (`generate-insights` Edge Function). Insights expire after 7 days. (Not yet displayed in-app; Know tab does not yet surface insights.)

---

## 7. API Specification

### 7.1 API Design Principles

- RESTful endpoints via Supabase auto-generated PostgREST API + custom Edge Functions
- All requests authenticated via JWT from Supabase Auth
- ISO 8601 timestamps throughout
- Snake_case field naming in DB; camelCase in TypeScript (converted by `lib/modelMappers.ts`)

### 7.2 Key Endpoints

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
POST   /functions/v1/generate-adaptive-plan   Generate AI-powered personalized plan
POST   /functions/v1/adapt-plan               Trigger plan adaptation (accepts post_session_reflection)
GET    /rest/v1/plans?dog_id=eq.{id}          Get dog's plans
PATCH  /rest/v1/plans?id=eq.{id}              Update plan (sessions JSONB, status)
```

#### Sessions
```
GET    /rest/v1/protocols?id=eq.{id}         Fetch session protocol
POST   /rest/v1/session_logs                 Log completed session (includes live coaching fields + post_session_reflection)
GET    /rest/v1/session_logs?dog_id=eq.{id}  Session history
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
POST   /storage/v1/object/pawly-videos/{path}  Upload video
GET    /rest/v1/videos?dog_id=eq.{id}          Video library
```

#### Progress
```
GET    /rest/v1/streaks?dog_id=eq.{id}       Streak data
GET    /rest/v1/walk_logs?dog_id=eq.{id}     Walk history
GET    /rest/v1/milestones?dog_id=eq.{id}    Milestones list
```

#### Adaptive Planning
```
GET    /rest/v1/dog_learning_state?dog_id=eq.{id}   Dog learning state
GET    /rest/v1/plan_adaptations?plan_id=eq.{id}    Plan adaptation history
GET    /rest/v1/skill_nodes                          Skill graph nodes
GET    /rest/v1/skill_edges                          Skill graph edges
```

#### Notifications
```
PATCH  /rest/v1/user_profiles?id=eq.{id}              Update notification_prefs JSONB
GET    /rest/v1/in_app_notifications?user_id=eq.{id}  Fetch in-app notifications
PATCH  /rest/v1/in_app_notifications?id=eq.{id}       Mark notification as read
```

### 7.3 Rate Limiting

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
User enters email + password (or taps Apple/Google)
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
- Apple Sign In (required for iOS App Store; implemented via `expo-apple-authentication`)
- Google Sign In (implemented via Supabase OAuth)

### 8.3 Token Storage

```typescript
import * as SecureStore from 'expo-secure-store'

// Configured in Supabase client as ExpoSecureStoreAdapter
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}
```

### 8.4 Post-Auth Onboarding Flow

When a user signs up from the onboarding flow (via `plan-preview.tsx` → `signup.tsx?from=onboarding`), the signup screen:
1. Creates the account
2. Detects `from=onboarding` query param
3. Reads saved `onboardingStore` state
4. Calls `onboardingStore.submitOnboarding()` to persist dog + plan to DB
5. Redirects back to `plan-preview` to continue

### 8.5 Authorization Model

| Action | Free | Core | Premium |
|---|---|---|---|
| Create dog profile | ✓ | ✓ | ✓ |
| Complete first session | ✓ | ✓ | ✓ |
| View full 4-week plan | — | ✓ | ✓ |
| Unlimited sessions | — | ✓ | ✓ |
| AI coach (limited) | 5/day | ✓ | ✓ |
| AI coach (unlimited) | — | ✓ | ✓ |
| Video upload | 1 total | 20/day | Unlimited |
| Expert review | — | Add-on | 2/month |
| Family mode | — | — | ✓ |
| Annual report | — | ✓ | ✓ |

*Note: Subscription purchase UI is not yet implemented. Subscription tier is tracked in the store and enforces free-tier gating in plan-preview.tsx.*

---

## 9. Video Pipeline

### 9.1 Upload Flow

```
User selects video via expo-image-picker (MediaTypeOptions.Videos)
        ↓
Local file read via expo-file-system
        ↓
Upload to Supabase Storage: pawly-videos/{userId}/{dogId}/{timestamp}_{uuid}.mp4
        ↓
On upload complete → insert video record to videos table
        ↓
Trigger Edge Function: process-video
        ↓
Update video.processing_status = 'complete'
        ↓
If expert_review requested → create expert_review record + deduct credit
        ↓
Notify user: "Your video is ready for review"
```

### 9.2 Expert Review Queue

```
Video uploaded + user requests review (costs 1 credit from review_credits table)
        ↓
expert_reviews record created (status: 'queued')
        ↓
Admin dashboard shows review queue
        ↓
Trainer watches video, writes feedback with timestamps
        ↓
Review submitted via complete-expert-review Edge Function (status: 'complete')
        ↓
Push notification to user via notify-expert-review Edge Function
```

### 9.3 Expert Review Viewing

Users view completed reviews in `app/(tabs)/know/videos.tsx` and `app/(tabs)/know/video-player.tsx`. The video player renders trainer-added timestamp annotations alongside video playback.

### 9.4 Video Types

Videos are tagged with a `context` field:
- `onboarding` — recorded during onboarding to show current behavior
- `session` — recorded at end of a training session
- `behavior` — recorded to document a specific behavior for expert review

---

## 10. Notifications & Reminders

### 10.1 Architecture

```
User sets preferences in Notification Settings screen
        ↓
notificationStore.updatePrefs() saves to user_profiles.notification_prefs (Supabase)
        ↓
notificationStore.refreshSchedules(dog) cancels old + reschedules new local notifications
        ↓
lib/notifications.scheduleUserNotifications() creates Expo local notifications
        ↓
Expo Notifications delivers via APNs (iOS) or FCM (Android)
```

In-app notifications are written to the `in_app_notifications` Supabase table by Edge Functions and displayed in the notification center screen. `notificationStore` subscribes to realtime inserts and maintains an in-memory inbox with unread count.

Note: In v1, push notifications are **local** (scheduled on-device). Server-side triggers (Supabase webhooks → Expo Push Service) are designed but not fully wired (expert review notifications use the `notify-expert-review` Edge Function).

### 10.2 Push Token Management

```typescript
async function registerForPushNotifications(): Promise<void> {
  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') return

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId
  })

  await supabase
    .from('user_profiles')
    .update({ push_token: token.data })
    .eq('id', userId)
}
```

The `notificationStore.ensurePermissionAfterMeaningfulAction()` method requests permission at a high-intent moment (e.g., after first session completion) rather than on app launch.

### 10.3 Notification Types

| Type | Trigger | Content Example |
|---|---|---|
| Daily training reminder | User-set time | "Max's loose leash session is waiting. 8 minutes today." |
| Scheduled session reminder | N minutes before session time | "Your session with Max starts in 15 minutes." |
| Walk reminder | Morning, based on walk_times preference | "Today's walk goal: hold focus at 3 crossings." |
| Post-walk check-in | 30 min after walk time | "How was the walk? One tap to log it." |
| Missed session follow-up | Fallback if session missed | "No pressure. One easy win today keeps the streak alive." |
| Milestone celebration | After milestone achieved | "Max's first 3-day streak. That's real progress." |
| Plan adaptation | After plan is adapted | "Max's plan was updated based on recent progress." |
| New insight available | Weekly insight generation | "New insight about Max's energy pattern." |
| Expert review complete | Review status → complete | "Your video review is ready." |
| Streak at risk | Calculated based on last activity | "Your 7-day streak ends tonight." |
| Weekly summary | Weekly cadence | Summary of sessions and walk quality |

### 10.4 Notification Preferences Schema

Stored in `user_profiles.notification_prefs` JSONB:

```typescript
interface NotificationPrefs {
  dailyReminder: boolean
  dailyReminderTime: string         // "HH:MM" format
  walkReminders: boolean
  postWalkCheckIn: boolean
  streakAlerts: boolean
  milestoneAlerts: boolean
  insights: boolean
  expertReview: boolean
  lifecycle: boolean
  weeklySummary: boolean
  scheduledSessionReminders: boolean
  reminderLeadTimeMinutes: number   // minutes before session to fire reminder
  fallbackMissedSessionReminders: boolean
}
```

Default values defined in `lib/scheduleEngine.ts` as `DEFAULT_NOTIFICATION_PREFS`.

---

## 11. Payments & Subscriptions

### 11.1 Current Implementation Status

- RevenueCat dependency (`react-native-purchases`) is included in `package.json`
- `authStore.subscriptionTier` tracks 'free' | 'core' | 'premium'
- Free-tier gating is enforced in `plan-preview.tsx` (blurs weeks 2–4 for free users)
- **No purchase UI or RevenueCat initialization is currently implemented**

### 11.2 Planned RevenueCat Integration

```typescript
// Initialize on app start
async function initializeRevenueCat(): Promise<void> {
  if (Platform.OS === 'ios') {
    await Purchases.configure({ apiKey: IOS_RC_KEY })
  } else {
    await Purchases.configure({ apiKey: ANDROID_RC_KEY })
  }
  await Purchases.logIn(userId)
}
```

### 11.3 Entitlement Mapping (Planned)

| RevenueCat Entitlement | Pawly Tier | Products |
|---|---|---|
| `core` | Core | Monthly $14.99, Annual $89.99 |
| `premium` | Premium | Monthly $29.99, Annual $179.99 |
| `expert_review_pack` | Add-on | 3-pack $29 (consumable) |

### 11.4 Subscription Status Sync (Planned)

RevenueCat webhooks → Supabase Edge Function → update `users.subscription_tier`

---

## 12. Analytics & Event Tracking

### 12.1 Current Implementation

`lib/analytics.ts` provides a `captureEvent(event, properties?)` utility. In development (`__DEV__`), events are logged to console only. PostHog and Sentry dependencies are included in `package.json` but not yet initialized.

```typescript
// lib/analytics.ts
export function captureEvent(event: string, properties?: Record<string, unknown>) {
  if (__DEV__) {
    console.log('[Analytics]', event, properties)
    return
  }
  // TODO: posthog.capture(event, properties)
}
```

### 12.2 Planned Event Taxonomy

#### Onboarding Events
```
onboarding_started
onboarding_step_completed { step: string }
dog_profile_created { breed, age_months, primary_goal }
plan_generated { goal, difficulty, weeks, planner_mode }
onboarding_completed
paywall_viewed { source: 'onboarding' }
subscription_purchased { tier, period, price }
```

#### Training Events
```
session_started { exercise_id, plan_id }
session_mode_selected { mode: 'manual' | 'live_camera' }
session_step_completed { step_index, success: boolean }
session_completed { duration_seconds, success_score, difficulty, live_coaching_used }
session_abandoned { step_index }
post_session_reflection_submitted { question_count, difficulty, skipped: boolean }
walk_logged { quality, goal_achieved }
```

#### AI Coach Events
```
coach_message_sent { message_length }
coach_message_received { response_length, tokens_used }
coach_quick_suggestion_used { suggestion_text }
```

#### Progress Events
```
milestone_achieved { type, milestone_id }
streak_extended { streak_length, type }
streak_broken { previous_length, type }
```

#### Video Events
```
video_upload_started { context }
video_upload_completed { duration_seconds, file_size_mb }
expert_review_requested
```

#### Adaptive Planning Events
```
plan_adapted { adaptation_type, reason_code }
learning_state_updated { overall_score }
reflection_signal_extracted { signal_type, magnitude }
```

#### Live Coaching Events
```
live_coaching_session_started { exercise_id }
live_coaching_rep_counted { rep_count }
live_coaching_session_completed { success_count, reset_count, avg_tracking_quality }
```

### 12.3 North Star Metric

Weekly behavior sessions completed per active user:
```sql
SELECT
  DATE_TRUNC('week', completed_at) AS week,
  COUNT(*) AS sessions_completed,
  COUNT(DISTINCT user_id) AS active_users,
  COUNT(*)::FLOAT / COUNT(DISTINCT user_id) AS sessions_per_user
FROM session_logs
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
Region: us-east-1 (primary)
Database: PostgreSQL 15
Connection pooling: PgBouncer (transaction mode)
Storage: Supabase Storage (S3-compatible), bucket: pawly-videos
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
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": { "APP_ENV": "development" }
    },
    "preview": {
      "distribution": "internal",
      "env": { "APP_ENV": "staging" }
    },
    "production": {
      "env": { "APP_ENV": "production" }
    }
  }
}
```

**Note:** The pose detection feature (react-native-vision-camera, react-native-fast-tflite) and the Live Camera Coach session mode require a native dev build. They do not work in Expo Go.

### 13.4 CI/CD Pipeline

```yaml
# .github/workflows/main.yml
jobs:
  test:
    steps:
      - run: npm ci
      - run: npm run typecheck
      - run: npm run test
      - run: npm run lint

  deploy-edge-functions:
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - run: supabase functions deploy --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}

  build-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - run: eas build --platform all --non-interactive --auto-submit
```

### 13.5 npm Scripts

```json
{
  "start": "expo start",
  "ios": "expo run:ios",
  "android": "expo run:android",
  "web": "expo start --web",
  "typecheck": "tsc --noEmit",
  "test": "node --test --experimental-strip-types tests/*.test.ts"
}
```

---

## 14. Security & Privacy

### 14.1 Data Classification

| Data Type | Classification | Storage | Retention |
|---|---|---|---|
| User credentials | Sensitive | Supabase Auth (hashed) | Until deletion |
| Dog profile data | Personal | PostgreSQL (RLS) | Until deletion |
| Training videos | Personal | Supabase Storage (private) | 2 years or deletion |
| Session logs | Personal | PostgreSQL (RLS) | 3 years or deletion |
| Post-session reflections | Personal | PostgreSQL (RLS, JSONB in session_logs) | 3 years or deletion |
| Chat messages | Personal | PostgreSQL (RLS) | 1 year rolling |
| Analytics events | Pseudonymous | PostHog | 2 years |
| Pose metrics | Personal | PostgreSQL (RLS, JSONB in session_logs) | 3 years or deletion |

### 14.2 Video Security

- All videos stored in private `pawly-videos` Supabase Storage bucket
- Access via signed URLs with 1-hour expiry
- No public URLs for user video content
- Videos encrypted at rest (AES-256) and in transit (TLS 1.3)

```typescript
async function getVideoPlaybackUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase
    .storage
    .from('pawly-videos')
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

---

## 15. Third-Party Integrations

### 15.1 Integration Summary

| Service | Purpose | SDK | Status |
|---|---|---|---|
| Supabase | Backend, auth, storage, DB | `@supabase/supabase-js` | ✅ Active |
| Anthropic | AI coach + plan generation | `@anthropic-ai/sdk` | ✅ Active (Edge Functions) |
| RevenueCat | Subscriptions | `react-native-purchases` | ⏳ Dependency only, not initialized |
| Expo | Mobile platform | `expo` suite | ✅ Active |
| Expo Notifications | Local + push notifications | `expo-notifications` | ✅ Active (local scheduling) |
| PostHog | Analytics | `posthog-react-native` | ⏳ Dependency only, not initialized |
| Sentry | Error tracking | `@sentry/react-native` | ⏳ Dependency only, not initialized |
| Apple Authentication | Apple Sign In | `expo-apple-authentication` | ✅ Active |
| Vision Camera | Camera frame processing | `react-native-vision-camera` | ✅ Active (native build only) |
| TFLite | Dog pose inference | `react-native-fast-tflite` | ✅ Active (native build only) |
| Resend | Email delivery (expert review queue) | Used in Edge Functions | ✅ Active |

### 15.2 Anthropic API Configuration

```typescript
const COACH_CONFIG = {
  model: 'claude-sonnet-4-6',
  max_tokens: 600,
}
```

Both the AI coach (`ai-coach-message`) and plan generation (`generate-adaptive-plan`) Edge Functions use `claude-sonnet-4-6`.

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
| AI coach failure | Show rate limit error state | "Coach is temporarily unavailable." |
| AI coach rate limit | Set `rateLimitError` flag in coachStore | "You've reached your coaching limit for today." |
| Plan generation failure | Fall back to rules-based planner | Silent — user receives plan regardless |
| Video upload failure | Queue and retry on reconnect | "Video saved to retry when connection improves." |
| Session sync failure | Store locally, sync on next open | Silent — sync in background |
| Auth expiry | Auto-refresh or redirect to login | "Session expired. Please log in again." |
| Pose detection unavailable | Fall back to manual session mode | Mode picker omits Live Camera option |
| Reflection normalization failure | Treat as null (no reflection) | Silent — session saved without reflection data |

### 16.2 Error Monitoring

Sentry dependency included but not yet initialized. To initialize:

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
| Pose detection inference | ~10 FPS (100ms/frame) | < 5 FPS |
| Live coaching frame latency | < 150ms end-to-end | > 300ms |
| Reflection question engine | < 5ms (pure function) | > 50ms |

### 17.2 API Response Optimization

- Plan sessions stored as JSONB array in `plans.sessions` — no join needed to load today's session
- `planStore` derives `todaySession` and `completionPercentage` client-side when plan is loaded
- `calendarSessions.ts` groups sessions by date client-side for the calendar view
- Pose inference runs in a JS worklet on every 10th camera frame (throttled) to maintain UI responsiveness
- Reflection question engine is a pure synchronous function; invoked client-side with no network round-trip

---

## 18. Testing Strategy

### 18.1 Testing Pyramid

```
          ┌──────────┐
          │  E2E     │  Maestro — 10 critical user flows
          ├──────────┤
          │Integration│  Supabase test environment — API + DB
          ├──────────┤
          │  Unit    │  Node.js test runner — business logic
          └──────────┘
```

### 18.2 Unit Tests

Located in `tests/`. Run with:
```bash
npm test
# → node --test --experimental-strip-types tests/*.test.ts
```

Current coverage:

| Test File | Coverage Area |
|---|---|
| `scheduleEngine.test.ts` | `chooseTrainingDays()`, `chooseTimeForDay()`, `getTodaySession()`, `rescheduleMissedSession()` |
| `reflectionQuestionEngine.test.ts` | Rules A–G, question selection logic, edge cases |
| `reflectionSignals.test.ts` | Signal extraction and confidence weighting |
| `reflectionAdaptation.test.ts` | Reflection signal → adaptation rule mapping |
| `reflectionPersistence.test.ts` | Saving and loading reflection data |
| `reflectionNormalizer.test.ts` | Normalization of invalid/partial JSONB |
| `postSessionReflection.test.ts` | Component render and interaction |
| `postSessionReflectionUI.test.ts` | UI state, animations, step flow |
| `reflectionPolish.test.ts` | Edge cases and polish scenarios |

### 18.3 Unit Test Coverage Targets

| Module | Coverage Target |
|---|---|
| Plan generation logic | 90% |
| Schedule engine | 90% |
| Milestone engine | 85% |
| Streak calculation | 95% |
| Auth token management | 90% |
| Notification scheduling | 80% |
| Adaptive planning engine | 80% |
| Reflection question engine | 90% |
| Reflection signal extraction | 90% |
| Pose decoder | 75% |
| Live coaching engine | 80% |
| Posture classifier | 75% |

### 18.4 Critical E2E Test Flows (Maestro)

1. Complete onboarding → generate plan → see today screen
2. Complete a full training session end-to-end (manual mode)
3. Complete a session using Live Camera Coach mode
4. Complete a session and submit post-session reflection
5. Skip post-session reflection — confirm session saves correctly
6. Send AI coach message → receive response
7. Log walk → see streak update
8. Hit paywall → complete subscription purchase
9. Upload video → confirm receipt and processing state
10. Achieve milestone → see shareable card
11. Sign out → sign back in → data persists
12. View training calendar → navigate months → tap session
13. Plan adaptation → see adaptation notice → view reason

---

## 19. Release & Deployment

### 19.1 App Store Requirements

**iOS:**
- Minimum iOS 16.0
- Privacy manifest required (iOS 17+)
- Apple Sign In required (third-party auth offered)
- Camera usage description required (pose detection / live coaching feature)

**Android:**
- Minimum API level 31 (Android 12)
- Target API level 34 (Android 14)
- Google Play Billing for subscriptions
- Camera permission required (pose detection / live coaching feature)

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

OTA updates: content updates, bug fixes, AI prompt updates, UI tweaks, coaching rule updates, reflection question catalog updates
Binary releases: native module changes, Expo SDK upgrades, new permissions, TFLite model updates

---

## 20. V1 Scope Boundaries

### 20.1 What V1 Includes (Implemented)

- Full onboarding wizard (multi-step: dog profile, goals, environment, optional video upload, schedule preferences)
- Dog profile with full breed/age/behavior/schedule data
- AI-powered plan generation (Claude API via `generate-adaptive-plan` Edge Function)
- Rules-based plan generation fallback
- Schedule engine (preferred days/windows, automatic rescheduling of missed sessions)
- Session execution engine — dual mode:
  - **Manual mode:** step-by-step guide, timer ring, tap-to-count reps, difficulty scoring
  - **Live Camera Coach mode:** on-device TFLite pose detection, automatic rep counting, real-time posture feedback, tracking quality indicator
- `SessionModePicker` presented after SETUP to choose execution mode
- Live coaching metrics (`LiveCoachingSummary`, `PoseMetrics`) stored with each session log
- **Post-session reflection system (PR17):**
  - Multi-step `PostSessionReflectionCard` UI after every session
  - Dynamic question selection engine (Rules A–G, 2–4 questions per session)
  - 8 structured question types covering session outcome, distraction, cue understanding, arousal, handler technique
  - `PostSessionReflection` stored as JSONB on session_logs (nullable, backward compatible)
  - Reflection signals extracted and confidence-weighted into learning state updates
  - Adaptation engine uses reflection-derived signals with specific reason codes
- Walk integration (daily goal, 3-point quality logging, walk streak)
- AI coach (Claude-powered, dog-context + learning state grounded, conversation history, formatted markdown responses)
- Progress tracking (session streak, walk streak, behavior score progression)
- Milestone system (13 milestones with shareable cards)
- Training calendar (monthly view, session status indicators, day-level session list with support session metadata)
- Adaptive planning engine (skill graph, 7-dimension learning state, adaptation rules, audit trail, hypothesis engine, reflection signal integration)
- Video upload (storage, context tagging, expert review request)
- Expert video reviews (review queue, trainer feedback, timestamp annotations, in-app viewer)
- In-app notification center (notification bell, inbox with realtime updates, unread count)
- Notification preferences UI (13 configurable notification types, local scheduling)
- Theme selection (system / light / dark)
- Authentication (email, Apple Sign In, Google OAuth, password reset)
- Subscription tier enforcement (free gating on plan preview)
- On-device dog pose detection pipeline (TFLite, Vision Camera v4, one-euro filter, posture classifier, state machine, skeleton overlay — native build only)
- Know tab (education hub, video library, video player)

### 20.2 What V1 Explicitly Excludes (Not Yet Built)

- Subscription purchase UI / RevenueCat initialization
- Dog profile editing screen (post-onboarding)
- Know tab content: training articles, insights feed display
- PostHog analytics initialization and event tracking to backend
- Sentry error tracking initialization
- Server-side push notification triggers (currently local-only; expert review uses Edge Function)
- Household / family sharing
- AI video analysis
- Lifecycle curriculum automation
- Annual report
- Multi-dog support
- Dog personality profile (field exists in schema, not yet populated or displayed)

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
| Live Camera Coach mode adoption | > 30% of sessions |
| Post-session reflection completion rate | > 60% of sessions |

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
    "expo": "~52.0.37",
    "expo-router": "~4.0.19",
    "react-native": "0.76.7",
    "typescript": "~5.7.2",
    "@supabase/supabase-js": "^2.49.8",
    "zustand": "^5.0.3",
    "@tanstack/react-query": "^5.66.9",
    "nativewind": "4.1.23",
    "react-native-reanimated": "~3.16.1",
    "react-native-gesture-handler": "~2.20.2",
    "react-native-svg": "15.8.0",
    "@anthropic-ai/sdk": "^0.30.0",
    "react-native-vision-camera": "^4.6.4",
    "react-native-fast-tflite": "^2.0.0",
    "vision-camera-resize-plugin": "^3.2.0",
    "react-native-worklets-core": "^1.6.3",
    "react-native-purchases": "^8.0.0",
    "posthog-react-native": "^3.8.0",
    "@sentry/react-native": "^7.4.0",
    "expo-secure-store": "~14.0.1",
    "expo-notifications": "^0.29.14",
    "expo-image-picker": "~16.0.6",
    "expo-image-manipulator": "~13.0.6",
    "expo-file-system": "~18.0.11",
    "expo-apple-authentication": "~7.1.3",
    "expo-av": "~15.0.2",
    "expo-video-thumbnails": "~8.0.0",
    "expo-linear-gradient": "~14.0.2",
    "react-native-view-shot": "^3.8.0",
    "jpeg-js": "^0.4.4",
    "@react-native-community/datetimepicker": "8.2.0",
    "@react-native-async-storage/async-storage": "1.23.1"
  }
}
```

## Appendix C: Database Migration Strategy

All schema changes managed via Supabase migrations in `supabase/migrations/`:

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

Migration files are version-controlled in Git and applied sequentially. Current migrations: pr03 through pr17.

---
