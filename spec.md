# Pawly — Technical Specification
**Version:** 1.6
**Date:** March 19, 2026
**Status:** Current (updated to reflect removal of on-device pose detection and migration to server-side Live AI Trainer)

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

Pawly is a mobile-first subscription application that delivers personalized dog training plans, AI-powered coaching, video feedback, and a lifecycle content system across the full lifespan of a dog. The system maintains a persistent behavioral memory of each dog and adapts its guidance based on ongoing session outcomes, structured post-session handler reflections, user-submitted video, and lifecycle stage. Sessions can be completed in manual mode or via a **Live AI Trainer** mode that uses server-side analysis (Supabase Edge Functions) to provide real-time guidance and feedback. A dog can have up to two simultaneously active training courses, each with its own plan and schedule that are merged into a unified daily view.

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
- **Server-side Live AI Trainer:** Live coaching uses the `live-ai-trainer` Edge Function to analyze frames/context and return real-time feedback
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
| Live AI Trainer | Supabase Edge Function `live-ai-trainer` | Real-time analysis and feedback generation |
| Camera | react-native-vision-camera v4 | High-performance camera capture |
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
│   ├── (onboarding)/             # Onboarding flow
│   └── (tabs)/                   # Main authenticated tab navigator
│       ├── train/
│       │   ├── index.tsx         # Today card / home screen (multi-course aware)
│       │   ├── calendar.tsx      # Monthly training calendar
│       │   ├── session.tsx       # Active session screen (Manual + Live AI Trainer)
│       │   ├── plan.tsx          # Full plan view with course switcher
│       │   ├── add-course.tsx    # Add a second training course
│       │   ├── notifications.tsx # In-app notification center
│       │   └── upload-video.tsx  # Video upload
│       ├── progress/
│       ├── coach/
│       ├── know/
│       └── profile/
├── components/                   # Reusable components
│   ├── ui/                       # Button, Text, Input, Card, etc.
│   ├── session/                  # TimerRing, RepCounter, StepCard, SessionModePicker, LiveAiTrainerOverlay
│   ├── coach/                    # MessageBubble, FormattedCoachMessage
│   ├── vision/                   # LiveAiTrainerOverlay
│   └── adaptive/                 # LearningInsightCard, AdaptationNotice
├── stores/                       # Zustand state stores
│   ├── authStore.ts
│   ├── dogStore.ts
│   ├── sessionStore.ts
│   ├── planStore.ts
│   ├── coachStore.ts
│   ├── progressStore.ts
│   └── notificationStore.ts
├── hooks/
│   └── useLiveAiTrainerSession.ts # Live AI Trainer session hook
├── lib/                          # Utilities and service helpers
│   ├── supabase.ts               # Supabase client
│   ├── planGenerator.ts          # Plan building logic
│   ├── scheduleEngine.ts         # Per-plan schedule logic
│   ├── mergedSchedule.ts         # Cross-plan merge layer
│   ├── sessionManager.ts         # Session saving, streaks, milestones
│   ├── modelMappers.ts           # DB row → TypeScript mappers
│   ├── adaptivePlanning/         # Full adaptive planning engine
│   └── liveCoach/                # Live AI Trainer types and helpers
├── tests/                        # Unit tests
├── constants/                    # App-wide constants
└── assets/                       # Images, fonts, animations
```

### 3.2 Navigation Architecture

Unchanged from v1.5.

### 3.3 State Management

Unchanged from v1.5.

### 3.4 Offline Handling

Unchanged from v1.5.

### 3.5 Core Screens — Detailed Spec

#### Session Screen (`app/(tabs)/train/session.tsx`)

Purpose: Guide the user through a training session. Supports two execution modes: Manual and Live AI Trainer.

**Session State Machine:**
```
LOADING
  ↓
INTRO
  ↓
SETUP
  ↓
MODE_PICKER     ← Choose Live AI Trainer or Do Normally
  ↓
STEP_ACTIVE     ← Show current step card
                   (Live AI Trainer mode: LiveAiTrainerOverlay manages interaction)
  ↓
STEP_COMPLETE
  ↓
SESSION_REVIEW  ← Post-session structured reflection
  ↓
COMPLETE
```

##### SessionModePicker (`components/session/SessionModePicker.tsx`)

UI:
- Two option cards:
  1. **Live AI Trainer** (featured, primary) — "Point your camera at {dogName}. Get real-time AI feedback and coaching."
  2. **Do Normally** (secondary) — "Follow the step-by-step guide and mark reps manually."

---

## 4. Backend Services

### 4.2 Edge Functions

#### `live-ai-trainer`

Triggered: during Live AI Trainer session
Input: frame data, dog context, current protocol step
Process: analysis via AI model → returns feedback, coach message, and rep count adjustments
Output: `{ feedback: string, coachMessage?: string, repsDetected?: number, status: 'ok' | 'error' }`

---

## 5. Database Schema

### 5.1 Core Tables

#### `plans`

```sql
ALTER TABLE plans
  DROP COLUMN IF EXISTS supports_live_pose_coaching,
  DROP COLUMN IF EXISTS live_coaching_config,
  ADD COLUMN IF NOT EXISTS supports_live_ai_trainer BOOLEAN NOT NULL DEFAULT FALSE;
```

#### `session_logs`

```sql
ALTER TABLE session_logs
  DROP COLUMN IF EXISTS live_coaching_summary,
  DROP COLUMN IF EXISTS pose_metrics,
  ADD COLUMN IF NOT EXISTS live_ai_trainer_summary JSONB;
```

---

## 6. AI & ML Systems

### 6.7 Live AI Trainer (Server-Side)

Live coaching utilizes a Supabase Edge Function (`live-ai-trainer`) powered by vision-capable models (e.g., Claude 3.5 Sonnet or GPT-4o) to analyze the dog's movement and provide real-time verbal and visual feedback.

**Pipeline:**
```
Camera Frame (Vision Camera v4)
    ↓ App logic (sampling / trigger based)
    ↓ Supabase Edge Function 'live-ai-trainer'
    ↓ AI Model Analysis
    ↓ Response JSON { coachMessage, feedback }
    ↓ LiveAiTrainerOverlay (UI feedback + Audio)
```

---

## 15. Third-Party Integrations

| Service | Purpose | Status |
|---|---|---|
| Supabase | Backend, auth, storage, DB, Live AI Trainer | ✅ Active |
| Anthropic | AI coach + planning + Live AI Trainer | ✅ Active |
| Vision Camera v4 | Camera frame capture | ✅ Active |

---

## 16. Error Handling & Logging

| Error Type | Handling | User Message |
|---|---|---|
| Live AI Trainer failure | Fall back to manual session mode | "I'm having trouble seeing clearly. Switching to manual mode." |

---

## 20. V1 Scope Boundaries

### 20.1 What V1 Includes (Implemented)

- ...
- Session execution — manual mode and **Live AI Trainer mode** (server-side AI feedback and guidance).
- ...

### 20.2 What V1 Explicitly Excludes (Not Yet Built)

- On-device real-time pose estimation (deprecated and removed in v1.6 in favor of server-side Live AI Trainer).
- ...
