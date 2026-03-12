# Pawly — PR Roadmap & Claude Code Prompts
**Version:** 1.0  
**Date:** March 12, 2026  
**Total PRs:** 10  
**Estimated Build Time:** 12 weeks solo

---

## How to Use This Document

Each PR is designed to be **independently shippable** and builds on the previous one. Before starting each PR, paste the full prompt into Claude Code in your project root. Claude Code will read your existing codebase and implement the changes.

**Before starting any PR:**
```bash
# Start a new branch for each PR
git checkout -b pr/01-project-foundation
```

**After each PR:**
```bash
# Test on real device before merging
npx expo start
# Then commit and merge
git add .
git commit -m "PR 01: Project foundation and navigation skeleton"
git checkout main && git merge pr/01-project-foundation
```

---

## PR Overview

| PR | Name | Builds | Est. Hours |
|---|---|---|---|
| 01 | Project Foundation & Navigation | From zero | 8–10h |
| 02 | Authentication & User Management | PR 01 | 8–10h |
| 03 | Onboarding & Dog Profile | PR 02 | 12–15h |
| 04 | Training Plans & Protocol Engine | PR 03 | 12–15h |
| 05 | Session Engine | PR 04 | 10–12h |
| 06 | AI Coach | PR 05 | 10–12h |
| 07 | Walk Integration & Progress Tracking | PR 06 | 10–12h |
| 08 | Video Upload & Expert Review | PR 07 | 8–10h |
| 09 | Notifications, Streaks & Milestones | PR 08 | 8–10h |
| 10 | Paywall & Subscription Management | PR 09 | 8–10h |

---

---

# PR 01 — Project Foundation & Navigation Skeleton

**Goal:** A working Expo app with tab navigation, placeholder screens, Supabase connected, and environment config in place. You can run this on your phone.

**Delivers:**
- Expo project with TypeScript
- Expo Router file-based navigation
- Bottom tab navigator (Train, Progress, Coach, Know, Profile)
- Supabase client configured
- Zustand installed and configured
- React Query installed
- PostHog and Sentry initialized
- Environment variable structure
- Base UI component library (Button, Card, Text, SafeScreen)
- Global theme (colors, typography, spacing)

---

## Claude Code Prompt — PR 01

```
You are building Pawly, a mobile dog training app. This is PR 01: Project Foundation & Navigation Skeleton.

## Task
Set up a complete Expo React Native project with TypeScript, file-based navigation, and all core dependencies configured. The app should run on iOS and Android with placeholder screens and a working tab navigator.

## Tech Stack
- Expo SDK 52 with Expo Router v4 (file-based navigation)
- React Native 0.76
- TypeScript (strict mode)
- Zustand v5 for state management
- TanStack React Query v5 for data fetching
- Supabase JS v2 for backend
- NativeWind v4 for styling (Tailwind for React Native)
- React Native Reanimated v3
- React Native Gesture Handler v2

## Project Structure to Create

pawly/
├── app/
│   ├── _layout.tsx                 # Root layout with providers
│   ├── index.tsx                   # Entry redirect
│   ├── (auth)/
│   │   └── _layout.tsx             # Auth stack layout
│   ├── (onboarding)/
│   │   └── _layout.tsx             # Onboarding stack layout
│   └── (tabs)/
│       ├── _layout.tsx             # Tab navigator
│       ├── train/
│       │   └── index.tsx           # Train tab placeholder
│       ├── progress/
│       │   └── index.tsx           # Progress tab placeholder
│       ├── coach/
│       │   └── index.tsx           # Coach tab placeholder
│       ├── know/
│       │   └── index.tsx           # Know tab placeholder
│       └── profile/
│           └── index.tsx           # Profile tab placeholder
├── components/
│   └── ui/
│       ├── Button.tsx              # Primary, secondary, ghost variants
│       ├── Card.tsx                # Base card with shadow
│       ├── SafeScreen.tsx          # SafeAreaView wrapper
│       ├── Text.tsx                # Typography component with variants
│       └── LoadingSpinner.tsx      # Centered activity indicator
├── lib/
│   └── supabase.ts                 # Supabase client with SecureStore auth adapter
├── stores/
│   └── authStore.ts                # Auth store scaffold (empty state for now)
├── constants/
│   ├── colors.ts                   # Pawly color palette
│   ├── typography.ts               # Font sizes and weights
│   └── spacing.ts                  # Spacing scale
├── types/
│   └── index.ts                    # Global TypeScript types
├── .env.example                    # Environment variable template
├── app.config.ts                   # Expo config with EAS
└── tailwind.config.js              # NativeWind config

## Color Palette (constants/colors.ts)
Primary: #2D7D6F (deep teal — trust and expertise)
Secondary: #F5F0E8 (warm cream — friendly, not sterile)
Accent: #E8845A (warm terracotta — energy and warmth)
Success: #4CAF7D
Warning: #F5A623
Error: #E05252
Text Primary: #1A1A2E
Text Secondary: #6B7280
Background: #FAFAF8
Surface: #FFFFFF
Border: #E5E7EB

## Tab Navigator Spec
Five tabs with icons from @expo/vector-icons (Ionicons):
1. Train — icon: "paw" — label: "Train"
2. Progress — icon: "bar-chart" — label: "Progress"
3. Coach — icon: "chatbubble-ellipses" — label: "Coach"
4. Know — icon: "heart" — label: "Know"
5. Profile — icon: "person-circle" — label: "Profile"

Active tab color: #2D7D6F (Primary)
Inactive tab color: #6B7280
Tab bar background: #FFFFFF
Tab bar border top: #E5E7EB

## Supabase Client (lib/supabase.ts)
Use expo-secure-store as the auth storage adapter.
Export a single `supabase` client instance.
Read EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY from environment.

## Root Layout (_layout.tsx)
Wrap the app in:
1. QueryClientProvider (React Query)
2. GestureHandlerRootView
3. Auth state listener that redirects:
   - No session → (auth)/welcome
   - Session but no dog profile → (onboarding)/dog-basics  
   - Session and dog profile → (tabs)/train
Use Supabase onAuthStateChange to listen for session changes.

## Placeholder Screen Spec
Each tab screen should show:
- SafeScreen wrapper
- Centered Text with the screen name
- Pawly primary color background accent at top (height: 4px)
- No placeholder content beyond this

## Environment Variables (.env.example)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_POSTHOG_API_KEY=your_posthog_key
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_rc_ios_key
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_rc_android_key
APP_ENV=development

## package.json Dependencies to Install
expo, expo-router, react-native, typescript, @supabase/supabase-js,
expo-secure-store, zustand, @tanstack/react-query, nativewind,
react-native-reanimated, react-native-gesture-handler, @expo/vector-icons,
expo-constants, expo-linking, expo-status-bar, react-native-safe-area-context,
react-native-screens, posthog-react-native, @sentry/react-native

## Requirements
- TypeScript strict mode — no `any` types
- All components use NativeWind for styling
- Consistent use of the color palette from constants/colors.ts
- No hardcoded colors or spacing values in components
- App must run with `npx expo start` after setup
- Include a README.md with setup instructions

Create all files. Do not leave any TODOs or placeholder imports.
```

---

---

# PR 02 — Authentication & User Management

**Goal:** Full auth flow with email/password, Apple Sign In, and Google Sign In. Users can sign up, log in, and log out. Session persists across app restarts.

**Delivers:**
- Welcome screen with app branding
- Sign up screen (email + password)
- Login screen
- Apple Sign In (iOS)
- Google Sign In
- Password reset flow
- Auth state persistence via SecureStore
- authStore fully implemented
- User record created in Supabase on signup
- Route protection (redirect unauthenticated users)

---

## Claude Code Prompt — PR 02

```
You are building Pawly, a mobile dog training app. This is PR 02: Authentication & User Management.

## Context
PR 01 is complete. The project has Expo Router, Supabase client in lib/supabase.ts, NativeWind styling, and a color palette in constants/colors.ts. The root layout already has an auth state listener that redirects based on session state.

## Task
Implement the complete authentication flow including all screens, the authStore, and the Supabase integration.

## Files to Create or Modify

### app/(auth)/_layout.tsx
Stack navigator for auth screens. No header. Background color: #FAFAF8.

### app/(auth)/welcome.tsx
Pawly welcome/landing screen.

Layout (top to bottom):
- Top 40% of screen: Gradient background (#2D7D6F to #1A5C52) with centered Pawly wordmark in white (large, bold) and tagline "Finally. A trainer who knows your dog." in white/80 opacity
- Bottom 60%: White card with rounded top corners (radius: 32)
  - "Get started free" primary button → navigates to (auth)/signup
  - "I already have an account" ghost button → navigates to (auth)/login
  - Footnote text: "No credit card required to start."

### app/(auth)/signup.tsx
Sign up form screen.

Fields:
- Email (keyboard: email-address, autocomplete: email)
- Password (secureTextEntry, min 8 characters)
- "Create account" primary button
- OR divider
- "Continue with Apple" button (iOS only, using expo-apple-authentication)
- "Continue with Google" button (using Google OAuth via Supabase)
- Link: "Already have an account? Log in" → (auth)/login

On submit:
1. Validate email format and password length
2. Call supabase.auth.signUp({ email, password })
3. On success: Supabase auth state change triggers redirect to onboarding
4. On error: Show inline error message below the relevant field

Error messages:
- "Email already in use. Try logging in instead."
- "Password must be at least 8 characters."
- "Something went wrong. Please try again."

### app/(auth)/login.tsx
Login form screen.

Fields:
- Email
- Password
- "Log in" primary button
- OR divider
- "Continue with Apple" (iOS only)
- "Continue with Google"
- "Forgot password?" link → (auth)/forgot-password
- Link: "Don't have an account? Sign up" → (auth)/signup

On submit:
1. Call supabase.auth.signInWithPassword({ email, password })
2. On success: root layout auth listener handles redirect
3. On error: Show "Incorrect email or password." inline error

### app/(auth)/forgot-password.tsx
Simple screen with email field. On submit calls supabase.auth.resetPasswordForEmail(email).
Show success state: "Check your email for a reset link."

### stores/authStore.ts
Implement the full Zustand auth store.

Interface:
```typescript
interface AuthStore {
  user: User | null
  session: Session | null
  subscriptionTier: 'free' | 'core' | 'premium'
  isLoading: boolean
  isInitialized: boolean
  
