# Pawly — Technical Specification
**Version:** 1.5
**Date:** March 18, 2026
**Status:** Current (updated to reflect multi-course plans, course color system, articles library, and all prior PRs through PR-21)

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

Pawly is a mobile-first subscription application that delivers personalized dog training plans, AI-powered coaching, video feedback, and a lifecycle content system across the full lifespan of a dog. The system maintains a persistent behavioral memory of each dog and adapts its guidance based on ongoing session outcomes, structured post-session handler reflections, user-submitted video, and lifecycle stage. Sessions can be completed in manual mode or via a live camera coaching mode that uses on-device pose detection to count reps and provide real-time posture feedback. A dog can have up to two simultaneously active training courses, each with its own plan and schedule that are merged into a unified daily view.

### 1.2 Core User Flow (Happy Path)

```
Download App
     ↓
Onboarding (multi-step wizard: dog profile + goal + schedule preferences)
     ↓
Plan Generated (AI-powered via Claude API, 8 behavior goals supported)
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
Add Second Course (optional — up to 2 active courses per dog)
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
| 4 | Know | Supabase-backed article library and in-app reader for dog training education | ✅ Implemented |
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
- **Multi-course scheduling:** A dog can have up to 2 active training plans; sessions are merged into a single prioritized daily view via `lib/mergedSchedule.ts`
- **Deterministic course colors:** Colors are assigned from a fixed palette via hash of plan ID — no DB persistence required

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
│   │   └── forgot-password.tsx   # Password reset request
│   ├── (onboarding)/             # Onboarding flow
│   │   ├── dog-basics.tsx        # Primary onboarding wizard (dog name, breed, age, sex)
│   │   ├── dog-problem.tsx       # Select primary behavior goal & severity
│   │   ├── dog-environment.tsx   # Home environment type, household members, other pets
│   │   ├── video-upload.tsx      # Upload video of dog's current behavior
│   │   └── plan-preview.tsx      # Plan summary + paywall gate
│   ├── (tabs)/                   # Main authenticated tab navigator
│   │   ├── train/
│   │   │   ├── index.tsx         # Today card / home screen (multi-course aware)
│   │   │   ├── calendar.tsx      # Monthly training calendar (merged multi-course view)
│   │   │   ├── session.tsx       # Active session screen (manual + live camera + post-session reflection)
│   │   │   ├── plan.tsx          # Full plan view with course switcher
│   │   │   ├── add-course.tsx    # Add a second training course for the dog
│   │   │   ├── notifications.tsx # In-app notification center
│   │   │   ├── pose-debug.tsx    # Dev-only: pose detection debug (entry)
│   │   │   ├── pose-debug-impl.tsx  # Dev-only: pose detection debug (implementation)
│   │   │   └── upload-video.tsx  # Video upload
│   │   ├── progress/
│   │   │   ├── index.tsx         # Progress dashboard
│   │   │   └── milestones.tsx    # All milestones screen
│   │   ├── coach/
│   │   │   └── index.tsx         # AI coach chat
│   │   ├── know/
│   │   │   ├── index.tsx         # Article library home
│   │   │   └── article/[slug].tsx # Article reader
│   │   └── profile/
│   │       ├── index.tsx         # Profile screen
│   │       └── notification-settings.tsx  # Notification preferences
│   └── _layout.tsx               # Root layout with navigation gate
├── components/                   # Reusable components
│   ├── ui/                       # Button, Text, Input, Card, StreakBadge, etc.
│   ├── session/                  # TimerRing, RepCounter, StepCard, SessionModePicker, LiveCoachOverlay, PostSessionReflectionCard
│   ├── coach/                    # MessageBubble, TypingIndicator, QuickSuggestions, FormattedCoachMessage
│   ├── progress/                 # MilestoneCard, ShareCard
│   ├── train/                    # ActiveCourseCard, TrainingCalendar, CalendarDayCell, DaySessionList
│   ├── vision/                   # DogKeypointOverlay, LiveCoachOverlay, TrackingQualityBadge
│   ├── adaptive/                 # LearningInsightCard, AdaptationNotice, WhyThisChangedSheet, PlanReasonCard, SessionChangeBadge
│   ├── notifications/            # NotificationBell, NotificationItem
│   ├── video/                    # VideoUploadProgress
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
│   ├── scheduleEngine.ts         # Per-plan schedule logic, session timing, rescheduling
│   ├── mergedSchedule.ts         # Cross-plan merge and recommendation layer (multi-course)
│   ├── addCourse.ts              # Add-second-course flow orchestration
│   ├── addCourseUtils.ts         # Course title building, duplicate detection, goal normalization
│   ├── sessionManager.ts         # Session saving, streak updates, milestone checks, reflection persistence
│   ├── milestoneEngine.ts        # 13 milestone definitions and check functions
│   ├── analytics.ts              # Event capture (console-only in dev; PostHog pending)
│   ├── modelMappers.ts           # DB row → TypeScript type converters (includes multi-course fields)
│   ├── notifications.ts          # Expo Notifications wrapper, scheduling
│   ├── inAppNotifications.ts     # In-app notification logic
│   ├── videoUploader.ts          # Video upload utilities
│   ├── calendarSessions.ts       # Calendar date ops, session grouping by date
│   ├── planScheduleDiff.ts       # Plan change diffing
│   ├── theme.ts                  # useTheme() hook
│   ├── reflectionAnswerHelpers.ts  # Pure functions for PostSessionReflection
│   ├── adaptivePlanning/         # Full adaptive planning engine (27 files)
│   │   ├── types.ts
│   │   ├── config.ts
│   │   ├── featureFlags.ts
│   │   ├── initialPlanner.ts
│   │   ├── adaptationEngine.ts
│   │   ├── adaptationRules.ts
│   │   ├── adaptationCompiler.ts
│   │   ├── adaptationAudit.ts
│   │   ├── hypothesisEngine.ts
│   │   ├── learningStateEngine.ts
│   │   ├── learningStateScoring.ts
│   │   ├── learningStateSummary.ts
│   │   ├── learningSignals.ts
│   │   ├── skillGraph.ts
│   │   ├── graphTraversal.ts
│   │   ├── graphValidation.ts
│   │   ├── planValidation.ts
│   │   ├── planDiff.ts
│   │   ├── planCompiler.ts
│   │   ├── plannerPrompt.ts
│   │   ├── repositories.ts
│   │   ├── reflectionQuestionTypes.ts
│   │   ├── reflectionQuestionCatalog.ts
│   │   ├── reflectionQuestionEngine.ts
│   │   └── reflectionNormalizer.ts
│   ├── liveCoach/                # Live coaching engine (6 files)
│   │   ├── liveCoachingTypes.ts
│   │   ├── liveCoachingEngine.ts
│   │   ├── liveCoachingRules.ts
│   │   └── liveCoachingSession.ts
│   └── vision/                   # On-device vision utilities (11 files)
│       ├── poseDecoder.ts
│       ├── TFLitePoseProvider.ts
│       ├── nativeSupport.ts
│       ├── poseStateMachine.ts
│       ├── postureClassifier.ts
│       ├── poseFeatureExtractor.ts
│       ├── poseStabilizer.ts
│       ├── poseTrackingQuality.ts
│       ├── poseEventDetector.ts
│       ├── poseOutlierRejection.ts
│       └── oneEuroFilter.ts
├── types/                        # TypeScript type definitions
│   ├── index.ts                  # All app types
│   └── pose.ts                   # Dog pose keypoint types
├── tests/                        # Unit tests (Node.js test runner)
│   ├── scheduleEngine.test.ts
│   ├── mergedSchedule.test.ts
│   ├── courseColors.test.ts
│   ├── multiCourseUI.test.ts
│   ├── addCourse.test.ts
│   ├── postSessionReflection.test.ts
│   ├── postSessionReflectionUI.test.ts
│   ├── reflectionAdaptation.test.ts
│   ├── reflectionPersistence.test.ts
│   ├── reflectionPolish.test.ts
│   ├── reflectionQuestionEngine.test.ts
│   └── reflectionSignals.test.ts
├── constants/                    # App-wide constants
│   ├── protocols.ts              # Full training protocol library (1,360+ lines)
│   ├── courseColors.ts           # Course color palette + goal color mapping + theming utilities
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
    │   ├── Today Screen (home — multi-course aware)
    │   ├── Calendar Screen (merged monthly plan view)
    │   ├── Session Screen (step-by-step execution, manual or live camera, post-session reflection)
    │   ├── Full Plan Screen (course switcher, per-plan sessions, week view)
    │   ├── Add Course Screen (enroll dog in a second training course)
    │   ├── Notifications Screen (in-app notification center)
    │   └── Upload Video Screen
    ├── Progress Tab
    │   ├── Dashboard (streaks, behavior scores, charts, milestones)
    │   └── Milestones (full list)
    ├── Coach Tab
    │   └── Chat Screen (AI coach, hides bottom nav bar)
    ├── Know Tab
    │   ├── Article Library
    │   └── Article Reader
    └── Profile Tab
        ├── Profile Screen (dog info, stats, theme)
        └── Notification Settings Screen
```

