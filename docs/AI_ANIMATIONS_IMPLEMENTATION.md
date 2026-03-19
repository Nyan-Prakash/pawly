# Exercise Animations Implementation Guide

This document outlines how to implement flat, professional, simple animations for each exercise in the Pawly app using AI-generated **Lottie (JSON)** animations.

## 1. Chosen Strategy: Local Code (`protocols.ts`)
As requested, we have implemented the "Option B" strategy where animations are stored directly in the `constants/protocols.ts` file.

- **Status:** Core infrastructure implemented.
- **Dependency:** `lottie-react-native` installed.
- **UI:** `ExerciseAnimation.tsx` component created and integrated into `StepCard.tsx`.
- **Data Structure:** `Protocol` interface updated with optional `animationJson` field.

---

## 2. Shared UI Component

Animations are rendered using the `ExerciseAnimation` component:

```tsx
import { ExerciseAnimation } from './ExerciseAnimation';

// Usage in StepCard
<ExerciseAnimation animationJson={protocol.animationJson} />
```

---

## 3. How to Add Animations

To add an animation to an exercise, follow these steps:

### Step 1: Generate the Lottie JSON
Use an AI agent (like Claude) with the prompt below to generate the JSON code for a specific exercise.

### Step 2: Add to `protocols.ts`
1. Define the animation object in `constants/protocols.ts`.
2. Assign it to the corresponding protocol.

```typescript
// Example
const sit_animation = { /* AI-generated JSON */ };

const llw_stage1: Protocol = {
  id: 'llw_s1',
  // ...
  animationJson: sit_animation,
};
```

---

## 4. AI Agent Prompt (Bulk Generation)

Give this prompt to an AI coding agent to fill the app with professional animations:

> "You are an expert Lottie animator and TypeScript engineer. I want to populate my `constants/protocols.ts` file with minimalist, professional animations.
>
> Please iterate through every `Protocol` defined in `constants/protocols.ts`. For each one:
> 1. Generate a valid, minimalist Lottie JSON object that represents the exercise (e.g., for 'Focus & Attention', show a simple dog looking up).
> 2. Use the app's professional color palette: primary `#2563EB`, background `#FFFFFF`.
> 3. Keep shapes extremely simple (circles/rectangles) to ensure the JSON is clean and valid.
> 4. Modify `constants/protocols.ts` to include these JSON objects as constants (e.g., `const llw_s1_anim = { ... }`) and assign them to the `animationJson` field of each protocol.
>
> Please perform this for all 21 protocols in the file."

---

## 5. Pro Tips for AI Agents
- **Looping:** Ensure the `op` (out point) and `ip` (in point) of the Lottie JSON allow for a smooth loop.
- **Framerate:** Set `fr` to `30` or `60` for smooth motion.
- **Character Consistency:** Instruct the AI to use the same path data for the "dog" across all animations to maintain a unified visual brand.