  // Actions
  initialize: () => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithApple: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  setSubscriptionTier: (tier: 'free' | 'core' | 'premium') => void
}
```

initialize() should:
1. Call supabase.auth.getSession() to restore existing session
2. Set up supabase.auth.onAuthStateChange listener
3. On each auth state change, update user and session in store
4. Set isInitialized = true when done

### lib/supabase.ts (modify)
Add a helper function:
```typescript
export async function createUserRecord(userId: string, email: string): Promise<void>
```
Inserts a row into the users table when a new account is created.
Handle "already exists" gracefully (upsert).

### types/index.ts (modify)
Add auth-related types:
```typescript
export type SubscriptionTier = 'free' | 'core' | 'premium'

export interface AppUser {
  id: string
  email: string
  subscriptionTier: SubscriptionTier
  onboardingCompletedAt: string | null
  householdId: string | null
  createdAt: string
}
```

## Supabase SQL to Run
Provide the SQL to create the users table and households table as specified in the technical spec. Include RLS policies.

## Design Requirements
- All screens use SafeScreen wrapper
- Loading states on all async buttons (ActivityIndicator replaces button text)
- Keyboard avoiding behavior on all form screens
- Dismiss keyboard on tap outside
- Error states shown inline, not as alerts
- Consistent use of Pawly color palette
- "Continue with Apple" button must use the official Apple button style (black background, white text, Apple logo)

## Apple Sign In Implementation
Use expo-apple-authentication package.
Only render the Apple button on iOS (Platform.OS === 'ios').
On success, exchange the Apple credential for a Supabase session via supabase.auth.signInWithIdToken.

## Requirements
- No TypeScript errors
- All async operations wrapped in try/catch
- Loading states prevent double-submission
- Form validation runs on submit, not on every keystroke
- Auth state changes always handled by root layout listener, not by individual screens navigating directly
```

---

---

# PR 03 — Onboarding & Dog Profile

**Goal:** Complete multi-step onboarding flow. By the end, a dog profile exists in Supabase and the user sees a plan preview. dogStore is fully implemented.

**Delivers:**
- 5-step onboarding flow with progress indicator
- Dog basics screen (name, breed, age, sex)
- Problem selection screen (pick top 1–3 behaviors)
- Environment screen (home type, household, schedule)
- Video upload screen (record or select clip, upload to Supabase Storage)
- Plan preview screen (generated plan summary)
- dogStore fully implemented
- Dog profile written to Supabase
- Breed autocomplete list
- Onboarding progress persists if app is closed mid-flow

---

## Claude Code Prompt — PR 03

```
You are building Pawly, a mobile dog training app. This is PR 03: Onboarding & Dog Profile.

## Context
PR 01 and PR 02 are complete. Auth works. The root layout redirects authenticated users with no dog profile to (onboarding)/dog-basics. Supabase client is in lib/supabase.ts. Color palette is in constants/colors.ts.

## Task
Build the complete 5-step onboarding flow that collects dog information, a problem video, and generates a basic plan. The flow ends with the user seeing their dog's personalized plan and being redirected to the main app.

## Onboarding Flow Architecture
Use a single Zustand store (onboardingStore) to accumulate data across all 5 steps. Write to Supabase only at the final step. This way, if the user closes the app mid-flow, their progress is preserved in AsyncStorage via Zustand persist middleware.

## Files to Create

### stores/onboardingStore.ts
```typescript
interface OnboardingData {
  // Step 1 — Dog Basics
  dogName: string
  breed: string
  ageMonths: number
  sex: 'male' | 'female'
  neutered: boolean
  
  // Step 2 — Problems
  primaryGoal: string
  secondaryGoals: string[]
  severity: 'mild' | 'moderate' | 'severe'
  
  // Step 3 — Environment
  environmentType: 'apartment' | 'house_no_yard' | 'house_yard'
  hasKids: boolean
  hasOtherPets: boolean
  availableDaysPerWeek: number
  availableMinutesPerDay: number
  trainingExperience: 'none' | 'some' | 'experienced'
  equipment: string[]
  
  // Step 4 — Video
  videoUri: string | null
  videoUploadPath: string | null
  videoContext: string
  
  // Step 5 — Complete
  currentStep: number
}

interface OnboardingStore extends OnboardingData {
  setField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
  submitOnboarding: (userId: string) => Promise<{ dogId: string, planId: string }>
}
```

Use zustand/middleware persist with AsyncStorage to preserve state.

### app/(onboarding)/_layout.tsx
Stack navigator. Show a progress bar at the top (5 steps). Back button on steps 2–4. No back on step 1 or 5.

### app/(onboarding)/dog-basics.tsx — Step 1
Header: "Tell us about your dog"
Subheader: "We'll build a training plan just for them."

Fields:
- Dog's name: TextInput (large, friendly)
- Breed: TextInput with autocomplete dropdown using BREEDS_LIST constant
- Age: Segmented control or picker:
  - "8–12 weeks", "3–6 months", "6–12 months", "1–2 years", "2–4 years", "4+ years"
  - Maps to age_months: 10, 18, 9, 18, 36, 60
- Sex: Toggle — Male / Female
- Neutered: Toggle — Yes / No

CTA: "Next →" (disabled until name and breed filled)

### app/(onboarding)/dog-problem.tsx — Step 2
Header: "What's the biggest challenge?"
Subheader: "Pick the one thing driving you most crazy right now."

Show 8 behavior option cards in a 2-column grid:
1. 🦮 Leash Pulling — "Drags me everywhere"
2. 🚪 Jumping Up — "On everyone and everything"
3. 📣 Barking — "Won't stop barking"
4. 🏃 Won't Come — "Ignores recall completely"
5. 🏠 Potty Training — "Still having accidents"
6. 🛏️ Crate Anxiety — "Hates being alone"
7. 😬 Puppy Biting — "Nipping and mouthing"
8. 😤 Settling — "Can't calm down"

Each card: icon (large emoji), label, description. Tapping selects it (teal border, teal background tint). Allow up to 3 selected, first selection is primary goal.

Also show: severity slider for the primary goal:
"How bad is it?" — Mild / Moderate / Severe

CTA: "Next →" (disabled until at least one selected)

### app/(onboarding)/dog-environment.tsx — Step 3
Header: "Tell us about your setup"

Sections:
1. Where you live: 3 option cards — Apartment, House (no yard), House with yard
2. Who else is home: Toggle — Kids at home, Other pets
3. Training time: 
   - "Days per week I can train": stepper 1–7
   - "Minutes per session": segmented — 5 min / 10 min / 15 min / 20+ min
4. Your experience: 3 cards — New to this / Tried some things / Experienced trainer
5. Equipment you have (multi-select chips): 
   Flat collar, Harness (front clip), Harness (back clip), Martingale, Head halter, Retractable leash (flag this), Standard leash, Long line, Clicker, Treat pouch

CTA: "Next →"

### app/(onboarding)/video-upload.tsx — Step 4
Header: "Show us what's happening"
Subheader: "A 30-second clip helps us give you a much more relevant plan."

Layout:
- Large dashed upload area with camera icon
- Two buttons: "Record now" and "Choose from library"
- If video selected: show thumbnail preview with "Remove" option
- Context question (required): "What happens in this clip?" — TextInput
- Skip option at bottom: "Skip for now →" (deemphasized link)

On "Record now": launch expo-camera in video mode, max 60 seconds
On "Choose from library": launch expo-image-picker in video mode

On video selected:
1. Show thumbnail and duration
2. Compress video locally (target: 720p, < 50MB)
3. Upload to Supabase Storage at: videos/{userId}/onboarding_{timestamp}.mp4
4. Show upload progress bar
5. On complete: store storage path in onboardingStore

CTA: "Build my plan →" (enabled even if no video — video is optional)

### app/(onboarding)/plan-preview.tsx — Step 5
This screen calls submitOnboarding() on mount, shows a loading state, then reveals the plan.

Loading state:
- Animated Pawly logo
- Rotating text: "Analyzing your dog's profile…" → "Selecting the right exercises…" → "Building your personalized plan…"
- 2–3 second minimum display even if response is fast

Plan preview (after load):
- Dog avatar circle with dog's name
- Behavior badge: e.g., "Leash Pulling · Stage 1"
- Plan title: e.g., "Max's 4-Week Leash Foundation Plan"
- 3 bullet points explaining what they'll work on
- "What you'll need:" — equipment list from profile
- "First session: 8 minutes" stat chip
- Paywall gate for full plan:
  - Free users see a blurred plan preview with "Unlock your full plan" CTA
  - CTA routes to paywall (stub for now — just navigate to profile/subscription)

CTA: "Start my first session →" (for paid users) or "Unlock plan →" (for free users)

### stores/dogStore.ts
Full implementation:
```typescript
interface DogStore {
  dog: Dog | null
  activePlan: Plan | null
  behaviorGoals: BehaviorGoal[]
  isLoading: boolean
  