#### Navigation Gate Logic (`app/_layout.tsx`)

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

#### planStore

The plan store was redesigned in PR-18 to support multiple simultaneous active plans per dog.

```typescript
interface PlanStore {
  // ── Multi-plan state ──────────────────────────────────────────────────────
  /** All active plans keyed by plan id. */
  plansById: Record<string, Plan>
  /** Ordered list of active plan ids (priority DESC, created_at DESC). */
  activePlanIds: string[]
  /**
   * The plan id currently selected for deep-dive views (plan screen, session screen).
   * Falls back to the primary plan if null.
   */
  selectedPlanId: string | null
  /**
   * All sessions scheduled for today across every active plan.
   * The recommended session is always first; the rest follow tie-break order.
   */
  todaySessions: EnrichedPlanSession[]
  /**
   * The single session surfaced in the Today CTA. Chosen by mergeActivePlanSchedules:
   *   1. Overdue sessions first (oldest overdue wins)
   *   2. Today's session from primary/highest-priority plan
   *   3. Nearest upcoming session if nothing due today
   */
  recommendedTodaySession: EnrichedPlanSession | null
  /** All overdue (missed) sessions across active plans, sorted oldest first. */
  missedSessions: EnrichedPlanSession[]
  protocols: Record<string, Protocol>
  recentAdaptations: PlanAdaptation[]
  isLoading: boolean

  // ── Multi-plan actions ────────────────────────────────────────────────────
  fetchActivePlans: (dogId: string) => Promise<void>
  refreshPlans: (dogId: string) => Promise<void>
  setSelectedPlan: (planId: string | null) => void
  getSelectedPlan: () => Plan | null
  getPlanSessions: (planId: string) => PlanSession[]
  getRecommendedTodaySession: () => EnrichedPlanSession | null
  getUpcomingSessionsAcrossPlans: (limit?: number) => EnrichedPlanSession[]
  getMissedSessionsAcrossPlans: () => EnrichedPlanSession[]
  getGroupedSessionsForCalendar: () => Record<string, EnrichedPlanSession[]>

  // ── Per-plan actions ──────────────────────────────────────────────────────
  fetchProtocol: (exerciseId: string) => Promise<Protocol | null>
  fetchRecentAdaptations: (planId: string) => Promise<void>
  markSessionComplete: (planId: string, sessionId: string, score: SessionScore) => Promise<void>
  rescheduleMissedSession: (planId: string, sessionId: string) => Promise<void>

  // ── Backward-compatibility shims (deprecated) ────────────────────────────
  activePlan: Plan | null          // derived from selectedPlanId → primary → first active
  todaySession: PlanSession | null // derived from recommendedTodaySession
  completionPercentage: number     // completion % for selected/primary plan only
  fetchActivePlan: (dogId: string) => Promise<void>
  refreshPlan: () => Promise<void>
  setActivePlan: (plan: Plan | null) => void
  getTodaySession: () => PlanSession | null
  getUpcomingSessions: (limit?: number) => PlanSession[]
  getMissedScheduledSessions: () => PlanSession[]
}
```

Exported selectors:
- `selectPlanSummaries(store)` — returns `PlanSummary[]` for course switcher and list UIs
- `selectSelectedPlanTheme(store)` — returns `CourseUiColors | null` for the currently selected course

If a loaded plan's sessions lack `scheduledDate` fields, the store calls `buildWeeklySchedule()` automatically and persists the result.

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

Purpose: The primary daily engagement surface. One clear action every day, multi-course aware.

Components:
- Greeting header — time-based greeting + dog name
- `TodayCard` — primary CTA card showing `recommendedTodaySession` from merged schedule across all active plans; shows course label and color when multiple courses are active
- `ActiveCourseCard` — displayed for each active course; shows course title, completion %, primary badge, and next session
- `QuickWinStrip` — horizontal scroll of 4 hardcoded enrichment quick wins (sniff walk, find it game, name drill, hand touch)
- Upcoming sessions — next sessions from merged schedule across all active plans
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

