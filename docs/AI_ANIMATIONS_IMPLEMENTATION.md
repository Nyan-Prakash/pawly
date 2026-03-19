# Exercise Animations Implementation Guide

This document outlines how to implement flat, professional, simple animations for each exercise in the Pawly app. Instead of animating by hand, we leverage AI (specifically Claude) to generate **Lottie (JSON)** animations.

## 1. Why Lottie?
Lottie is an industry-standard format for animations. It is:
- **Vector-based:** Scales perfectly without pixelation.
- **Lightweight:** Pure JSON data, much smaller than GIFs or videos.
- **Dynamic:** Can be stored in a database or directly in code.
- **AI-Friendly:** Claude is excellent at generating the specific JSON structure required for Lottie animations.

---

## 2. Storage Strategy: Database vs. Local Code

You have two primary options for where to store the Lottie JSON data.

### Option A: Database (Supabase) - *Recommended for flexibility*
Store the JSON string in a `JSONB` column in the `protocols` table.
- **Pros:** Update animations anytime without an App Store release; keeps the app bundle smaller.
- **Cons:** Tiny delay on first load while fetching from the database.

### Option B: Local Code (`protocols.ts`) - *Recommended for performance*
Store the JSON directly inside the `Protocol` object in `constants/protocols.ts`.
- **Pros:** Animations load instantly with zero network delay; perfect for offline use.
- **Cons:** Increases the JavaScript bundle size; requires a code push to update an animation.

---

## 3. Implementation: Option A (Database)

### SQL Migration
Run this in the Supabase SQL Editor:
```sql
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS animation_json JSONB;
```

### Frontend Integration
Ensure the `animation_json` is included in your `Protocol` type and fetched via your data store.

---

## 4. Implementation: Option B (Local Code)

### Update Protocol Type
Modify `constants/protocols.ts`:
```typescript
export interface Protocol {
  // ... existing fields
  animationJson?: object | null; // Add this line
}
```

### Add Animation Data
```typescript
const sit_animation = { /* ... Lottie JSON data ... */ };

const recall_stage1: Protocol = {
  id: 'recall_s1',
  // ...
  animationJson: sit_animation,
};
```

---

## 5. Shared UI Component

Regardless of storage, use this component to render the animation.

### Dependency
```bash
npx expo install lottie-react-native
```

### Create `components/session/ExerciseAnimation.tsx`
```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface ExerciseAnimationProps {
  animationJson: object | null | undefined;
  size?: number;
}

export function ExerciseAnimation({ animationJson, size = 150 }: ExerciseAnimationProps) {
  if (!animationJson) return null;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <LottieView
        source={animationJson}
        autoPlay
        loop
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
});
```

---

## 6. AI Agent Prompts

Use these prompts with an AI Coding Agent (like Claude) to implement the animations.

### Prompt 1: Choose Strategy and Setup
> "I want to add Lottie animations to my exercises. I have chosen **[OPTION A or B]** from `docs/AI_ANIMATIONS_IMPLEMENTATION.md`. Please:
> 1. Perform the necessary setup (SQL migration or Interface update).
> 2. Install `lottie-react-native`.
> 3. Create the `ExerciseAnimation.tsx` component.
> 4. Modify `StepCard.tsx` to render this component when `animationJson` is present."

### Prompt 2: Animation Generation (Run for each exercise)
> "You are an expert Lottie animator. Please generate a simple, flat-style, professional Lottie animation in JSON format for the dog training exercise: **[INSERT EXERCISE TITLE]**.
>
> **Requirements:**
> - Style: Minimalist, flat icons, professional (using colors: #2563EB, #0F172A).
> - Content: A simple dog icon performing: [INSERT BRIEF DESCRIPTION].
> - Loop: The animation should loop smoothly.
> - Output: Provide the raw JSON object and **[INSERT IT INTO protocols.ts / CREATE A SQL UPDATE]**."

---

## 7. Pro Tips
- **Simplicity:** AI creates better Lottie code when the shapes are simple (circles, rectangles).
- **Colors:** Explicitly tell the AI to use your brand colors from `constants/colors.ts`.
- **Consistency:** Tell the AI to use the same "dog" character model for every animation.