  fetchDog: (userId: string) => Promise<void>
  updateDog: (updates: Partial<Dog>) => Promise<void>
  fetchActivePlan: () => Promise<void>
  setDog: (dog: Dog) => void
  setActivePlan: (plan: Plan) => void
}
```

### types/index.ts (extend)
Add:
```typescript
export interface Dog {
  id: string
  ownerId: string
  name: string
  breed: string
  breedGroup: string
  ageMonths: number
  sex: 'male' | 'female'
  neutered: boolean
  environmentType: 'apartment' | 'house_no_yard' | 'house_yard'
  behaviorGoals: string[]
  trainingExperience: 'none' | 'some' | 'experienced'
  equipment: string[]
  availableDaysPerWeek: number
  availableMinutesPerDay: number
  lifecycleStage: string
  createdAt: string
}

export interface Plan {
  id: string
  dogId: string
  goal: string
  status: 'active' | 'completed' | 'paused'
  durationWeeks: number
  sessionsPerWeek: number
  currentWeek: number
  currentStage: string
  sessions: PlanSession[]
  createdAt: string
}

export interface PlanSession {
  id: string
  exerciseId: string
  weekNumber: number
  dayNumber: number
  title: string
  durationMinutes: number
  isCompleted: boolean
}
```

### constants/breeds.ts
Export BREEDS_LIST: string[] — array of 150 most common dog breeds, alphabetically sorted.

### lib/planGenerator.ts
Rule-based plan generator:
```typescript
export function generatePlan(dog: Dog): Plan
```

Maps behavior goal + age group + environment to a hardcoded sequence of exercise IDs from the protocol library. For v1, return a deterministic plan based on:
- primary goal → select module (e.g., 'leash_pulling' → 'loose_leash' module)
- age group → select starting stage (puppy starts at stage 1, adolescent at stage 1 or 2)
- available days per week → set sessionsPerWeek

Include hardcoded exercise sequences for all 7 behavior goals.

### submitOnboarding function (in onboardingStore.ts)
1. Insert dog record into Supabase dogs table
2. Insert behavior_goals record for primary goal
3. Generate plan using generatePlan(dog)
4. Insert plan record into Supabase plans table
5. Mark user onboarding_completed_at = NOW()
6. Update dogStore with new dog and plan
7. Return { dogId, planId }

## Design Requirements
- Progress bar at top shows current step (e.g., step 2 of 5 = 40% filled, teal)
- Each screen animates in from the right using Reanimated entering animation
- Option cards have satisfying selection animation (scale 0.97 on press, border color transition)
- "Next" button stays pinned at bottom above keyboard
- All screens are scrollable when content overflows

## Supabase SQL to Include
Provide the CREATE TABLE SQL for:
- dogs
- behavior_goals
- plans

With appropriate RLS policies so users can only access their own data.
```

---

---

# PR 04 — Training Plans & Protocol Engine

**Goal:** A complete protocol content system with session data for all 7 behavior modules. The Today screen shows the real plan with today's session. Protocol content drives the session engine.

**Delivers:**
- Protocol content for all 7 behavior modules (real exercise content)
- Today screen fully implemented (today card, walk goal, quick enrichment)
- Full plan view screen
- planStore fully implemented
- Protocol fetching from Supabase
- Session scheduling logic
- Today screen home experience complete

---

## Claude Code Prompt — PR 04

```
You are building Pawly, a mobile dog training app. This is PR 04: Training Plans & Protocol Engine.

## Context
PR 01–03 are complete. Onboarding works, dog profiles are created in Supabase, and basic plan generation works. The (tabs)/train/index.tsx is a placeholder. dogStore and planStore scaffolds exist.

## Task
Build the complete protocol content system, implement the Today screen as the main daily experience, and build the full plan view screen.

## Files to Create or Modify

### constants/protocols.ts
Create a complete protocol library as a TypeScript constant. This is the content engine for v1.

Structure for each protocol:
```typescript
export interface Protocol {
  id: string
  behavior: string          // 'leash_pulling' | 'recall' | 'jumping' | etc.
  stage: 1 | 2 | 3 | 4
  title: string
  objective: string
  durationMinutes: number
  repCount: number
  steps: ProtocolStep[]
  successCriteria: string
  commonMistakes: string[]
  equipmentNeeded: string[]
  ageMinMonths: number
  ageMaxMonths: number
  difficulty: 1 | 2 | 3 | 4 | 5
  nextProtocolId: string | null
  trainerNote: string
}

export interface ProtocolStep {
  order: number
  instruction: string
  durationSeconds: number | null
  reps: number | null
  tip: string | null
  successLook: string
}
```

Create AT LEAST 3 protocols per behavior module (Stage 1, 2, 3):

**Loose Leash Walking (3 protocols):**
- Stage 1: Focus and attention work (name response, eye contact at heel)
- Stage 2: Stop-and-wait technique (stop when tension, reward slack)
- Stage 3: Direction change and engagement on walks

**Recall (3 protocols):**
- Stage 1: Name response at close distance indoors
- Stage 2: Recall with light distraction indoors
- Stage 3: Recall in low-distraction outdoor environments

**Calm Greetings / Stop Jumping (3 protocols):**
- Stage 1: Four paws on floor for attention (with helper)
- Stage 2: Sit for greeting (auto-sit on approach)
- Stage 3: Calm greeting with strangers

**Potty Training (3 protocols):**
- Stage 1: Timed outdoor trips and reward system
- Stage 2: Signal training for outside request
- Stage 3: Reliable indoor/outdoor schedule

**Crate Training (3 protocols):**
- Stage 1: Positive crate introduction (feed at crate, then inside)
- Stage 2: Short duration comfort (5–30 minutes)
- Stage 3: Building duration to 2+ hours

**Puppy Biting (3 protocols):**
- Stage 1: Yelp and redirect technique
- Stage 2: Turn away and timeout method
- Stage 3: Bite inhibition with consistent thresholds

**Barking and Settling (3 protocols):**
- Stage 1: Settle cue on mat (luring to mat, duration building)
- Stage 2: Settle with mild household distractions
- Stage 3: Go to place on cue from any room

Write REAL, detailed, trainer-quality content for each step. Do not write placeholder text. The instructions should be clear enough for a first-time dog owner to follow independently.

### app/(tabs)/train/index.tsx — Today Screen
This is the most important screen in the app. Complete implementation.

**Header Section:**
- Dog's name in greeting: "Good morning, [Name]!" (time-aware: morning/afternoon/evening)
- Current streak badge (🔥 N days)
- Small dog avatar (circle, 44px)

**Today Card (Primary CTA):**
Large card (full width, teal gradient background) containing:
- Small label: "TODAY'S SESSION"
- Session title from today's protocol
- Duration badge: "8 min"
- Behavior tag: e.g., "Leash · Stage 1"
- Brief one-line description of today's focus
- Big "Start Session" button (white, full width)

Today's session is determined by:
```typescript
function getTodaySession(plan: Plan): PlanSession | null {
  // Find the next incomplete session in the plan
  // If today's session already completed, show "Great work today!" state
  // If no plan, return null
}
```

**Walk Goal Strip:**
Below the today card:
- Label: "TODAY'S WALK GOAL"
- Goal text (generated based on current behavior stage)
- "Log walk" button → walk logging modal

Walk goals by stage:
- Stage 1 leash: "Practice stopping when tension — aim for 3 clean stops"
- Stage 2 leash: "Hold eye contact at 2 crossings before crossing"
- Stage 1 recall: "Call once, reward big — even at 5 feet"
(Create a map of goal text per behavior + stage)

**Quick Win Strip:**
Horizontal scroll of 3 small enrichment idea cards:
- Each card: emoji icon, short title, "2 min" badge
- Example ideas: "Sniff walk", "Find it game", "Name recognition drill"
- Tapping a card opens a bottom sheet with full instructions (hardcoded content for v1)

**Recent Progress Banner:**
If a milestone was achieved in last 7 days: show milestone card with confetti icon
If streak reached a round number (7, 14, 21, 30): show celebration card
Otherwise: show the next milestone target ("3 more sessions to reach your first 10!")

**Empty States:**
- No plan: "Complete your profile to get your personalized plan" + CTA
- Plan completed: "You've finished your plan! Ready for the next challenge?" + CTA
- Today's session done: "You're done for today. Come back tomorrow!" + tomorrow preview

### app/(tabs)/train/plan.tsx — Full Plan View
Show the complete plan structure.

Layout:
- Plan header: goal name, total weeks, completion percentage ring
- Current week highlighted
- Session list: each row shows week/day, protocol title, duration, completion status
- Completed sessions show green checkmark
- Today's session highlighted with teal background
- Future sessions show lock icon (encourage progression)
- Each session row tappable → navigate to session screen (PR 05)

### stores/planStore.ts
Full implementation:
```typescript
interface PlanStore {
  activePlan: Plan | null
  protocols: Record<string, Protocol>
  todaySession: PlanSession | null
  completionPercentage: number
  isLoading: boolean
  
  fetchActivePlan: (dogId: string) => Promise<void>
  fetchProtocol: (exerciseId: string) => Promise<Protocol>
  markSessionComplete: (sessionId: string, score: SessionScore) => Promise<void>
  getTodaySession: () => PlanSession | null
  refreshPlan: () => Promise<void>
}
```

### lib/scheduleEngine.ts
```typescript
// Returns today's recommended session based on plan and completion history
export function getTodaySession(plan: Plan, completedSessions: string[]): PlanSession | null

// Returns walk goal text based on current behavior stage
export function getWalkGoal(behavior: string, stage: number): string

// Returns completion percentage for a plan
export function getPlanCompletion(plan: Plan): number