Purpose: Monthly overview of all scheduled and completed training sessions across all active courses.

Components:
- `TrainingCalendar` — 6×7 monthly grid with navigation arrows; sessions from all active plans are included
- `CalendarDayCell` — individual day cell with status indicators (one per active course when multi-plan)
- `DaySessionList` — session list for the selected date; shows course badges when multiple courses are active; shows `insertedByAdaptation` support sessions with their `supportSessionType` when present

Behavior:
- Month navigation via prev/next arrows
- Today's date is highlighted with a border
- Non-current-month dates are grayed out
- Tapping a day shows sessions scheduled for that date across all active plans
- Sessions are grouped by `scheduledDate` (YYYY-MM-DD) and sorted by `scheduledTime`
- Sessions carry `planId`, `planGoal`, and `planCourseTitle` via `EnrichedPlanSession`
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

**Session completion flow:**
1. Handler selects difficulty rating (easy/okay/hard) — auto-advances after 180ms
2. Reflection question engine selects 2–4 contextual questions based on session outcome, recent history, and learning state
3. Handler answers questions (non-required questions can be skipped); optional freeform note
4. Calls `sessionManager.saveSession()` with `difficulty`, `notes`, `liveCoachingUsed`, `liveCoachingSummary`, `poseMetrics`, and `postSessionReflection`
5. `saveSession()` persists to `session_logs`, calls `updateLearningStateFromSessionLog()`, invokes `adapt-plan` Edge Function
6. `updateStreak()` + `checkMilestones()` run non-blocking
7. `refreshPlans()` + `notificationStore.refreshSchedules()` update downstream state
8. `dogStore.fetchDogLearningState()` refreshes coach context

##### SessionModePicker (`components/session/SessionModePicker.tsx`)

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
  1. **Live Camera Coach** (featured, primary) — \"Point your camera at {dogName}. The app tracks posture and counts reps in real time.\" Feature pills: Auto rep count, Posture feedback, Hands-free. Shows \"NEW\" badge.
  2. **Do Normally** (secondary, outlined) — \"Follow the step-by-step guide and mark reps manually.\"
- Footer note: \"You can switch modes anytime from a session\"

##### PostSessionReflectionCard (`components/session/PostSessionReflectionCard.tsx`)

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
1. **Difficulty Step** (always first) — Easy / Okay / Hard large button cards. Selection auto-advances after 180ms.
2. **Question Steps** (1 per selected question) — `single_select` (chip options) or `scale` (numeric 1–N). Non-required questions show \"Optional\" badge and Skip button. Selection auto-advances after 180ms.
3. **Notes Step** (always last) — large multiline text input. Submit button; shows \"Saving…\" while `isSaving`.

**UI Features:**
- Fixed header: back button + \"Session complete\" badge + `durationLabel`
- Segmented progress bar (one segment per step)
- Animated transitions (slide + opacity: 100ms out, 160ms spring in)
- Safe-area-aware bottom padding

#### Add Course Screen (`app/(tabs)/train/add-course.tsx`)

Purpose: Allow a user to enroll their dog in a second simultaneous training course.

- Enforces `MAX_ACTIVE_COURSES = 2`; shown only when dog has fewer than 2 active plans
- Presents the 8 behavior goals; disables any goal already enrolled
- On confirmation, calls `lib/addCourse.ts` which generates a plan (adaptive AI or rules-based fallback) and inserts it to DB with `is_primary = false` and appropriate `priority`
- On success, navigates back and triggers `planStore.refreshPlans()`

#### Plan Screen (`app/(tabs)/train/plan.tsx`)

Purpose: Show the full training plan for the selected course, with completion status and course switcher.

Components:
- Course switcher pill tabs — one pill per active course, styled with `getCoursePillColors()`
- Completion ring (72px circular progress) for the selected course
- Session list grouped by week for the selected plan
- Session rows: status icon (completed/locked/playable), title, scheduled day/time, duration
- `AdaptationNotice` — shown when the plan has been recently adapted; displays reason from `reasonCode` including reflection-based codes
- \"TODAY\" badge for today's session
- Tap to navigate to session screen

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

#### Progress Dashboard (`app/(tabs)/progress/index.tsx`)

Components:
- Session streak card (flame icon, activity dots for 14 days)
- Walk streak card
- Behavior score cards (4-stage progression per goal)
- Weekly sessions chart (sessions completed per week)
- Walk quality chart (14-day history, 3-point quality scale)
- Milestones carousel (achieved milestones)
- Share card for celebrating milestones

#### Know Tab (`app/(tabs)/know/`)

Purpose: Browse Pawly-authored training articles and read them in-app.

Data source: `articles` Supabase table (seeded via `pr21_seed_articles.sql`). Block-based JSON content rendered natively in-app.

Screens:
- `index.tsx` — Article library: featured article, category chips, search, and browse list
- `article/[slug].tsx` — Full article reader with metadata, structured content blocks, and related articles

#### Notification Settings Screen (`app/(tabs)/profile/notification-settings.tsx`)

Controls all 13 `NotificationPrefs` fields. Calls `notificationStore.refreshSchedules()` on every preference change.

#### In-App Notification Center (`app/(tabs)/train/notifications.tsx`)

Notifications stored in `in_app_notifications` Supabase table. Managed by `notificationStore` (inbox + unread count + realtime subscription).

---

## 4. Backend Services

### 4.1 Supabase Project Structure

| Supabase Feature | Used For |
|---|---|
| PostgreSQL | All relational data |
| Auth | User authentication (email, Apple, Google) |
| Storage | Video and image files (`pawly-videos` bucket) |
| Edge Functions | Plan generation, AI coach calls, plan adaptation |
| Real-time | Live session sync, notification triggers |
| Row Level Security | Data access control per user |

### 4.2 Edge Functions

#### `generate-adaptive-plan`

Triggered: after onboarding completion or when a new plan is requested (including add-course flow)
Input: `{ dogId: string, userId: string }`
Process:
1. Fetch dog profile from DB
2. Build training preferences from dog config
3. Fetch skill graph (nodes & edges from DB)
4. Construct AI prompt with dog profile, behavior goals, skill graph, and training constraints
5. Call Claude API to generate `AIPlannerOutput`
6. Compile output into concrete plan with scheduled sessions (server-side schedule engine)
7. Assign dates/times respecting dog's preferred days, windows, and timezone
8. Insert plan record to `plans` table with `course_title`, `priority`, and `is_primary` fields

