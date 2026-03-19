# Pawly — Technical Specification
**Version:** 1.7
**Date:** May 24, 2026
**Status:** Current (Updated to reflect current codebase implementation)

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

Pawly is a mobile-first subscription application that delivers personalized dog training plans, AI-powered coaching, video feedback, and a lifecycle content system across the full lifespan of a dog. The system maintains a persistent behavioral memory of each dog and adapts its guidance based on ongoing session outcomes, structured post-session handler reflections, user-submitted video, and lifecycle stage. Sessions can be completed in manual mode or via a **Live AI Trainer** mode that uses server-side analysis (Supabase Edge Functions) to provide real-time guidance and feedback. A dog can have up to two simultaneously active training courses, each with its own plan and schedule that are merged into a unified daily view via `lib/mergedSchedule.ts`.

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
Daily Session Loop (Manual Mode or Live AI Trainer Mode) + Walk Logging
     ↓
Post-Session Reflection (structured handler feedback captured after each session)
     ↓
AI Coach Available Throughout (Coach Tab)
     ↓
Training Tools (Clicker & Whistle) available for reinforcement
     ↓
Plan Adapts Based on Session Outcomes + Reflection Signals (Adaptive Planning)
     ↓
Progress Tracked → Streaks → Milestones
     ↓
Add Second Course (optional — up to 2 active courses per dog)
```

### 1.3 Product Zones

| Zone | Name | Purpose | V1 Status |
|---|---|---|---|
| 1 | Train | Behavior problem solving, daily schedules, and training tools | ✅ Implemented |
| 2 | Progress | Streaks, behavior scores, milestones, walk data, and learning insights | ✅ Implemented |
| 3 | Coach | AI-powered conversational training coach | ✅ Implemented |
| 4 | Know | Supabase-backed article library and in-app reader for dog training education | ✅ Implemented |
| 5 | Profile | Settings, notifications, theme, and subscription management | ✅ Implemented |

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

- **Supabase-first for v1:** Use Supabase for database, auth, storage, and real-time.
- **Edge functions for lightweight logic:** Supabase Edge Functions (Deno) handle plan generation, AI calls, and event processing.
- **Stateless API layer:** All application state lives in the database or client-side persistent stores (Zustand + AsyncStorage).
- **AI-driven adaptive planning:** Plan generation uses Claude API via `generate-adaptive-plan` Edge Function. The `lib/adaptivePlanning` module handles post-session reflection logic to provide high-quality signals for adaptation.
- **Server-side Live AI Trainer:** Live coaching uses the `live-ai-trainer` Edge Function to analyze frames/context and return real-time feedback via vision models.
- **Multi-course scheduling:** A dog can have up to 2 active training plans. `lib/mergedSchedule.ts` merges these into a single prioritized daily view (Overdue > Today > Upcoming).
- **Deterministic course colors:** Colors are assigned from a fixed palette via `constants/courseColors.ts`.

### 2.3 Technology Stack Summary

| Layer | Technology | Rationale |
|---|---|---|
| Mobile | Expo + React Native + TypeScript | Cross-platform, fast iteration |
| Styling | NativeWind (Tailwind CSS) | Utility-first styling with dark mode support |
| State Management | Zustand | Lightweight, minimal boilerplate |
| Navigation | Expo Router (file-based) | Native feel, deep linking support |
| Backend | Supabase | Full backend in one service for v1 |
| AI Coach | Anthropic Claude API | Best conversational quality, context handling |
| AI Planning | Anthropic Claude API | Personalized plan generation |
| Live AI Trainer | Supabase Edge Function `live-ai-trainer` | Real-time analysis and feedback generation |
| Camera | react-native-vision-camera v4 | High-performance camera capture |
| Audio | expo-av | Playback for training tools (Clicker/Whistle) |
| Haptics | Vibration API | Immediate tactile feedback |

---

## 3. Mobile Application

### 3.1 Project Structure

```
pawly/
├── app/                          # Expo Router file-based navigation
│   ├── (auth)/                   # Welcome, Login, Signup, Forgot Password
│   ├── (onboarding)/             # Dog Basics, Photo, Environment, Problems, Plan Preview
│   └── (tabs)/                   # Main authenticated tab navigator
│       ├── train/
│       │   ├── index.tsx         # Today card / home screen (multi-course aware)
│       │   ├── calendar.tsx      # Monthly training calendar
│       │   ├── session.tsx       # Active session screen
│       │   ├── plan.tsx          # Full plan view with course switcher
│       │   ├── tools.tsx         # Training Tools (Clicker, Whistle)
│       │   └── add-course.tsx    # Add a second training course
│       ├── progress/
│       │   ├── index.tsx         # Streaks, Behavior Scores, Learning Insights
│       │   └── milestones.tsx    # Achievement list
│       ├── coach/                # AI Assistant chat
│       ├── know/                 # Article library & [slug] reader
│       └── profile/              # Settings & Notifications
├── components/                   # UI components
│   ├── adaptive/                 # LearningInsightCard
│   ├── coach/                    # FormattedCoachMessage
│   ├── session/                  # StepCard, RepCounter, TimerRing, PostSessionReflectionCard
│   ├── ui/                       # Reusable primitives (Button, Text, etc.)
│   └── vision/                   # LiveAiTrainerOverlay
├── stores/                       # Zustand state stores (auth, dog, plan, session, etc.)
├── hooks/                        # useLiveAiTrainerSession, useTrainingToolAudio, etc.
├── lib/                          # Utilities (mergedSchedule, sessionManager, adaptivePlanning)
├── constants/                    # colors, courseColors, protocols, spacing, etc.
└── tests/                        # Unit tests
```

### 3.2 Navigation Architecture

The app uses **Expo Router** with a root `_layout.tsx` managing the `RootNavigationGate`.
- **(auth)**: Stack navigator for unauthenticated users.
- **(onboarding)**: Sequential flow for new dog registration.
- **(tabs)**: Main application interface with 5 tabs.

### 3.5 Core Screens — Detailed Spec

#### Session Screen (`app/(tabs)/train/session.tsx`)

Supports **Manual** and **Live AI Trainer** modes.
- **LocalOverlayState**: `NONE` | `MODE_PICKER` | `LIVE_COACHING`.
- **Session State Machine**: `LOADING` → `INTRO` → `SETUP` → (`MODE_PICKER` if supported) → `STEP_ACTIVE` → `STEP_COMPLETE` → `SESSION_REVIEW` → `COMPLETE`.
- **Post-Session Reflection**: Integrated at the end of every session to collect behavioral signals (difficulty, distraction types, arousal levels).

#### Progress Screen (`app/(tabs)/progress/index.tsx`)

- **Streaks**: Session and Walk streaks.
- **Behavior Progress**: Track current stage vs. total stages for active goals.
- **Learning Insights**: Dynamic cards showing `dogLearningState` (distraction sensitivity, confidence, etc.).
- **Charts**: Session frequency (month) and Walk quality trends.

#### Training Tools (`app/(tabs)/train/tools.tsx`)

- **Clicker**: Digital clicker with haptic feedback.
- **Whistle**: Variable duration whistle sounds.
- Uses `onPressIn` for zero-latency response.

---

## 4. Backend Services

### 4.2 Edge Functions

- `generate-adaptive-plan`: Creates personalized training schedules.
- `live-ai-trainer`: Analyzes camera frames during live sessions.
- `ai-coach-message`: Powers the conversational assistant.

---

## 5. Database Schema

### 5.1 Core Tables

- `dogs`: Profile, age, breed, environment, and learning state JSON.
- `plans`: Course goal, status, sessions JSON, and `supports_live_ai_trainer` flag.
- `session_logs`: Historical data, including `live_ai_trainer_summary` and `post_session_reflection`.
- `milestones`: Tracked achievements for each dog.
- `articles`: Educational content for the **Know** tab.

---

## 6. AI & ML Systems

### 6.1 Adaptive Planning Engine

Located in `lib/adaptivePlanning/`.
- **Reflection Engine**: `reflectionQuestionEngine.ts` dynamically selects post-session questions based on session outcome and `dogLearningState`.
- **Signals**: Captures "Handler Consistency", "Distraction Sensitivity", and "Cue Understanding".

### 6.7 Live AI Trainer

Uses a vision-capable AI model via the `live-ai-trainer` Edge Function.
- **Input**: Sampled frames + Protocol context.
- **Output**: Real-time feedback messages and automatic rep detection.

---

## 18. Testing Strategy

- **Unit Tests**: Located in `tests/`, covering core logic like `mergedSchedule.test.ts`, `planGenerator.test.ts`.
- **Runner**: Node.js native test runner with `--experimental-strip-types`.

---

## 20. V1 Scope Boundaries

### 20.1 What V1 Includes (Implemented)

- Multi-course management (up to 2 concurrent plans).
- Manual and Live AI Trainer session execution.
- Adaptive post-session reflection engine.
- Progress tracking with streaks, milestones, and learning insights.
- Educational article library.
- Digital training tools (Clicker/Whistle).

### 20.2 What V1 Explicitly Excludes

- On-device TFLite pose detection (replaced by server-side vision).
- Social features/Community.
- Full e-commerce/Marketplace.
- Multi-dog support (v1 is single dog per user).