// Returns the next milestone target
export function getNextMilestone(completedCount: number): string
```

## Design Requirements
- Today card uses LinearGradient (expo-linear-gradient): #2D7D6F → #1A5C52
- Today card text is all white
- Pull-to-refresh on Today screen
- Skeleton loading state while plan data loads (use a shimmer placeholder)
- All tap targets minimum 44px height
- Smooth scroll performance (use FlashList from @shopify/flash-list for session list)

## Supabase SQL to Include
Provide INSERT SQL to seed the protocols table with all 21 protocols (7 behaviors × 3 stages) from constants/protocols.ts data.
```

---

---

# PR 05 — Session Engine

**Goal:** A complete, polished training session experience. Users can start a session from the Today screen, follow step-by-step instructions with timers and rep counters, and log the completed session to Supabase.

**Delivers:**
- Session screen with full state machine
- Step-by-step guided exercise UI
- Countdown timer with visual ring
- Rep counter
- Success/difficulty logging at completion
- Session written to Supabase on complete
- sessionStore fully implemented
- Streak updates on session completion
- Abandoned session handling

---

## Claude Code Prompt — PR 05

```
You are building Pawly, a mobile dog training app. This is PR 05: Session Engine.

## Context
PR 01–04 are complete. The Today screen shows today's session card and navigates to app/(tabs)/train/session/[id].tsx on "Start Session". Protocol content exists in constants/protocols.ts. planStore has fetchProtocol(). The session screen file exists but is a placeholder.

## Task
Build the complete session experience — the core training loop of the entire app.

## Session State Machine

```typescript
type SessionState = 
  | 'LOADING'        // Fetching protocol data
  | 'INTRO'          // Show session overview before starting
  | 'SETUP'          // Environment checklist
  | 'STEP_ACTIVE'    // Currently on a step
  | 'STEP_COMPLETE'  // Step finished, show result before next
  | 'SESSION_REVIEW' // All steps done, rate the session
  | 'COMPLETE'       // Session saved, show celebration
  | 'ABANDONED'      // User backed out

```

## Files to Create or Modify

### stores/sessionStore.ts
```typescript
interface ActiveSession {
  sessionId: string
  exerciseId: string
  protocol: Protocol
  startedAt: Date
  currentStepIndex: number
  stepResults: StepResult[]
  timerSeconds: number
  repCount: number
  isTimerRunning: boolean
  state: SessionState
}

interface StepResult {
  stepOrder: number
  completed: boolean
  durationSeconds: number
  repCount: number
}

interface SessionStore {
  activeSession: ActiveSession | null
  
  startSession: (exerciseId: string, protocol: Protocol) => void
  completeStep: (result: StepResult) => void
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: (seconds: number) => void
  incrementRep: () => void
  resetReps: () => void
  advanceToNextStep: () => void
  submitSession: (difficulty: 'easy' | 'okay' | 'hard', successScore: number) => Promise<void>
  abandonSession: () => Promise<void>
  tick: () => void  // Called every second by a setInterval
}
```

### app/(tabs)/train/session/[id].tsx
Complete session screen implementation.

**LOADING state:**
- Centered Pawly logo with spinning indicator
- "Getting your session ready…"

**INTRO state:**
Full-screen intro card:
- Protocol title (large, bold)
- Objective text: "By the end of this session, Max will…"
- Duration chip: "⏱ 8 minutes"
- Equipment check list (chips): items from protocol.equipmentNeeded
- Trainer note (if present): shown in a teal info box
- "I'm ready" button → advance to SETUP

**SETUP state:**
Environment checklist before starting:
- Title: "Quick setup"
- Checklist items based on protocol (e.g., "Find a low-distraction space", "Have high-value treats ready", "Leash attached")
- Each item has a checkbox — user taps to confirm
- "Start session" button (disabled until all checked) → advance to STEP_ACTIVE, start timer

**STEP_ACTIVE state:**
Main session UI — the most important screen in the app.

Layout (top to bottom):
1. Progress bar: step X of N (teal fill)
2. Step title (bold, large): e.g., "Step 1: Get Max's attention"
3. Instruction card (white card, full width):
   - Primary instruction text (large, readable — min 18pt)
   - "What this looks like:" sub-note (italic, secondary color)
   - Tip pill (amber background): tip text if present
4. Timer section (if step has duration):
   - Large circular timer ring (SVG circle, teal stroke, animates countdown)
   - Seconds remaining (large number in center)
   - Play/Pause button below ring
5. Rep counter section (if step has reps):
   - Large rep count display (bold, 48pt)
   - Big "+" tap target (entire bottom area of screen acts as tap zone)
   - "Reset" small link
6. Common mistake (collapsible): "⚠️ Common mistake" → expand to show text
7. Bottom: "Step done ✓" button (full width, teal) → STEP_COMPLETE

Timer behavior:
- Auto-starts when STEP_ACTIVE begins (if step has duration)
- Plays a subtle haptic when timer reaches 0
- Timer ring animates smoothly using Reanimated
- On timer complete: auto-advance prompt appears ("Timer done! How did it go?")

Rep counter behavior:
- Entire lower portion of screen is one large tap target
- Haptic feedback on each tap
- Count displays with a small bounce animation on each increment
- When rep count reaches target: subtle success animation

**STEP_COMPLETE state:**
Brief between-step screen:
- "Step complete!" with checkmark animation
- One-line recap of what they just did
- If last step: "All steps done! How did it go?" → SESSION_REVIEW
- If not last step: "Next: [next step title]" + 2-second auto-advance or "Next step →" button

**SESSION_REVIEW state:**
Post-session rating screen:
- "Session complete!" header with confetti animation (use lottie-react-native)
- Duration completed: "Completed in 7 min 23 sec"
- "How did it go?" with 3 large option cards:
  - 😊 Easy — "Max was a superstar"
  - 😐 Okay — "Some good moments, some struggles"  
  - 😤 Hard — "Tough session today"
- Optional notes text input: "Anything to note? (optional)"
- "Save session" button → submitSession() → COMPLETE

**COMPLETE state:**
Celebration screen:
- Confetti Lottie animation playing
- Dog's name: "Max crushed it!"
- Sessions completed count: "Session 4 of 28"
- Streak update if applicable: "🔥 4-day streak!"
- Next session preview: "Next up: [next session title] · Tomorrow"
- Share button (if milestone achieved)
- "Back to today" button → navigate back to train/index

**ABANDONED flow:**
Back button shown on all states except COMPLETE.
On back press: show confirmation bottom sheet:
- "Leave this session?"
- "Your progress won't be saved."
- "Leave" (destructive) and "Keep going" buttons
On confirm: call abandonSession(), navigate back

### components/session/TimerRing.tsx
Animated SVG circular timer using React Native SVG and Reanimated.
Props: totalSeconds, currentSeconds, size, color
Animates strokeDashoffset smoothly.

### components/session/RepCounter.tsx
Large number display with tap-to-increment.
Props: count, target, onIncrement, onReset
Shows subtle green fill animation when target reached.

### components/session/StepCard.tsx
Reusable card for displaying step instructions.
Props: step: ProtocolStep, stepNumber, totalSteps

### lib/sessionManager.ts
```typescript
// Writes completed session to Supabase
export async function saveSession(params: SaveSessionParams): Promise<void>

// Updates streak after session completion
export async function updateStreak(userId: string, dogId: string): Promise<void>

// Checks if this session completion triggers a milestone
export async function checkMilestones(userId: string, dogId: string, sessionData: CompletedSession): Promise<Milestone | null>
```

## Design Requirements
- Entire session screen has no bottom tab bar (hide it during sessions using Expo Router layout options)
- Status bar hidden during active session for immersive experience
- Step instruction text is large and extremely readable (18pt minimum)
- Haptic feedback: Haptics.impactAsync on rep counter, Haptics.notificationAsync on step complete
- Confetti animation on COMPLETE state using lottie-react-native (include the confetti.json Lottie file)
- Timer ring uses react-native-svg for the circular progress
- Smooth transitions between states using Reanimated FadeIn/FadeOut

## Requirements
- Timer must work correctly when app is backgrounded (use AppState listener to track background time)
- Session data never lost — write to local state immediately, Supabase async
- No TypeScript errors
- All interactive elements have appropriate loading/disabled states
```

---

---

# PR 06 — AI Coach

**Goal:** A fully functional AI coach chat powered by Claude. Responses are grounded in the dog's full profile, active plan, and session history. The coach feels like a real trainer, not a generic chatbot.

**Delivers:**
- Full chat UI screen
- Anthropic API integration via Supabase Edge Function
- Context assembly pipeline (dog profile + plan + session history injected per message)
- Conversation history stored in Supabase
- Quick suggestion chips
- Context badge showing the coach knows the dog
- Rate limiting enforcement
- coachStore fully implemented

---

## Claude Code Prompt — PR 06

```
You are building Pawly, a mobile dog training app. This is PR 06: AI Coach.

## Context
PR 01–05 are complete. Dog profiles, plans, and sessions all exist in Supabase. The (tabs)/coach/index.tsx screen is a placeholder. The Anthropic API key is available as a server-side secret in Supabase Edge Functions (not exposed to the client).

## Task
Build the complete AI Coach feature — a Claude-powered conversational coach grounded in the user's dog profile.

## Architecture
The mobile client NEVER calls the Anthropic API directly. All AI calls go through a Supabase Edge Function that:
1. Validates the user's JWT
2. Fetches dog context from the database
3. Assembles the system prompt
4. Calls the Anthropic API
5. Stores the message pair in coach_messages
6. Returns the response to the client

## Files to Create or Modify

### supabase/functions/ai-coach-message/index.ts
Supabase Edge Function (Deno).

Request body:
```typescript
{
  message: string        // User's message (max 1000 chars)
  conversationId: string // UUID of the conversation
  dogId: string
}
```

Response:
```typescript
{
  content: string         // Assistant's response
  conversationId: string
}
```

Implementation steps:
1. Validate JWT from Authorization header using Supabase admin client
2. Rate limit check: count messages in last hour for this user
   - Free tier: max 5 messages per day total
   - Core/Premium: max 30 per hour
   - If limit exceeded: return 429 with message "Daily coaching limit reached. Upgrade for unlimited coaching."
3. Fetch context:
   - Dog profile from dogs table
   - Active plan from plans table
   - Last 7 sessions from sessions table (completed, ordered desc)
   - Last 5 walk logs
   - Last 20 messages from this conversation
4. Assemble system prompt (see below)
5. Call Anthropic API with assembled context
6. Store user message and assistant response in coach_messages table
7. Return response

**System Prompt Template:**
```
You are Pawly's AI training coach. You are warm, direct, and deeply knowledgeable about dog behavior and positive reinforcement training. You always give specific, actionable advice.