Output: `{ plan: Plan, plannerMode: 'adaptive_ai' | 'rules_fallback', planningSummary?, fallbackReason? }`

Falls back to rules-based `initialPlanner.ts` if Claude call fails.

#### `adapt-plan`

Triggered: after session completion (invoked by `sessionManager.saveSession()`)
Input: plan ID, session outcome data (includes `post_session_reflection` JSONB)
Process:
1. Fetch session log including `post_session_reflection`
2. Normalize reflection via `normalizePostSessionReflection()`
3. Pass normalized reflection to adaptation engine
4. Runs adaptation engine checking rules — including reflection-based rules (Rules A–G signals)
5. Generates adaptations with `reasonCode`
6. Compiles plan updates and writes audit record

Output: updated plan with adaptation audit record

#### `ai-coach-message`

Triggered: user sends message in coach chat
Input: message content, conversation history, dog context (including `DogLearningState`)
Process: assemble system prompt with full dog context → call Anthropic API → store response
Output: assistant message stored and returned to client


### 4.3 Real-time Subscriptions

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
- `pr08_videos.sql` — videos table
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
- `pr18_plan_color.sql` — color-related changes (superseded by pr18_multi_course_plans)
- `pr18_multi_course_plans.sql` — course_title, priority, is_primary columns on plans; partial unique index for primary plan
- `pr19_add_course_flow.sql` — data-quality backfill for is_primary on single-active-plan dogs
- `pr20_articles_library.sql` — articles table
- `pr21_seed_articles.sql` — Pawly-authored article content seed

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

CREATE TABLE user_profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id),
  notification_prefs JSONB DEFAULT '{}',
  push_token       TEXT,
);
```

#### `dogs`

```sql
CREATE TABLE dogs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id              UUID REFERENCES users(id) NOT NULL,
  name                  TEXT NOT NULL,
  breed                 TEXT,
  breed_group           TEXT,
  age_months            INTEGER,
  sex                   TEXT CHECK (sex IN ('male', 'female')),
  neutered              BOOLEAN,
  environment_type      TEXT CHECK (environment_type IN ('apartment', 'house_no_yard', 'house_yard')),
  behavior_goals        TEXT[] DEFAULT '{}',
  training_experience   TEXT CHECK (training_experience IN ('none', 'some', 'experienced')),
  equipment             TEXT[] DEFAULT '{}',
  available_minutes_day INTEGER,
  available_days_week   INTEGER,
  preferred_days        TEXT[] DEFAULT '{}',
  preferred_windows     TEXT[] DEFAULT '{}',
  exact_times           JSONB DEFAULT '{}',
  walk_times            JSONB DEFAULT '{}',
  schedule_flexibility  TEXT DEFAULT 'move_tomorrow',
  schedule_intensity    TEXT DEFAULT 'balanced',
  session_style         TEXT DEFAULT 'balanced',
  timezone              TEXT DEFAULT 'UTC',
  lifecycle_stage       TEXT DEFAULT 'puppy',
  avatar_url            TEXT,
  -- additional scheduling and profile fields
  ...
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
  sessions         JSONB DEFAULT '[]',
  metadata         JSONB DEFAULT '{}',
  -- Multi-course fields (PR-18)
  course_title     TEXT,                          -- human-readable course name
  priority         INTEGER NOT NULL DEFAULT 0,    -- higher = shown first
  is_primary       BOOLEAN NOT NULL DEFAULT false -- at most one active plan per dog
);

-- Partial unique index: only one active plan per dog may be primary
CREATE UNIQUE INDEX plans_dog_primary_active_unique
  ON plans (dog_id)
  WHERE (is_primary = true AND status = 'active');
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
  autoRescheduledFrom?: string | null
  schedulingReason?: string
  isMissed?: boolean
  skillId?: string
  parentSkillId?: string | null
  environment?: PlanEnvironment
  sessionKind?: 'core' | 'repeat' | 'regress' | 'advance' | 'detour' | 'proofing'
  adaptationSource?: 'initial_plan' | 'adaptation_engine'
  reasoningLabel?: string | null
  insertedByAdaptation?: boolean
  supportSessionType?: SupportSessionType | null  // 'foundation' | 'transition' | 'duration_building' | 'calm_reset'
  insertionReasonCode?: string | null
}
```

**Plan multi-course fields (TypeScript):**
```typescript
interface Plan {
  // ... existing fields ...
  courseTitle: string | null   // e.g. "Loose Leash Walking"
  priority: number             // 0+ (higher = shown first)
  isPrimary: boolean           // at most one active plan per dog
}
```

**Enriched session type (for multi-plan views):**
```typescript
interface EnrichedPlanSession extends PlanSession {
  planId: string
  planGoal: string
  planCourseTitle: string | null
  isPrimaryPlan: boolean
}
```

**Lightweight plan summary (for list UIs):**
```typescript
interface PlanSummary {
  id: string
  dogId: string
  goal: string
  courseTitle: string | null
  status: Plan['status']
  isPrimary: boolean
  priority: number
  currentWeek: number
  durationWeeks: number
  sessionsPerWeek: number
  completionPercentage: number
  todaySession: PlanSession | null
  createdAt: string
}
```

#### `session_logs`

```sql
CREATE TABLE session_logs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES users(id) NOT NULL,
  dog_id                UUID REFERENCES dogs(id) NOT NULL,
  plan_id               UUID REFERENCES plans(id),
  plan_session_id       TEXT,
  exercise_id           TEXT NOT NULL,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  completed_at          TIMESTAMPTZ,
  duration_seconds      INTEGER,
  success_score         INTEGER CHECK (success_score BETWEEN 1 AND 5),
  difficulty            TEXT CHECK (difficulty IN ('easy', 'okay', 'hard')),
  notes                 TEXT,
  step_results          JSONB DEFAULT '[]',
  abandoned             BOOLEAN DEFAULT FALSE,
  -- Live coaching fields (PR-16)
  live_coaching_used    BOOLEAN DEFAULT FALSE,
  live_coaching_summary JSONB,
  pose_metrics          JSONB,
  -- Post-session reflection (PR-17)
  post_session_reflection JSONB  -- PostSessionReflection | null
);
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

#### `articles`

