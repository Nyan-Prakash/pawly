# Exercise Animations Implementation Guide

This document outlines how to implement flat, professional, simple animations for each exercise in the Pawly app. Instead of animating by hand, we leverage AI (specifically Claude) to generate **Lottie (JSON)** animations that are stored in the database and rendered in the app.

## 1. Why Lottie?
Lottie is an industry-standard format for animations. It is:
- **Vector-based:** Scales perfectly without pixelation.
- **Lightweight:** Pure JSON data, much smaller than GIFs or videos.
- **Dynamic:** Can be stored in a database and rendered at runtime.
- **AI-Friendly:** Claude is excellent at generating the specific JSON structure required for Lottie animations.

---

## 2. Database Schema Update

We need to store the animation JSON directly in the `protocols` table.

### SQL Migration
Run this in the Supabase SQL Editor:

```sql
ALTER TABLE protocols
ADD COLUMN IF NOT EXISTS animation_json JSONB;

-- Comment describing the column
COMMENT ON COLUMN protocols.animation_json IS 'Lottie animation JSON for the exercise';
```

---

## 3. Frontend Implementation

### Dependency
Ensure `lottie-react-native` is installed:
```bash
npx expo install lottie-react-native
```

### Exercise Animation Component
Create `components/session/ExerciseAnimation.tsx`:

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface ExerciseAnimationProps {
  animationJson: object | null;
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

### Integrating into StepCard
Update `components/session/StepCard.tsx` to display the animation if it exists on the protocol/step. (Note: You can store animations at the Protocol level for the whole exercise or per-step).

---

## 4. Automated AI Workflow

The goal is to have an AI agent (like Claude Code) take an exercise description and generate the Lottie JSON.

### Step 1: Input
The AI reads the `Protocol` details from `constants/protocols.ts` or the database.
### Step 2: Generation
The AI generates a valid Lottie JSON string representing a flat, minimalist dog training animation (e.g., a simple dog icon sitting).
### Step 3: Persistence
The AI runs a script or SQL query to update the `protocols` table with the generated JSON.

---

## 5. AI Agent Prompts

Use these prompts with an AI Coding Agent (like Claude) to implement the animations.

### Prompt 1: Initial Setup
> "I want to add Lottie animations to my exercises. Please follow the `docs/AI_ANIMATIONS_IMPLEMENTATION.md` to:
> 1. Create the SQL migration to add `animation_json` to the `protocols` table.
> 2. Install `lottie-react-native`.
> 3. Create the `ExerciseAnimation.tsx` component.
> 4. Modify `StepCard.tsx` to render this component when `animation_json` is present."

### Prompt 2: Animation Generation (Run for each exercise)
> "You are an expert Lottie animator. Please generate a simple, flat-style, professional Lottie animation in JSON format for the dog training exercise: **[INSERT EXERCISE TITLE]**.
>
> **Requirements:**
> - Style: Minimalist, flat icons, professional (using the app's brand colors).
> - Content: A simple dog icon performing the action: [INSERT BRIEF DESCRIPTION, e.g., sitting and receiving a treat].
> - Loop: The animation should loop smoothly.
> - Output: Provide the raw JSON object only.
>
> Once generated, please create a script to update the `protocols` table in Supabase for the ID `[INSERT PROTOCOL ID]` with this JSON."

### Prompt 3: Bulk Generation Script
> "Write a Node.js script that iterates through all protocols in `constants/protocols.ts`. For each one, it should:
> 1. Use your internal knowledge to generate a minimalist Lottie JSON representing that exercise.
> 2. Generate a SQL `UPDATE` statement to insert that JSON into the `animation_json` column for that protocol ID.
> 3. Save all these SQL statements into a single migration file `supabase/migrations/seed_animations.sql`."

---

## 6. Pro Tips for High-Quality AI Animations
- **Colors:** Instruct the AI to use specific Hex codes from `constants/colors.ts` (e.g., `#2563EB` for the primary action).
- **Simplicity:** Keep the number of shapes low. Simple transforms (scale, position, rotation) of basic shapes work best for AI-generated Lottie.
- **Consistency:** Use the same 'dog' icon shapes across all animations for a unified look.
