# Pawly (PR 01: Foundation)

Pawly is an Expo + React Native app scaffold with file-based routing, core providers, and tab navigation.

## Requirements

- Node.js 20+
- npm 10+
- Xcode (for iOS simulator)
- Android Studio (for Android emulator)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment file and set values:

```bash
cp .env.example .env
```

Required env vars:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_POSTHOG_API_KEY`
- `EXPO_PUBLIC_SENTRY_DSN`
- `EXPO_PUBLIC_REVENUECAT_IOS_KEY`
- `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`
- `APP_ENV`

3. Start development server:

```bash
npx expo start
```

## Scripts

- `npm run start`
- `npm run ios`
- `npm run android`
- `npm run web`
- `npm run typecheck`

## Implemented Foundation

- Expo SDK 52 + Expo Router v4 file-based navigation
- TypeScript strict mode
- Zustand v5 auth store scaffold
- React Query provider setup
- Supabase client with SecureStore auth adapter
- NativeWind v4 setup
- Reanimated + Gesture Handler integration
- Tabs: Train, Progress, Coach, Know, Profile