```sql
CREATE TABLE articles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  slug             TEXT NOT NULL UNIQUE,
  title            TEXT NOT NULL,
  excerpt          TEXT NOT NULL,
  content          JSONB NOT NULL,           -- block-based content array
  category         TEXT NOT NULL,
  difficulty       TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  read_time_minutes INTEGER NOT NULL,
  is_featured      BOOLEAN NOT NULL DEFAULT false,
  is_published     BOOLEAN NOT NULL DEFAULT true,
  cover_image_url  TEXT,
  tags             TEXT[] NOT NULL DEFAULT '{}',
  sort_order       INTEGER NOT NULL DEFAULT 0
);
```

RLS: authenticated users can SELECT where `is_published = true`.

#### `walk_logs`, `streaks`, `walk_streaks`, `milestones`

These tables are unchanged from prior PRs. See PR-07 migration for schema.

#### `coach_conversations` and `coach_messages`

Unchanged from PR-06. One active conversation per (user, dog) pair enforced by partial unique index from PR-09.

#### `skill_nodes` and `skill_edges`, `dog_learning_state`, `learning_signals`, `plan_adaptations`, `adaptation_audit`, `in_app_notifications`

Unchanged from PRs 11–15. See respective migrations for schema.

### 5.2 Row Level Security Policies

All tables have RLS enabled. Users can only read/write their own data. Protocols and published articles are readable by all authenticated users.

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
-- Articles
CREATE INDEX articles_slug_idx ON articles (slug);
CREATE INDEX articles_category_idx ON articles (category);
CREATE INDEX articles_is_published_idx ON articles (is_published);
CREATE INDEX articles_is_featured_idx ON articles (is_featured);
-- Multi-course plans
CREATE UNIQUE INDEX plans_dog_primary_active_unique ON plans (dog_id)
  WHERE (is_primary = true AND status = 'active');
```

---

## 6. AI & ML Systems

### 6.1 AI Coach — Full Architecture

Every message sent to Claude is preceded by context assembly in the `ai-coach-message` Edge Function:

```typescript
async function assembleCoachContext(userId, dogId, conversationId): Promise<CoachContext> {
  const dog = await fetchDog(dogId)
  const plan = await fetchActivePlan(dogId)
  const recentSessions = await fetchRecentSessions(dogId, 7)
  const recentWalks = await fetchRecentWalks(dogId, 7)
  const history = await fetchConversationHistory(conversationId, 20)
  const learningState = await fetchDogLearningState(dogId)
  const relevantProtocols = await retrieveRelevantProtocols(dog.behavior_goals, plan?.goal)
  return { dog, plan, recentSessions, recentWalks, history, learningState, relevantProtocols }
}
```

**API Configuration:**
```typescript
const COACH_CONFIG = {
  model: 'claude-sonnet-4-6',
  max_tokens: 600,
}
```

### 6.2 Adaptive Plan Generation Engine

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
5. Result stored in `plans.sessions` JSONB with `course_title`, `priority`, `is_primary`

**Rules-based fallback** (`lib/adaptivePlanning/initialPlanner.ts`): Used when Claude API call fails.

**Schedule engine** (`lib/scheduleEngine.ts`):
- `normalizeTrainingSchedulePrefs(prefs, fallback)` — per-plan schedule normalization
- `buildWeeklySchedule()` — generates full week schedule with `PlanSession` objects
- `getTodaySession(plan)` — today's session for a single plan
- `getUpcomingSessions(plan, limit)` — future sessions for a single plan
- `getMissedScheduledSessions(plan)` — overdue sessions for a single plan
- `rescheduleMissedSession(plan, sessionId)` — moves a missed session to the next available slot
- `getPlanCompletion(plan)` — completion percentage for a single plan

**Merged schedule** (`lib/mergedSchedule.ts`):
- `mergeActivePlanSchedules(plans, options): MergedScheduleResult` — pure function; merges sessions across all active plans; applies recommendation algorithm:
  1. Oldest overdue session across all plans (if any)
  2. Highest-priority today session (primary plan wins, then `plan.priority`, then time, then stable ID)
  3. Nearest upcoming session if nothing is due
- `groupEnrichedSessionsByDate(sessions)` — groups by date for calendar
- `getAllSessionsForCalendar(plans)` — all sessions (any status) for full calendar render
- `flattenMergedSchedule(result)` — flattens missed + today + upcoming
- `enrichSession(session, plan)` — adds `planId`, `planGoal`, `planCourseTitle`, `isPrimaryPlan` to a `PlanSession`

**Add-course flow** (`lib/addCourse.ts`, `lib/addCourseUtils.ts`):
- `addCourse(options): Promise<AddCourseResult>` — orchestrates generating a plan and inserting it with correct multi-course fields
- Enforces `MAX_ACTIVE_COURSES = 2`; rejects duplicate active goals
- Calls `generate-adaptive-plan` Edge Function; falls back to rules-based generator

### 6.3 Course Color System (`constants/courseColors.ts`)

Colors are assigned deterministically per plan ID — never persisted to the database.

```typescript
// 10-color palette
const COURSE_COLOR_PALETTE = [
  '#2563EB', '#0F766E', '#7C3AED', '#DC2626', '#CA8A04',
  '#0891B2', '#C2410C', '#BE185D', '#4F46E5', '#15803D',
]