CRITICAL RULES — never break these:
- Always address the dog by name (${dog.name})
- Never recommend punishment, corrections, prong collars, shock collars, or dominance-based methods
- Never diagnose medical conditions — always refer to a vet for health concerns
- For bite history, severe aggression, or extreme fear: always recommend an in-person certified behaviorist
- Keep responses concise — max 3 short paragraphs
- End every response with one clear, specific next action
- If you don't know something, say so honestly

ABOUT THIS DOG:
Name: ${dog.name}
Breed: ${dog.breed} (${dog.breedGroup || 'mixed'})
Age: ${dog.ageMonths} months (${lifecycleStage})
Sex: ${dog.sex}, ${dog.neutered ? 'neutered' : 'intact'}
Where they live: ${dog.environmentType}
Energy level: ${dog.energyLevel}/5
Reactivity level: ${dog.reactivityLevel}/5
Motivates best with: ${dog.motivationType}
Equipment available: ${dog.equipment.join(', ')}

CURRENT TRAINING:
Active goal: ${plan?.goal || 'No active plan'}
Plan stage: ${plan?.currentStage || 'N/A'}
Week ${plan?.currentWeek || 0} of ${plan?.durationWeeks || 0}

RECENT ACTIVITY (last 7 days):
Sessions completed: ${sessionCount}
Average success score: ${avgScore}/5
Recent difficulty: ${recentDifficulty}
Walk quality trend: ${walkTrend}
Last session: ${lastSessionSummary}

Respond in a warm, direct trainer voice. Be specific to ${dog.name}, not generic. Think about what a great in-person trainer would say if they knew this dog.
```

### stores/coachStore.ts
```typescript
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
  isStreaming?: boolean
}

interface CoachStore {
  messages: ChatMessage[]
  conversationId: string | null
  isTyping: boolean
  hasReachedLimit: boolean
  limitMessage: string | null
  
  initialize: (dogId: string) => Promise<void>
  sendMessage: (content: string) => Promise<void>
  loadHistory: (conversationId: string) => Promise<void>
  clearConversation: () => void
}
```

initialize() should:
1. Check for existing active conversation for this dog
2. If exists: load last 20 messages
3. If not: create new conversation record in Supabase
4. Check rate limit status

sendMessage() should:
1. Optimistically add user message to messages array
2. Set isTyping = true
3. Call the Edge Function via supabase.functions.invoke('ai-coach-message', ...)
4. On response: add assistant message, set isTyping = false
5. On error: show error state, remove optimistic message

### app/(tabs)/coach/index.tsx
Complete chat screen.

**Layout:**
- Custom header: "Coach" title + context badge ("Knows Max · Plan active" in teal pill)
- Message list: FlatList, inverted (newest at bottom), auto-scroll to bottom on new message
- Bottom input bar: fixed above keyboard

**Context Badge:**
Small pill in header showing dog's name and plan status.
Tap it → show bottom sheet with what the coach knows:
- Dog's name, breed, age
- Current training goal and stage
- Sessions completed this week
- This reassures users the coach is personalized, not generic

**Message Bubbles:**
User messages: right-aligned, teal background, white text, rounded corners (tl, tr, bl)
Assistant messages: left-aligned, white background with border, dark text, rounded corners (tr, tl, br)
Each assistant message shows small Pawly logo avatar

**Typing Indicator:**
Three animated dots in an assistant bubble style. Uses Reanimated for the bounce animation.

**Quick Suggestions:**
Horizontal scroll of 4 suggestion chips above the input bar.
Suggestions are dynamic based on context. Default suggestions:
- "Why is ${dog.name} doing this?"
- "We had a bad walk today"  
- "What should I work on next?"
- "Is this normal for their age?"

After a session is completed: add "How did that session go?"
When plan advances a stage: add "What changes now?"

**Input Bar:**
- TextInput: multiline, max 4 lines before scrolling, placeholder "Ask about ${dog.name}…"
- Send button: teal, arrow icon, disabled when empty or while typing
- Character count shown when > 800 characters

**Rate Limit State:**
When hasReachedLimit = true:
- Show a banner above the input: "Daily coaching limit reached · Upgrade for unlimited"
- Input is disabled
- Upgrade CTA in the banner

**Empty State:**
For a new conversation, show 3 large suggestion cards in the center of the screen (before any messages):
- Card 1: "Ask why ${dog.name} is pulling on the leash"
- Card 2: "Get help with today's session"
- Card 3: "Understand ${dog.name}'s behavior better"
Tapping a card sends that message.

## Safety Requirements
Input validation on the client:
- Max 1000 characters
- Trim whitespace before sending
- Don't send empty messages

The Edge Function must also validate:
- Message is non-empty and under 1000 chars
- conversationId belongs to the authenticated user
- dogId belongs to the authenticated user

## Design Requirements
- Keyboard avoiding view that pushes input bar up smoothly
- FlatList performance optimized (getItemLayout, keyExtractor)
- Message timestamps shown on press-and-hold
- Long messages collapsible with "Read more" after 6 lines
- Smooth scroll to bottom when new message arrives

## Supabase SQL to Include
CREATE TABLE for coach_conversations and coach_messages with RLS policies.
```

---

---

# PR 07 — Walk Integration & Progress Tracking

**Goal:** Complete progress tracking system including walk logging, streaks, behavior scorecards, trend charts, and the milestones system.

**Delivers:**
- Walk logging modal (one-tap quality rating)
- Walk streak tracking
- Progress tab screen fully built
- Behavior scorecard component
- Trend charts (Victory Native)
- Milestone detection and display
- Shareable milestone cards (generated via react-native-view-shot)
- progressStore implemented

---

## Claude Code Prompt — PR 07

```
You are building Pawly, a mobile dog training app. This is PR 07: Walk Integration & Progress Tracking.

## Context
PR 01–06 are complete. Sessions are being completed and stored. The (tabs)/progress/index.tsx screen is a placeholder. sessionStore exists with completed session data. Walk logging buttons exist in the Today screen but aren't wired up.

## Task
Build the complete progress tracking system and the Walk logging feature.

## Files to Create or Modify

### components/shared/WalkLogModal.tsx
A bottom sheet modal for logging walk quality.

Trigger: "Log walk" button on Today screen, or post-walk reminder notification

Layout:
- Drag handle at top
- Header: "How was the walk?"
- Dog's name and today's walk goal shown as reminder
- Three large option cards (full-width, tappable):
  - 😊 "Better than before" — green tint
  - 😐 "About the same" — neutral
  - 😤 "Harder today" — orange tint
- Optional: "What happened?" text input (2 lines max)
- Duration (optional): "How long? (minutes)" number input
- "Save walk" button
- Small link: "Skip logging"

On save:
1. Insert into walk_logs table
2. Update walk streak
3. If quality improved: trigger potential milestone check
4. Dismiss modal
5. Update Today screen walk log button to "Walk logged ✓" (disabled, green)

### stores/progressStore.ts
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
  isLoading: boolean
  
  fetchProgressData: (dogId: string) => Promise<void>
  logWalk: (dogId: string, quality: 1 | 2 | 3, notes?: string, duration?: number) => Promise<void>
  fetchMilestones: (dogId: string) => Promise<void>
  checkAndCreateMilestones: (dogId: string) => Promise<Milestone | null>
}

interface BehaviorScore {
  behavior: string
  currentStage: number
  totalStages: 4
  sessionCount: number
  trend: 'improving' | 'stable' | 'declining'
  lastSessionScore: number
}

interface WeeklyData {
  weekStart: string
  sessionsCompleted: number
  avgSuccessScore: number
}
```

### app/(tabs)/progress/index.tsx — Progress Dashboard
Full implementation.

**Header:**
"[Dog Name]'s Progress" + week date range

**Streak Section:**
Two streak cards side by side:
- 🔥 Training streak: N days
- 🦮 Walk streak: N days
Each card shows current streak, longest streak, and a small 7-day activity dots row

**Behavior Scorecard:**
For each active behavior goal, show a progress card:
- Behavior name (e.g., "Leash Walking")
- Stage progress: filled dots (●●●○) Stage 3 of 4
- Progress bar (teal fill, shows % through current stage)
- Trend arrow (↑ improving / → stable / ↓ declining) with color
- "N sessions completed" count
- "Continue" button → navigates to today's session

