# Pawly — Technical Specification
**Version:** 1.6
**Date:** March 19, 2026
**Status:** Current (updated to reflect removal of on-device pose detection, migration to server-side Live AI Trainer, and addition of training tools)

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
11. [Analytics & Event Tracking](#11-analytics--event-tracking)
12. [Infrastructure & DevOps](#12-infrastructure--devops)
13. [Security & Privacy](#13-security--privacy)
14. [Third-Party Integrations](#14-third-party-integrations)
15. [Error Handling & Logging](#15-error-handling--logging)
16. [Performance Requirements](#16-performance-requirements)
17. [Testing Strategy](#17-testing-strategy)
18. [Release & Deployment](#18-release--deployment)
19. [V1 Scope Boundaries](#19-v1-scope-boundaries)

---

## 1. System Overview

### 1.1 What Pawly Is

Pawly is a mobile-first application (with a subscription-based revenue model in development) that delivers personalized dog training plans, AI-powered coaching, video feedback, integrated training tools, and a lifecycle content system across the full lifespan of a dog. The system maintains a persistent behavioral memory of each dog and adapts its guidance based on ongoing session outcomes, structured post-session handler reflections, user-submitted video, and lifecycle stage. Sessions can be completed in manual mode or via a **Live AI Trainer** mode that uses server-side analysis (Supabase Edge Functions) to provide real-time guidance and feedback. A dog can have up to two simultaneously active training courses, each with its own plan and schedule that are merged into a unified daily view.

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
Training Tools (Digital Clicker & Whistle available for all sessions)
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
| 5 | Profile | Settings, notifications, and theme preferences | ✅ Implemented |
| 6 | Tools | Digital training tools (Clicker, Whistle) with audio and haptic feedback | ✅ Implemented |

### 1.4 Platform Targets

- iOS 16+ (primary launch platform)
- Android 12+ (within initial launch window)

---

## 2. Architecture Overview

### 2.1 High-Level Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│         iOS App          Android App                     │
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
- **Edge functions for AI logic:** Supabase Edge Functions handle plan generation, AI calls (vision analysis, coaching), and event processing.
- **Stateless API layer:** All application state lives in the database or client-side stores (persisted to local storage).
- **Mobile-first data design:** API responses and payloads are optimized for mobile performance.
- **Adaptive Planning Engine:** Combines AI (Claude API) for complex reasoning with rules-based fallback for reliability.
- **Server-side Live AI Trainer:** Replaces on-device inference with cloud-based vision analysis to support high-accuracy guidance without intensive local resource usage.

---

## 3. Mobile Application

### 3.1 Project Structure

```
pawly/
├── app/                          # Expo Router file-based navigation
│   ├── (auth)/                   # Auth group — login, signup, welcome
│   ├── (onboarding)/             # Multi-step wizard and plan preview
│   └── (tabs)/                   # Main authenticated tab navigator
│       ├── train/
│       │   ├── index.tsx         # Today card / home screen
│       │   ├── calendar.tsx      # Monthly training calendar
│       │   ├── session.tsx       # Active session screen (Manual + Live AI)
│       │   ├── plan.tsx          # Plan view with course switcher
│       │   ├── add-course.tsx    # Add second training goal
│       │   ├── tools.tsx         # Clicker and Whistle tools
│       │   └── notifications.tsx # Notification center
│       ├── progress/             # Behavior scores and milestones
│       ├── coach/                # AI Coach chat interface
│       ├── know/                 # Articles and educational content
│       └── profile/              # Settings and dog profile
├── components/                   # UI primitives and feature components
│   ├── ui/                       # Reusable atoms (Button, Text, Input, etc.)
│   ├── session/                  # StepCard, TimerRing, RepCounter, ModePicker
│   ├── coach/                    # Message bubbles and formatting
│   ├── training/                 # TrainingToolCard
│   ├── vision/                   # LiveAiTrainerOverlay
│   ├── adaptive/                 # LearningInsightCard, AdaptationNotice
│   ├── train/                    # ActiveCourseCard, TrainingCalendar
│   └── onboarding/               # Question screens and progress bars
├── stores/                       # Zustand state stores (persisted via AsyncStorage)
│   ├── authStore.ts
│   ├── dogStore.ts
│   ├── sessionStore.ts
│   ├── planStore.ts
│   ├── onboardingStore.ts
│   └── themeStore.ts
├── lib/                          # Services, utilities, and core logic
│   ├── adaptivePlanning/         # Adaptation rules and scoring engine
│   ├── liveCoach/                # Live AI Trainer types and helpers
│   ├── sessionManager.ts         # Session saving and streak logic
│   ├── scheduleEngine.ts         # Calendar and slot calculation
│   └── supabase.ts               # Client initialization
└── constants/                    # Typography, spacing, and course metadata
```

### 3.2 Navigation Architecture

Pawly uses **Expo Router** with a file-based routing system.
- **(auth)**: Unauthenticated stack (Welcome -> Login/Signup).
- **(onboarding)**: Sequential wizard for new users (Dog Basics -> Goals -> Schedule -> Plan Preview).
- **(tabs)**: Main application layout with a bottom tab bar.

### 3.3 State Management

Application state is managed using **Zustand** stores:
- `authStore`: Handles session persistence, user profiles, and subscription tier.
- `dogStore`: Manages dog profile data and active courses.
- `planStore`: Manages plan protocols, session logs, and daily recommendations.
- `sessionStore`: Tracks active training session progress (current step, reps, timer).
- `onboardingStore`: Temporary persistence for user input during the multi-step wizard.

### 3.4 Core Screens Detailed Spec

#### Session Screen (`app/(tabs)/train/session.tsx`)

Guides the user through a training session with two modes:
1. **Manual Mode**: Handlers mark steps as complete and record reps manually.
2. **Live AI Trainer**: Uses the camera to provide real-time verbal coaching and automatic feedback via server-side vision analysis.

#### Training Tools Screen (`app/(tabs)/train/tools.tsx`)

Purpose: Provide handlers with digital aids for behavior marking and distance commands.
- **Clicker**: Low-latency audio trigger with simultaneous haptic feedback.
- **Whistle**: Supports short attention bursts (tap) and sustained recall signals (long-press).

---

## 4. Backend Services

### 4.1 Supabase Integration

Pawly leverages Supabase for:
- **Authentication**: JWT-based auth with Apple, Google, and Email providers.
- **Database**: PostgreSQL with Row Level Security (RLS) and real-time subscriptions.
- **Storage**: S3-compatible buckets for dog avatars, training videos, and articles.

### 4.2 Edge Functions (Deno)

- `generate-adaptive-plan`: Generates the initial personalized 8-week plan during onboarding.
- `adapt-plan`: Analyzes post-session signals to adjust plan difficulty and curriculum.
- `live-ai-trainer`: Processes vision frames to provide real-time coaching.
- `ai-coach-message`: Orchestrates the conversational AI coach.
- `generate-dog-avatar`: Creates AI-generated dog photos.

---

## 5. Database Schema

### 5.1 Core Tables

- `dogs`: Persistent profile (name, breed, lifecycle stage, schedule preferences).
- `plans`: Active and archived training courses with session arrays.
- `session_logs`: Historical record of all completed sessions, including Live AI summaries.
- `behavior_goals`: Tracking for primary and secondary behavior issues.
- `videos`: Metadata for user-uploaded behavior clips and expert review sessions.
- `user_profiles`: Handler settings, notification preferences, and subscription status.

---

## 6. AI & ML Systems

### 6.1 Live AI Trainer (Server-Side Vision)

Uses vision-capable models (Claude 3.5 Sonnet) via the `live-ai-trainer` Edge Function to analyze dog posture and movement in real-time. The app samples camera frames and sends them to the cloud to return contextual coach messages and feedback.

### 6.2 Adaptive Planning Engine

A multi-stage system that scores sessions based on:
1. **Direct metrics**: Step completion and rep counts.
2. **Handler reflection**: Post-session structured feedback (arousal, distraction, consistency).
3. **Skill Graph**: Dependencies between training steps to ensure logical progression.

---

## 7. API Specification

Pawly interacts with Supabase via:
- **REST**: Standard CRUD operations on authenticated tables.
- **RPC**: Database functions for complex queries (e.g., fetching streaks).
- **HTTP/POST**: Invoking Edge Functions for AI logic with bearer token auth.

---

## 8. Authentication & Authorization

- **Supabase Auth**: Manages user lifecycle.
- **Row Level Security**: Every table has RLS policies ensuring users can only read/write their own data (`auth.uid() = user_id`).
- **OAuth Providers**: Apple and Google sign-in implemented via `expo-apple-authentication` and Supabase providers.

---

## 9. Video Pipeline

1. **Capture**: Users record or select videos via `expo-image-picker`.
2. **Processing**: Thumbnail generation via `expo-video-thumbnails`.
3. **Upload**: Videos are uploaded to the `pawly-videos` Supabase storage bucket.
4. **Linking**: Records are created in the `videos` table to link storage paths to specific dogs and goals.

---

## 10. Notifications & Reminders

- **System Notifications**: `expo-notifications` for daily training reminders and walk check-ins.
- **Notification Center**: In-app UI (`app/(tabs)/train/notifications.tsx`) displaying a history of alerts and milestones.
- **Trigger Logic**: `lib/notifications.ts` manages permission requests and scheduling.

---

## 11. Analytics & Event Tracking

- **PostHog**: Integrated via `posthog-react-native` for product usage analytics.
- **Event Capture**: Centralized `captureEvent` utility in `lib/analytics.ts` tracks onboarding progress, session completion, and feature engagement.

---

## 12. Infrastructure & DevOps

- **Hosting**: Supabase (Cloud).
- **CI/CD**: GitHub Actions for automated linting and testing.
- **Mobile Builds**: Expo Application Services (EAS) for iOS/Android binary builds and App Store submissions.

---

## 13. Security & Privacy

- **Data Encryption**: All data encrypted at rest and in transit (HTTPS).
- **Secure Storage**: Sensitive auth tokens stored in iOS Keychain/Android Keystore via `expo-secure-store`.
- **Privacy**: No camera data is stored permanently during Live AI Trainer sessions unless explicitly recorded by the user.

---

## 14. Third-Party Integrations

| Service | Purpose | Status |
|---|---|---|
| Supabase | Backend (DB, Auth, Storage, Functions) | ✅ Active |
| Anthropic | AI Coaching and Vision Analysis | ✅ Active |
| Vision Camera v4 | Camera frame capture for AI vision | ✅ Active |
| PostHog | Product Analytics | ✅ Active |
| Sentry | Error Monitoring | ✅ Integrated |
| RevenueCat | Subscription Management | 🏗️ In Development |

---

## 15. Error Handling & Logging

- **Mobile Errors**: Sentry tracks exceptions and crashes in the React Native environment.
- **Backend Errors**: Supabase Edge Function logs and Postgres error codes.
- **User Feedback**: Graceful error UI for network failures or AI timeouts.

---

## 16. Performance Requirements

- **Cold Start**: < 3 seconds to interactive.
- **Haptic Latency**: < 50ms for Clicker tool response.
- **Vision Loop**: Sampling frames at ~0.5Hz to balance feedback speed with bandwidth.

---

## 17. Testing Strategy

- **Unit Testing**: Node.js native test runner for logic in `lib/` (adaptive planning, schedule engine).
- **Integration**: Manual QA of the E2E onboarding and training flow.
- **Manual Verification**: Playwright-based frontend verification for critical UI components.

---

## 18. Release & Deployment

- **Version Control**: Git-based flow with PR reviews.
- **Staging**: Development Supabase project for testing migrations and edge functions.
- **Production**: Dedicated Supabase production environment and EAS production builds.

---

## 19. V1 Scope Boundaries

### 19.1 What V1 Includes (Implemented)

- Multi-step onboarding and personalized 8-week plan generation.
- Manual and Live AI Trainer training modes.
- Post-session reflection and adaptive curriculum logic.
- AI Coach conversation with behavioral memory.
- Digital Training Tools (Clicker & Whistle).
- Knowledge library (articles).

### 19.2 What V1 Explicitly Excludes (Not Yet Built)

- **On-device real-time pose estimation**: Removed in favor of server-side vision for improved accuracy.
- **Native Video Player**: Currently using system standard players for v1.
- **Social Features**: No dog owner community or friend lists in V1 scope.
- **Live Human Coaching**: Only AI-driven coaching is supported for launch.