// Goal → canonical color mapping
const GOAL_COLORS = {
  leash_pulling: '#4F46E5',   // Indigo
  jumping_up:   '#0891B2',   // Cyan
  barking:      '#BE185D',   // Rose
  recall:       '#15803D',   // Green
  potty_training:'#CA8A04',  // Amber
  crate_anxiety: '#7C3AED',  // Violet
  puppy_biting:  '#C2410C',  // Orange
  settling:      '#0F766E',  // Teal
  fallback:      '#6B7280',  // Gray
}
```

**Key functions:**
- `getCourseColor(source)` — primary solid color, assigned via hash of `plan.id` (or goal string for goal-based theming)
- `getCourseUiColors(source): CourseUiColors` — full derived theme: `solid`, `tint`, `soft`, `border`, `text`, `contrastText`, `selectedSurface`, `selectedBorder`, `mutedDot`
- `getCoursePillColors(source, isSelected): CoursePillColors` — pill UI theming (selected = solid fill, unselected = neutral with colored border/dot)
- `getContrastTextColor(hex)` — WCAG-based contrast check → `'#FFFFFF'` or `'#0F172A'`
- `hexToRgba(hex, alpha)` — tinted background utility
- `normalizeGoalKey(goal)` — stable lowercase/underscore goal normalization
- `resolveSelectedCourseTheme(plansById, activePlanIds, selectedPlanId)` — convenience selector for the currently displayed course theme

### 6.4 Adaptive Planning Engine (`lib/adaptivePlanning/`)

**Learning State System:**
- `learningSignals.ts` — extracts signals from `session_logs` (including `post_session_reflection`) and `walk_logs`
- `learningStateEngine.ts` — processes signals to update `DogLearningState`
- `learningStateScoring.ts` — scores 7 dimensions: motivation, distraction sensitivity, confidence, impulse control, handler consistency, fatigue risk, recovery speed
- `hypothesisEngine.ts` — generates learning hypotheses from patterns; incorporates reflection evidence

**Adaptation Engine:**
- `adaptationRules.ts` — defines triggers including reflection-based rules:
  - Repeated hard/abandoned sessions → regress; consistent easy sessions with high scores → advance
  - `understandingIssue` signal → regress to foundation
  - `distractionIssue` signal → lower environment difficulty
  - `arousalIssue` signal → simplify and shorten sessions
  - `handlerFrictionIssue` signal → conservative adjustments
- `adaptationEngine.ts` — evaluates rules against learning state and reflection signals
- `adaptationCompiler.ts` — converts adaptation decisions into plan mutations; may insert support sessions with `insertedByAdaptation: true`
- `adaptationAudit.ts` — writes audit trail to `adaptation_audit` table

**Adaptation Types:**
- `repeat`, `regress`, `advance`, `detour`, `difficulty_adjustment`, `schedule_adjustment`, `environment_adjustment`

**Adaptation Reason Codes:**
- Standard: `low_success_score`, `high_difficulty_reports`, `consistent_easy`, `consecutive_abandons`
- Reflection-derived: `reflection_understanding_gap`, `reflection_distraction_blocker`, `reflection_duration_breakdown`, `reflection_over_arousal`, `reflection_handler_friction`

**Support Sessions:** The adaptation compiler may insert sessions with `insertedByAdaptation: true` and `supportSessionType`: `'foundation' | 'transition' | 'duration_building' | 'calm_reset'`.

### 6.5 Post-Session Reflection System (`lib/adaptivePlanning/reflectionQuestion*`)

#### Question Selection Engine (`reflectionQuestionEngine.ts`)

```typescript
function buildPostSessionReflectionQuestions(
  input: ReflectionQuestionEngineInput
): ReflectionQuestionConfig[]
```

**Selection Rules (A–G):**
- **Rule A (Core):** Always ask `overallExpectation`. Skip `mainIssue` only for clean easy sessions.
- **Rule B (Failure Timing):** Ask `failureTiming` when session was hard or abandoned.
- **Rule C (Distraction):** Ask `distractionType` when environment inconsistency detected or `distractionSensitivity >= 4`.
- **Rule D (Cue Understanding):** Ask `cueUnderstanding` when failure appears early or repeated low-success on skill.
- **Rule E (Arousal):** Ask `arousalLevel` when 3+ recent sessions abandoned/hard.
- **Rule F (Handler Issue):** Ask `handlerIssue` when `handlerConsistencyScore <= 2` or `inconsistencyIndex >= 0.35`.
- **Rule G (Confidence):** Ask `confidenceInAnswers` when session abandoned OR mixed recent signals.

Output: 2–4 questions max.

#### Question Catalog (`reflectionQuestionCatalog.ts`)

8 pre-defined question configs: `overallExpectation` (required), `mainIssue` (required), `failureTiming`, `distractionType`, `cueUnderstanding`, `arousalLevel`, `handlerIssue`, `confidenceInAnswers`.

#### Reflection Signal Extraction (`learningSignals.ts`)

```typescript
interface ReflectionSignals {
  understandingIssue: number     // 0–1, confidence-weighted
  distractionIssue: number       // 0–1, confidence-weighted
  durationBreakdownIssue: number // 0–1, confidence-weighted
  arousalIssue: number           // 0–1, confidence-weighted
  handlerFrictionIssue: number   // 0–1, confidence-weighted
  reflectionConfidence: number   // 0–1, raw
}
```

Each signal is weighted by the handler's `confidenceInAnswers` rating (1–5 → 0–1 scale).

### 6.6 Milestone Engine (`lib/milestoneEngine.ts`)

13 milestones: `first_session`, `streak_3`, `streak_7`, `streak_14`, `streak_30`, `sessions_10`, `sessions_25`, `sessions_50`, `stage_advance`, `walk_streak_5`, `walk_streak_14`, `walk_improvement`, `first_video`.

### 6.7 On-Device Dog Pose Detection

Real-time pose estimation runs on-device using TFLite, used by the Live Camera Coach session mode. Requires a native dev build (not Expo Go).

**Pipeline:**
```
Camera Frame (Vision Camera v4)
    ↓ Frame Processor (JS Worklet, every 10th frame)
    ↓ vision-camera-resize-plugin (640×640 RGB float32)
    ↓ react-native-fast-tflite (sync inference)
    ↓ poseDecoder.ts → PoseObservation { keypoints, bbox }
    ↓ poseOutlierRejection.ts
    ↓ poseStabilizer.ts (One-Euro filter)
    ↓ poseFeatureExtractor.ts
    ↓ postureClassifier.ts → PostureLabel (sit/down/stand/unknown)
    ↓ poseStateMachine.ts
    ↓ poseTrackingQuality.ts → TrackingQuality (good/fair/poor)
    ↓ poseEventDetector.ts
    ↓ liveCoachingEngine.ts → CoachingDecision
    ↓ LiveCoachOverlay (UI feedback)