**Sessions Chart:**
Title: "Sessions this month"
Bar chart using Victory Native (VictoryBar):
- X axis: last 4 weeks (week labels)
- Y axis: sessions count
- Bars in teal (#2D7D6F)
- Tapping a bar shows tooltip with week details

**Walk Quality Chart:**
Title: "Walk quality trend"
Line chart using Victory Native (VictoryLine):
- X axis: last 14 days
- Y axis: 1–3 (worse to better)
- Line in accent color (#E8845A)
- Points shown on each logged walk
- Days with no walk log show gap

**Milestones Section:**
Title: "Milestones"
Horizontal scroll of milestone cards:
- Each card: emoji, title, date achieved
- Unachieved milestones shown as locked (gray, partially transparent)
- Next achievable milestone highlighted with "almost there" style
- Tap any achieved milestone → share sheet

### components/progress/MilestoneCard.tsx
Props: milestone: Milestone, onShare?: () => void
Variants: achieved (full color, date), locked (gray), next (outlined, teal accent)
The shareable version of this card is a 1:1 square designed for Instagram.

### lib/milestoneEngine.ts
Define all milestone definitions and check logic:

```typescript
export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  { id: 'first_session', title: 'First step taken', description: 'Completed your first training session with Max', checkFn: (data) => data.totalSessions >= 1 },
  { id: 'streak_3', title: '3-day streak', description: '3 days of training in a row', checkFn: (data) => data.currentStreak >= 3 },
  { id: 'streak_7', title: 'One week strong', description: '7 days of training in a row', checkFn: (data) => data.currentStreak >= 7 },
  { id: 'sessions_10', title: '10 sessions done', description: 'Completed 10 training sessions', checkFn: (data) => data.totalSessions >= 10 },
  { id: 'sessions_25', title: '25 sessions done', checkFn: (data) => data.totalSessions >= 25 },
  { id: 'stage_advance', title: 'Level up', description: 'Advanced to a new training stage', checkFn: (data) => data.stageAdvances >= 1 },
  { id: 'walk_streak_5', title: '5 walks logged', checkFn: (data) => data.walkStreak >= 5 },
  { id: 'walk_improvement', title: 'Walks getting better', description: '3 consecutive walk quality improvements', checkFn: (data) => data.consecutiveWalkImprovements >= 3 },
  { id: 'first_video', title: 'Show and tell', description: 'Uploaded your first training video', checkFn: (data) => data.videosUploaded >= 1 },
]

export async function checkMilestones(dogId: string, userId: string): Promise<Milestone | null>
```

### components/progress/ShareCard.tsx
A component that renders a beautiful shareable milestone card.
Used with react-native-view-shot to capture as an image.

Layout (square, 1080x1080px equivalent):
- Pawly teal gradient background
- Dog's name large at top
- Milestone emoji (very large, centered)
- Milestone title
- Date achieved
- "Pawly" wordmark at bottom with small paw icon
- Subtle confetti pattern overlay

After capture: share via react-native-share to Instagram Stories or general share sheet.

### app/(tabs)/progress/milestones.tsx
Full milestones screen (all milestones, achieved and locked).
Grid layout (2 columns).
Achieved shown in full color.
Locked shown in gray with lock icon.

## Supabase SQL to Include
CREATE TABLE for milestones, streaks, walk_logs with RLS policies.
Also provide the SQL for a database function that updates streak counts after session or walk insertion:

```sql
CREATE OR REPLACE FUNCTION update_streak()
RETURNS TRIGGER AS $$
-- Implementation here
$$ LANGUAGE plpgsql;
```

## Design Requirements
- Charts use Victory Native with Pawly color palette
- All charts have loading skeleton states
- Walk log modal uses @gorhom/bottom-sheet (add to dependencies)
- Share card capture uses react-native-view-shot
- Milestone achievement triggers a full-screen celebration modal (Lottie confetti + haptics)
- All data is real — no mock data anywhere in this PR
```

---

---

# PR 08 — Video Upload & Expert Review

**Goal:** Complete video upload flow (onboarding and in-app), local compression, upload to Supabase Storage, expert review queue, and the video library (Memory Lane foundation).

**Delivers:**
- In-app video upload screen (from session completion and standalone)
- Local video compression before upload
- Upload progress UI
- Video library screen (Memory Lane)
- Expert review request flow
- Expert review status tracking
- Admin webhook handler for review completion notification

---

## Claude Code Prompt — PR 08

```
You are building Pawly, a mobile dog training app. This is PR 08: Video Upload & Expert Review.

## Context
PR 01–07 are complete. The onboarding video upload screen from PR 03 exists but may need refinement. The video storage bucket exists in Supabase. Expert review is referenced in the subscription system but not built.

## Task
Build the complete video upload system, the in-app video library, and the expert review workflow.

## Architecture Note
V1 has NO AI video analysis. Videos are stored and optionally reviewed by human trainers. AI analysis is planned for V2. Do not build or stub AI video analysis — it will create false expectations.

## Files to Create or Modify

### lib/videoUploader.ts
Complete video upload utility:

```typescript
interface UploadOptions {
  uri: string
  userId: string
  dogId: string
  context: 'onboarding' | 'session' | 'behavior'
  behaviorContext?: string
  beforeContext?: string
  goalContext?: string
  onProgress?: (percent: number) => void
}

interface UploadResult {
  videoId: string
  storagePath: string
  thumbnailUrl: string
  durationSeconds: number
}

export async function uploadVideo(options: UploadOptions): Promise<UploadResult>
export async function compressVideo(uri: string): Promise<string>
export async function generateThumbnail(uri: string): Promise<string>
export async function getVideoDuration(uri: string): Promise<number>
```

compressVideo():
- Use expo-video-thumbnails for thumbnail
- Target: 720p max resolution, H.264
- Use expo-av to check duration (reject if > 5 minutes)
- Return compressed file URI

uploadVideo():
1. Compress video
2. Generate thumbnail
3. Get duration
4. Upload video to Supabase Storage at: videos/{userId}/{dogId}/{context}_{timestamp}.mp4
5. Upload thumbnail to: thumbnails/{userId}/{dogId}/{timestamp}.jpg
6. Insert video record in videos table
7. Return UploadResult

### app/(tabs)/train/upload-video.tsx
Standalone video upload screen (accessible from session completion and from a "+" button in the video library).

Layout:
**Step 1 — Choose video:**
- Large centered area:
  - "Record new video" button (camera icon, primary)
  - "Choose from library" button (photo icon, secondary)
  - Or drag-and-drop hint text
- Below: "Tips for good training videos" expandable section with 4 tips

**Step 2 — Add context (required before upload):**
After video selected, show thumbnail preview with duration badge.
Form fields:
- "What behavior are you showing?" — required — SegmentedControl or dropdown matching the 8 behavior categories
- "What happened just before this clip?" — optional — TextInput
- "What were you hoping to see?" — optional — TextInput
- "Is this a training session or a behavior problem?" — toggle
Remove/change video link.

**Step 3 — Upload:**
"Upload video" button.
Show progress bar (0–100%) during upload.
On complete: success state with options:
- "Request expert review" (if has credits) → expert review request flow
- "Save to library" → navigate to video library
- "Done" → navigate back

### components/video/VideoUploadProgress.tsx
Full-screen overlay component shown during upload.
Shows: animated upload icon, percentage, "Don't close the app" warning, estimated time remaining.

### app/(tabs)/know/videos.tsx — Video Library (Memory Lane foundation)
Accessible from the Know tab.

Layout:
**Header:** "Max's Videos" + upload button ("+")

**Filter chips:** All · Training · Behavior · Expert Reviewed

**Video Grid:** 2-column grid of thumbnail cards.
Each card:
- Thumbnail image
- Duration badge (bottom right of thumbnail)
- Context label below: e.g., "Leash Walking · 14 Mar"
- Expert review badge (if reviewed): green checkmark
- Tap → video player screen

**Empty state:** "No videos yet. Upload a clip from your next training session."

**Video count and storage usage:** Small text at bottom: "12 videos · 340MB used"

### app/(tabs)/know/video-player.tsx
Full-screen video player screen (pushed onto stack when tapping a video in library).

- Uses expo-av Video component
- Playback controls: play/pause, scrub bar, fullscreen toggle
- Video metadata shown below player: context, date, duration
- Expert review section (if reviewed):
  - Trainer name and photo
  - Review text feedback
  - Timestamp markers as chapter list (each tappable to seek to that point)
- "Request review" CTA if not yet reviewed (and user has credits)
- Delete button (with confirmation dialog)

### components/video/ExpertReviewRequest.tsx
Bottom sheet for requesting expert review.

Shows:
- "Get a trainer's eyes on this" header
- What's included: bullet points (timestamped feedback, follow-up question, 48h turnaround)
- Credits remaining: "You have 2 review credits remaining"
- "Use 1 credit for this video" primary button
- If no credits: "Get review credits" → paywall/add-on purchase

On confirm:
1. Create expert_reviews record (status: 'queued')
2. Deduct review credit from user's pack
3. Send notification to admin (via Supabase Edge Function that triggers email)
4. Show confirmation: "Review requested! You'll be notified within 48 hours."

### supabase/functions/notify-expert-review/index.ts
Edge Function triggered when a new expert_review record is inserted.
Sends an email notification to the trainer queue admin email with:
- Review ID and video link
- Dog profile summary
- Owner's context notes

Use Resend (resend.com) for email sending — add RESEND_API_KEY to Supabase secrets.

### supabase/functions/complete-expert-review/index.ts
Edge Function called by the admin panel when a trainer completes a review.
Input: { reviewId, feedback, timestamps: [{time, note}] }
Actions:
1. Update expert_reviews record (status: 'complete', feedback, timestamps)
2. Send push notification to the user: "Your video review from [Trainer] is ready"
3. Return success

## Admin Considerations
Note in code comments: a simple admin interface for trainers to view the queue and submit reviews will be needed. This can be a separate Next.js app or Supabase Studio with direct table access for v1. Full admin panel is out of scope for this PR.

## Supabase SQL to Include
CREATE TABLE for videos and expert_reviews.
CREATE the videos storage bucket with appropriate policies (private, user-scoped).
RLS policies ensuring users can only access their own videos.

## Design Requirements
- Video upload shows real progress percentage (not fake progress bar)
- Upload continues if app is backgrounded (use expo-background-fetch or expo-task-manager)
- Thumbnails cached locally after first load (expo-image with caching)
- Video player shows buffering indicator
- Expert review status shown clearly: Queued (gray), In Review (amber), Complete (green)
```

---

---

# PR 09 — Notifications, Streaks & Milestones

**Goal:** The complete notification and habit-building system. Push notifications are scheduled based on user behavior, training schedule, and lifecycle events. Streaks are maintained correctly across timezones. The full milestone system is wired end-to-end.

**Delivers:**
- Push notification registration and token management
- All 9 notification types implemented
- Notification preferences screen
- Streak calculation with timezone awareness
- At-risk streak notifications
- Milestone detection wired to session and walk completion
- Lifecycle trigger system (age-based prompts)
- Weekly summary notification

---

## Claude Code Prompt — PR 09

```
You are building Pawly, a mobile dog training app. This is PR 09: Notifications, Streaks & Milestones.

## Context
PR 01–08 are complete. Sessions and walk logs are being saved. Milestone definitions exist in lib/milestoneEngine.ts. Streak records exist in the database. Push notification token registration exists but isn't fully wired. The notification preferences UI doesn't exist yet.

## Task
Build the complete notification system, wire up streak calculations with timezone awareness, and ensure milestones fire correctly at all trigger points.

## Files to Create or Modify

### lib/notifications.ts
Complete notification manager:

```typescript
// Register device for push notifications
export async function registerForPushNotifications(): Promise<void>

// Schedule a local notification
export async function scheduleLocalNotification(params: {
  title: string
  body: string
  trigger: Date | { seconds: number }
  data?: Record<string, unknown>
  identifier?: string
}): Promise<void>

// Cancel scheduled notification
export async function cancelNotification(identifier: string): Promise<void>

// Cancel all scheduled notifications
export async function cancelAllNotifications(): Promise<void>

// Handle notification received while app is foregrounded
export function handleForegroundNotification(notification: Notification): void

// Handle notification tap (app in background)
export function handleNotificationResponse(response: NotificationResponse): void

// Schedule all recurring notifications for a user
export async function scheduleUserNotifications(
  userId: string,
  dogId: string,
  prefs: NotificationPrefs
): Promise<void>
```

### stores/notificationStore.ts
```typescript
interface NotificationStore {
  pushToken: string | null
  prefs: NotificationPrefs
  isPermissionGranted: boolean
  pendingNotifications: ScheduledNotification[]
  
  initialize: () => Promise<void>
  updatePrefs: (prefs: Partial<NotificationPrefs>) => Promise<void>
  requestPermission: () => Promise<boolean>
  rescheduleAll: () => Promise<void>
}

interface NotificationPrefs {
  dailyReminder: boolean
  dailyReminderTime: string   // "HH:MM" in user's local timezone
  walkReminders: boolean
  streakAlerts: boolean
  milestoneAlerts: boolean
  insights: boolean
  expertReview: boolean
  lifecycle: boolean
  weeklySummary: boolean
}
```

### Notification Types — Full Implementation

**1. Daily Training Reminder**
Scheduled as a recurring local notification at user's preferred time.
- Title: "Time to train ${dog.name}"
- Body: Varies based on streak and plan progress:
  - Active streak: "Keep your ${streak}-day streak going · ${session.title} · ${duration} min"
  - New streak: "${dog.name}'s plan is waiting · ${session.title}"
  - Post-rest day: "Ready to pick back up? ${session.title} is next."
Reschedule when: user completes session (so next reminder is for next session)

**2. Walk Goal Reminder**
Scheduled based on user's typical walk time (collected during onboarding — "When do you usually walk?")
- Title: "Walk time for ${dog.name}"
- Body: Today's walk goal text (from getWalkGoal())
Send daily when walk preference is enabled.

**3. Post-Walk Check-In**
Scheduled 45 minutes after the walk reminder.
Only send if no walk logged yet today.
- Title: "How was the walk?"
- Body: "One tap to log how ${dog.name} did today."
Cancel if walk is logged before this fires.

**4. Missed Session Follow-Up**
Triggered via Supabase Edge Function (cron) if no session logged in 48 hours for an active user.
- Title: "It's been a couple days"
- Body (rotate between):
  - "No pressure. One easy win today keeps ${dog.name}'s progress moving."
  - "Even 5 minutes today makes a difference. ${session.title} is waiting."
  - "${dog.name} is ready when you are."

**5. Streak At Risk**
Scheduled each day at 8pm if no session or walk logged yet and user has a streak ≥ 3 days.
- Title: "Your ${streak}-day streak ends tonight"
- Body: "5 minutes is enough. ${session.title} takes ${duration} min."

**6. Milestone Achievement**
Fired immediately when a milestone is created in the milestones table.
Use a Supabase database webhook → Edge Function → Expo Push Notification Service.
- Title: "🎉 ${milestone.title}"
- Body: "${milestone.description}"

**7. New Insight Available**
Fired when a new insight is created for the dog (weekly cron).
- Title: "New insight about ${dog.name}"
- Body: insight.title

**8. Expert Review Complete**
Fired when expert_reviews.status changes to 'complete'.
Supabase database webhook → Edge Function.
- Title: "Your video review is ready"
- Body: "Feedback from [trainer name] is waiting for ${dog.name}."

**9. Lifecycle Alert**
Monthly cron checks if any dog is approaching an age milestone:
- Turning 6 months (adolescence warning)
- Turning 12 months (young adult transition)
- Turning 7 years (senior transition)
Trigger 2 weeks before milestone:
- Title: "${dog.name} is growing up"
- Body: "They're approaching ${lifecycle_stage}. Here's what to expect."

### supabase/functions/send-push-notification/index.ts
Reusable Edge Function for sending push notifications via Expo Push API.

```typescript
interface SendPushParams {
  userId: string
  title: string
  body: string
  data?: Record<string, unknown>
}

export async function sendPushNotification(params: SendPushParams): Promise<void>
```

Fetches user's push token from users table, sends to Expo Push API:
POST https://exp.host/--/api/v2/push/send

### supabase/functions/daily-cron/index.ts
Cron function (runs daily at 8pm UTC). Handles:
1. Missed session follow-ups (> 48h inactive)
2. Streak at-risk notifications (no activity today, streak ≥ 3)
3. Weekly summary (Sundays only)

Set up with Supabase cron via pg_cron:
```sql
SELECT cron.schedule('daily-cron', '0 20 * * *', $$
  SELECT net.http_post(
    url := 'https://{project}.supabase.co/functions/v1/daily-cron',
    headers := '{"Authorization": "Bearer {service_role_key}"}'
  );
$$);
```

### lib/streakCalculator.ts
Timezone-aware streak calculation:

```typescript
// A "day" is defined in the user's local timezone
// A streak is maintained if there is at least 1 qualifying activity per calendar day
// Missing a day breaks the streak

export function calculateStreakFromLogs(
  logs: { createdAt: string }[],
  userTimezone: string
): { currentStreak: number, longestStreak: number }

export function isStreakAtRisk(
  lastActivityAt: string,
  userTimezone: string
): boolean

export function getStreakStatus(
  currentStreak: number,
  lastActivityAt: string,
  userTimezone: string
): 'active' | 'at_risk' | 'broken'
```

Important: Use the 'date-fns-tz' library for all timezone conversions. Add to dependencies.

### app/profile/notification-settings.tsx
Notification preferences screen.

Layout: List of toggle rows grouped by category:

**Training**
- Daily training reminder [toggle]
  - If on: show time picker (native time picker via @react-native-community/datetimepicker)
- Walk reminders [toggle]
- Post-walk check-in [toggle]

**Progress**
- Streak alerts [toggle]
- Milestone celebrations [toggle]

**Content**
- Weekly insights [toggle]
- Lifecycle updates [toggle]

**Reviews**
- Expert review notifications [toggle]

Bottom: "Notification permission status" — shows current iOS/Android permission status with "Open settings" link if denied.

Each toggle change immediately calls updatePrefs() and rescheduleAll().

## Notification Deep Linking
All notifications should deep link into the relevant screen when tapped.
Use Expo Router's useURL() hook in the root layout to handle notification-initiated navigation:

| Notification Type | Deep Link |
|---|---|
| Daily reminder | /train |
| Walk check-in | /train (opens walk modal) |
| Milestone | /progress/milestones |
| Expert review | /know/videos |
| Insight | /know |
| Lifecycle alert | /know |

## Design Requirements
- Notification permission prompt should NOT show on first app launch — only after the user completes their first session (when they have something worth being notified about)
- Show a pre-permission explanation screen before the OS dialog: "Pawly sends reminders at times that work for you. No spam, just ${dog.name}'s training."
- Time picker uses native iOS/Android time pickers (not a custom component)
- All toggle changes have optimistic UI (update immediately, revert on error)
```

---

---

# PR 10 — Paywall & Subscription Management

**Goal:** Complete subscription system. Paywall screen, feature gating, RevenueCat integration, subscription management, and restore purchases. The app is ready for App Store submission after this PR.

**Delivers:**
- Paywall screen (all three plans displayed)
- Feature gating throughout the app
- RevenueCat fully integrated for iOS and Android
- Subscription status synced to Supabase via webhook
- Restore purchases flow
- Subscription management screen
- Expert review credit pack purchase (consumable)
- App Store submission checklist

---

## Claude Code Prompt — PR 10

```
You are building Pawly, a mobile dog training app. This is PR 10: Paywall & Subscription Management. This is the final PR before App Store submission.

## Context
PR 01–09 are complete. Feature gates exist throughout the app as stubs (all currently return true / unlocked). RevenueCat SDK is installed. The profile tab has placeholder subscription settings.

## Task
Implement the complete subscription and paywall system, wire up all feature gates, and prepare the app for App Store submission.

## Files to Create or Modify

### lib/revenuecat.ts
Complete RevenueCat integration:

```typescript
import Purchases, { 
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL
} from 'react-native-purchases'

// Initialize RevenueCat (call on app start, after auth)
export async function initializeRevenueCat(userId: string): Promise<void>

// Get available subscription packages
export async function getOfferings(): Promise<{
  monthly: PurchasesPackage | null
  annual: PurchasesPackage | null
  premium_monthly: PurchasesPackage | null
  premium_annual: PurchasesPackage | null
  expert_review_pack: PurchasesPackage | null
}>

// Purchase a package
export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo>

// Restore purchases
export async function restorePurchases(): Promise<CustomerInfo>

// Get current subscription tier from CustomerInfo
export function getTierFromCustomerInfo(info: CustomerInfo): SubscriptionTier

// Check if user has specific entitlement
export function hasEntitlement(info: CustomerInfo, entitlement: string): boolean

// Get remaining review credits (from consumable purchases)
export function getRemainingReviewCredits(info: CustomerInfo): number
```

RevenueCat entitlements to configure (document what to set up in RevenueCat dashboard):
- Entitlement: `core` → products: `pawly_core_monthly`, `pawly_core_annual`
- Entitlement: `premium` → products: `pawly_premium_monthly`, `pawly_premium_annual`
- Consumable: `expert_review_pack` (3 credits, $29)

### stores/subscriptionStore.ts
```typescript
interface SubscriptionStore {
  tier: SubscriptionTier
  customerInfo: CustomerInfo | null
  reviewCreditsRemaining: number
  isLoading: boolean
  
  initialize: (userId: string) => Promise<void>
  purchaseCore: (period: 'monthly' | 'annual') => Promise<void>
  purchasePremium: (period: 'monthly' | 'annual') => Promise<void>
  purchaseReviewPack: () => Promise<void>
  restorePurchases: () => Promise<void>
  refreshStatus: () => Promise<void>
}
```

### lib/featureGate.ts
Central feature gating logic:

```typescript
export type Feature =
  | 'full_plan'
  | 'unlimited_sessions'
  | 'ai_coach_unlimited'
  | 'ai_coach_limited'
  | 'video_upload'
  | 'video_upload_unlimited'
  | 'expert_review'
  | 'expert_review_monthly'
  | 'family_mode'
  | 'advanced_programs'
  | 'annual_report'

export function canAccess(feature: Feature, tier: SubscriptionTier): boolean

export function getFeatureLimit(feature: Feature, tier: SubscriptionTier): number | 'unlimited' | false

// Usage example:
// if (!canAccess('full_plan', user.tier)) { showPaywall() }
```

Feature access matrix:
| Feature | Free | Core | Premium |
|---|---|---|---|
| full_plan | false | true | true |
| unlimited_sessions | false | true | true |
| ai_coach_unlimited | false | true | true |
| ai_coach_limited | 5/day | true | true |
| video_upload | 1 total | 20/day | unlimited |
| expert_review | false | add-on | 2/month |
| family_mode | false | false | true |
| advanced_programs | false | false | true |
| annual_report | false | true | true |

### app/paywall.tsx — Paywall Screen
Full-screen modal (not tab navigation).

**Header:**
- X close button (top left — for users who don't want to subscribe now)
- "Unlock Pawly" or context-specific header, e.g., "Unlock your full plan"

**Social proof:**
Rotating testimonials — 3 short quotes from dog owners (hardcoded for v1):
- "Max's leash pulling is 80% better in 3 weeks" — Sarah, Labrador owner
- "Finally a training app that actually knows my dog" — James, Border Collie owner  
- "The daily sessions take 8 minutes. My dog is transformed." — Maria, Rescue dog owner

**Plan Cards:**
Three cards in a vertical stack:

**Free (current if on free tier):**
- "Free — always"
- Feature list: onboarding, first session, limited AI (5/day), 1 video
- "Your current plan" (grayed out CTA)

**Core (highlighted — this is the recommended plan):**
- "Core" with "Most Popular" badge
- Monthly: $14.99/mo
- Annual: $89.99/yr — show savings: "Save 50% · $7.50/mo"
- Toggle between monthly/annual (toggle at top of card)
- Feature list: unlimited sessions, full AI coach, 20 videos/day, progress analytics, walk tracking, milestones, annual report
- "Start 7-day free trial" primary button (or "Subscribe" if trial used)

**Premium:**
- "Premium"
- Monthly: $29.99/mo
- Annual: $179.99/yr
- Feature list: everything in Core + expert review (2/month), family mode, advanced programs, priority support
- "Try Premium" secondary button

**Trust signals:**
- "Cancel anytime · Billed through App Store"
- "Restore purchases" link
- Privacy policy and Terms links

**Bottom note:** 
"Questions? We're at hello@pawly.app"

**Purchase flow:**
1. User taps "Start free trial" or "Subscribe"
2. Loading state on button
3. RevenueCat presents native iOS/Android purchase sheet
4. On success: update subscriptionStore, dismiss paywall, show brief celebration toast "Welcome to Pawly Core! 🐾"
5. On error: show error message inline

### Wiring Feature Gates Throughout the App

Go through the app and wire up real feature gates for:

1. **Plan Preview (onboarding):** Blur full plan after session 1 if free user. Show "Unlock your full plan" CTA.

2. **AI Coach:** Show remaining messages count ("4 of 5 daily messages used"). On limit reached: show inline upgrade prompt.

3. **Video Upload:** After 1 video (free), show gate: "Upload unlimited videos" with upgrade CTA.

4. **Progress charts:** Full charts locked on free. Show blurred chart with "See your full progress" CTA.

5. **Annual Report:** Show "Coming up: your annual report" teaser but gate generation.

Each gate should show a consistent GateCard component that:
- Explains what's locked
- Shows the plan required
- Has an "Unlock" button that opens the paywall
- Is dismissible (doesn't block the whole screen — partial gate)

### components/shared/GateCard.tsx
```typescript
interface GateCardProps {
  feature: string            // "Full training plan"
  description: string        // "See all 28 sessions in your personalized plan"
  requiredTier: 'core' | 'premium'
  onUnlock: () => void
}
```
Style: Frosted glass effect over the locked content. Centered card with lock icon, feature name, and "Unlock [feature]" teal button.

### app/profile/subscription.tsx — Subscription Management
Shows current plan details and management options.

Layout:
- Current plan card: tier name, billing period, renewal date
- "Manage subscription" → opens App Store/Play Store subscription management (via Linking.openURL)
- "Restore purchases" button
- Expert review credits: "2 reviews remaining" + "Buy more" link
- "Upgrade to Premium" (if on Core) / "Downgrade" info

### supabase/functions/revenuecat-webhook/index.ts
Handles RevenueCat webhook events to keep Supabase subscription status in sync:

Events to handle:
- INITIAL_PURCHASE → set subscription_tier, subscription_expires_at
- RENEWAL → extend subscription_expires_at
- PRODUCT_CHANGE → update tier
- CANCELLATION → schedule downgrade at period end
- EXPIRATION → set tier back to 'free'
- BILLING_ISSUE → send push notification

Validate webhook signature using RevenueCat webhook secret.

## App Store Submission Checklist
At the bottom of this PR, include a file: APP_STORE_CHECKLIST.md

Cover:
- App icon requirements (1024x1024, no alpha channel)
- Screenshot requirements (all device sizes)
- App Store description (500 words, keyword-optimized)
- Privacy policy URL requirement
- App tracking transparency (if applicable)
- Required capability declarations (camera, microphone for video)
- Expo EAS Submit configuration
- TestFlight beta testing setup
- App Review guidelines notes (subscription apps, camera permissions)
- iOS in-app purchase configuration in App Store Connect
- Android billing configuration in Play Console

## Design Requirements
- Paywall uses smooth spring animation when presenting (slides up from bottom)
- Plan cards animate in with staggered FadeInDown using Reanimated
- Recommended plan (Core) is visually distinct — larger card, highlighted border, Most Popular badge
- Purchase button shows success animation (checkmark + scale) on completion
- Annual toggle between monthly/annual pricing is smooth and immediate
- All monetary values display correctly formatted per locale (use Intl.NumberFormat)
- Paywall closes smoothly on success (don't just pop — use a celebratory dismiss)

## Requirements
- No hardcoded prices in the UI — always read from RevenueCat offerings
- Handle edge cases: no internet, purchase cancelled by user, already subscribed
- Restore purchases must work and update the UI immediately
- All feature gates must be enforced server-side too (Supabase RLS + rate limits), not just client-side
- Test purchase flows using RevenueCat sandbox/StoreKit testing before submission
```

---

## Implementation Notes

### Branch Strategy
```
main
├── pr/01-foundation
├── pr/02-auth
├── pr/03-onboarding
├── pr/04-protocol-engine
├── pr/05-session-engine
├── pr/06-ai-coach
├── pr/07-progress-tracking
├── pr/08-video-upload
├── pr/09-notifications
└── pr/10-paywall
```

### Before Starting Each PR
1. Merge previous PR to main
2. Create new branch
3. Open Claude Code in project root
4. Paste the full prompt
5. Review the output before accepting
6. Test on real device (not just simulator)
7. Fix any TypeScript errors before moving on

### Common Claude Code Tips
- If Claude Code stops mid-implementation, say: "Continue from where you left off"
- If a file is too long, say: "Break this into smaller files following the same patterns"
- If something breaks, say: "Here is the error. Fix it without changing the overall architecture"
- Always ask Claude Code to write the Supabase SQL for each PR and run it before testing

### Testing Checkpoints
After each PR, verify:
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] App builds on iOS simulator
- [ ] App builds on Android emulator
- [ ] Core flow works on a real device
- [ ] No console errors on the happy path

---

*End of Pawly PR Roadmap v1.0*