```

**Model I/O:** Input `[1, 640, 640, 3]` float32; Output `[1, 77, 8400]` D-first tensor (24 keypoints × 3 values). Detection threshold ≥ 0.35; keypoint visibility threshold ≥ 0.35.

**Skeleton Visualization:** SVG overlay with color-coded limb groups (blue=head, gold=spine, green=front-left, purple=front-right, pink=rear-left, orange=rear-right). Dual-pass rendering: glow stroke + core stroke.

### 6.8 Insight Generation

Weekly cron job generates personalized insights per dog using Claude (`generate-insights` Edge Function). Not yet displayed in-app.

---

## 7. API Specification

### 7.1 API Design Principles

- RESTful endpoints via Supabase PostgREST + custom Edge Functions
- All requests authenticated via JWT from Supabase Auth
- ISO 8601 timestamps throughout
- Snake_case in DB; camelCase in TypeScript (converted by `lib/modelMappers.ts`)

### 7.2 Key Endpoints

#### Plans
```
POST   /functions/v1/generate-adaptive-plan   Generate AI-powered plan (used for first plan and add-course)
POST   /functions/v1/adapt-plan               Trigger plan adaptation
GET    /rest/v1/plans?dog_id=eq.{id}&status=eq.active&order=priority.desc  Get all active plans
PATCH  /rest/v1/plans?id=eq.{id}             Update plan (sessions, status, course fields)
```

#### Articles
```
GET    /rest/v1/articles?is_published=eq.true         Article library
GET    /rest/v1/articles?slug=eq.{slug}&single=true   Single article by slug
```

#### Sessions
```
GET    /rest/v1/protocols?id=eq.{id}                  Fetch session protocol
POST   /rest/v1/session_logs                          Log completed session
GET    /rest/v1/session_logs?dog_id=eq.{id}           Session history
```

#### Authentication, Dog Profile, Walk Logs, AI Coach, Videos, Progress, Adaptive Planning, Notifications

Unchanged from prior PRs — see existing endpoint patterns.

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

Email/password + Apple Sign In + Google OAuth. Tokens stored via `ExpoSecureStoreAdapter`. Access token: 1 hour; refresh token: 30 days.

### 8.2 Authorization Model

| Action | Free | Core | Premium |
|---|---|---|---|
| Create dog profile | ✓ | ✓ | ✓ |
| Complete first session | ✓ | ✓ | ✓ |
| View full 4-week plan | — | ✓ | ✓ |
| Unlimited sessions | — | ✓ | ✓ |
| AI coach (limited) | 5/day | ✓ | ✓ |
| AI coach (unlimited) | — | ✓ | ✓ |
| Video upload | 1 total | 20/day | Unlimited |
| Add second course | — | ✓ | ✓ |
| Family mode | — | — | ✓ |
| Annual report | — | ✓ | ✓ |

*Note: Subscription purchase UI is not yet implemented. Subscription tier is tracked in the store and enforces free-tier gating in plan-preview.tsx.*

### 8.3 Post-Auth Onboarding Flow

When a user signs up from the onboarding flow (via `plan-preview.tsx` → `signup.tsx?from=onboarding`), the signup screen creates the account, reads saved `onboardingStore` state, calls `onboardingStore.submitOnboarding()` to persist dog + plan to DB, then redirects back to `plan-preview`.

---

## 9. Video Pipeline

### 9.1 Upload Flow

```
User selects video via expo-image-picker
        ↓
Local file read via expo-file-system
        ↓
Upload to Supabase Storage: pawly-videos/{userId}/{dogId}/{timestamp}_{uuid}.mp4
        ↓
Insert video record to videos table
```

### 9.2 Video Types

Tagged with `context` field: `onboarding`, `session`, `behavior`.

---

## 10. Notifications & Reminders

### 10.1 Architecture

```
User sets preferences in Notification Settings screen
        ↓
notificationStore.updatePrefs() saves to user_profiles.notification_prefs
        ↓
notificationStore.refreshSchedules(dog) cancels + reschedules local notifications
        ↓
lib/notifications.scheduleUserNotifications() creates Expo local notifications
        ↓
Expo Notifications delivers via APNs (iOS) or FCM (Android)
```

In-app notifications are written to `in_app_notifications` by Edge Functions and displayed in the notification center. `notificationStore` subscribes to realtime inserts.

### 10.2 Notification Preferences Schema

```typescript
interface NotificationPrefs {
  dailyReminder: boolean
  dailyReminderTime: string         // "HH:MM"
  walkReminders: boolean
  postWalkCheckIn: boolean
  streakAlerts: boolean
  milestoneAlerts: boolean
  insights: boolean
  lifecycle: boolean
  weeklySummary: boolean
  scheduledSessionReminders: boolean
  reminderLeadMinutes: number
  fallbackMissedSessionReminders: boolean
}
```

---

## 11. Payments & Subscriptions

- RevenueCat dependency (`react-native-purchases`) is included but **not initialized**
- `authStore.subscriptionTier` tracks 'free' | 'core' | 'premium'
- Free-tier gating enforced in `plan-preview.tsx` (blurs weeks 2–4 for free users)
- No purchase UI or RevenueCat initialization is currently implemented

---

## 12. Analytics & Event Tracking

`lib/analytics.ts` provides `captureEvent(event, properties?)`. In development, events are logged to console only. PostHog and Sentry dependencies are included but not initialized.

---

## 13. Infrastructure & DevOps

### 13.1 Supabase Project Configuration

```
Project: pawly-production
Region: us-east-1
Database: PostgreSQL 15
Storage: Supabase Storage (S3-compatible), bucket: pawly-videos
Edge Functions: Deno Deploy
Auth: Supabase Auth
```

### 13.2 Expo EAS Configuration

Three build profiles: `development` (dev client, internal), `preview` (internal, staging env), `production` (app store submission).

**Note:** Pose detection (react-native-vision-camera, react-native-fast-tflite) requires a native dev build. Does not work in Expo Go.

### 13.3 CI/CD Pipeline

GitHub Actions on push to main: typecheck → test → lint → deploy edge functions → EAS build.

### 13.4 npm Scripts

```json
{
  "start": "expo start",
  "ios": "expo run:ios",
  "android": "expo run:android",
  "typecheck": "tsc --noEmit",
  "test": "node --test --experimental-strip-types tests/*.test.ts"
}
```

---

## 14. Security & Privacy

### 14.1 Data Classification

| Data Type | Classification | Storage |
|---|---|---|
| User credentials | Sensitive | Supabase Auth (hashed) |
| Dog profile data | Personal | PostgreSQL (RLS) |
| Training videos | Personal | Supabase Storage (private) |
| Session logs | Personal | PostgreSQL (RLS) |
| Post-session reflections | Personal | PostgreSQL (RLS, JSONB in session_logs) |
| Chat messages | Personal | PostgreSQL (RLS) |
| Pose metrics | Personal | PostgreSQL (RLS, JSONB in session_logs) |

### 14.2 AI Safety Guardrails

Claude API system prompt enforces hard limits: no medical diagnoses, no aversive/punishment methods, no specific treatment guarantees, strong referral recommendation for bite history or severe aggression.

---

## 15. Third-Party Integrations

| Service | Purpose | Status |
|---|---|---|
| Supabase | Backend, auth, storage, DB | ✅ Active |
| Anthropic (claude-sonnet-4-6) | AI coach + plan generation | ✅ Active (Edge Functions) |
| RevenueCat | Subscriptions | ⏳ Dependency only, not initialized |
| Expo Notifications | Local + push notifications | ✅ Active (local scheduling) |
| PostHog | Analytics | ⏳ Dependency only, not initialized |
| Sentry | Error tracking | ⏳ Dependency only, not initialized |
| Apple Authentication | Apple Sign In | ✅ Active |
| Vision Camera v4 | Camera frame processing | ✅ Active (native build only) |
| react-native-fast-tflite | Dog pose inference | ✅ Active (native build only) |

---

## 16. Error Handling & Logging

| Error Type | Handling | User Message |
|---|---|---|
| Network timeout | Retry 3x with exponential backoff | "Having trouble connecting. Trying again…" |
| AI coach failure | Show rate limit error state | "Coach is temporarily unavailable." |
| AI coach rate limit | Set `rateLimitError` flag in coachStore | "You've reached your coaching limit for today." |
| Plan generation failure | Fall back to rules-based planner | Silent — user receives plan regardless |
| Video upload failure | Queue and retry on reconnect | "Video saved to retry when connection improves." |
| Auth expiry | Auto-refresh or redirect to login | "Session expired. Please log in again." |
| Pose detection unavailable | Fall back to manual session mode | Mode picker omits Live Camera option |
| Reflection normalization failure | Treat as null | Silent — session saved without reflection data |

---

## 17. Performance Requirements

| Metric | Target | Critical Threshold |
|---|---|---|
| App cold start | < 2 seconds | > 4 seconds |
| Today screen load | < 500ms | > 1.5 seconds |
| Session screen load | < 300ms | > 1 second |
| AI coach first response | < 3 seconds | > 6 seconds |
| Plan generation | < 4 seconds | > 10 seconds |
| Pose detection inference | ~10 FPS (100ms/frame) | < 5 FPS |
| Live coaching frame latency | < 150ms end-to-end | > 300ms |
| `mergeActivePlanSchedules()` | < 5ms (pure function) | > 50ms |
| Reflection question engine | < 5ms (pure function) | > 50ms |

---

## 18. Testing Strategy

### 18.1 Test Runner

Node.js `test` module + `assert/strict`. No React Native dependencies for pure logic tests.

```bash
npm test
# → node --test --experimental-strip-types tests/*.test.ts
```

### 18.2 Test Coverage

| Test File | Coverage Area |
|---|---|
| `scheduleEngine.test.ts` | Per-plan session logic: today, upcoming, missed, reschedule |
| `mergedSchedule.test.ts` | Cross-plan merge, recommendation algorithm, tie-break order, deduplication |
| `courseColors.test.ts` | Color utilities: goal normalization, contrast, pill colors, hash stability |
| `multiCourseUI.test.ts` | Multi-course UI scenarios: course switcher, session lookup, calendar grouping |
| `addCourse.test.ts` | Add-course flow: duplicate detection, max-courses enforcement, plan insertion |
| `reflectionQuestionEngine.test.ts` | Rules A–G, question selection logic, edge cases |
| `reflectionSignals.test.ts` | Signal extraction and confidence weighting |
| `reflectionAdaptation.test.ts` | Reflection signal → adaptation rule mapping |
| `reflectionPersistence.test.ts` | Saving and loading reflection data |
| `postSessionReflection.test.ts` | Reflection UI state |
| `postSessionReflectionUI.test.ts` | UI state, step flow |
| `reflectionPolish.test.ts` | Edge cases |

---

## 19. Release & Deployment

### 19.1 App Store Requirements

**iOS:** Minimum iOS 16.0; Apple Sign In required; camera usage description required.
**Android:** Minimum API level 31; target API level 34; camera permission required.

### 19.2 OTA Update Strategy

Expo Updates (EAS Update) for JavaScript-layer changes. Binary release required for native module changes, Expo SDK upgrades, new permissions, TFLite model updates.

---

## 20. V1 Scope Boundaries

### 20.1 What V1 Includes (Implemented)

- Full onboarding wizard (dog profile, goals, environment, optional video, schedule preferences)
- AI-powered plan generation (Claude API) with rules-based fallback
- **Multi-course training** — up to 2 simultaneous active plans per dog:
  - Add-course screen and enrollment flow (`lib/addCourse.ts`)
  - Per-goal color theming (`constants/courseColors.ts`) — deterministic, no DB persistence
  - Merged daily view and calendar (`lib/mergedSchedule.ts`)
  - Course switcher UI (plan screen, today screen)
  - DB columns: `course_title`, `priority`, `is_primary` on `plans`
- Schedule engine (preferred days/windows, automatic rescheduling of missed sessions)
- Session execution — manual mode (timer, rep counter, step guide) and Live Camera Coach mode (on-device TFLite pose detection, real-time rep counting and posture feedback — native build only)
- Post-session reflection system (structured handler feedback, dynamic question engine Rules A–G, reflection signals feeding adaptive planning)
- Walk integration (daily goal, 3-point quality logging, walk streak)
- AI coach (Claude-powered, full dog context + learning state, conversation history, formatted markdown responses)
- Progress tracking (session streak, walk streak, behavior score progression, 13 milestones, shareable milestone cards)
- Training calendar (monthly view, merged multi-course sessions, support session metadata display)
- Adaptive planning engine (skill graph, 7-dimension learning state, adaptation rules, audit trail, reflection signal integration, support session insertion)
- Video upload (storage, context tagging)
- In-app notification center (realtime inbox, unread count)
- Notification preferences UI (13 configurable notification types, local scheduling)
- Theme selection (system / light / dark)
- Authentication (email, Apple Sign In, Google OAuth, password reset)
- Know tab — Supabase-backed article library with block-based content renderer

### 20.2 What V1 Explicitly Excludes (Not Yet Built)

- Subscription purchase UI / RevenueCat initialization
- Dog profile editing screen (post-onboarding)
- Insights feed display inside Know
- PostHog analytics initialization and event tracking to backend
- Sentry error tracking initialization
- Server-side push notification triggers (currently local-only)
- Household / family sharing
- AI video analysis
- Lifecycle curriculum automation
- Annual report
- More than 2 simultaneous active courses per dog

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
    "expo-file-system": "~18.0.11",
    "expo-apple-authentication": "~7.1.3",
    "expo-av": "~15.0.2",
    "@react-native-async-storage/async-storage": "1.23.1"
  }
}
```
