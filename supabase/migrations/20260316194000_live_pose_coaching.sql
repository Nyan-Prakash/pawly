-- ─────────────────────────────────────────────────────────────────────────────
-- PR 16: Live Pose Coaching — Protocol & Session Log Extensions
--
-- Adds optional live camera coaching support to the protocols table and
-- records whether coaching was used in session_logs.
--
-- Design notes:
--   • Both new columns are backward-compatible (NOT NULL with safe defaults).
--   • live_coaching_config is JSONB so the TypeScript shape can evolve without
--     further migrations.  It is null when supports_live_pose_coaching = false.
--   • session_logs gains three columns so runtime pose metrics can be persisted
--     later without another migration.
--   • No existing rows or queries are broken: all adds use IF NOT EXISTS /
--     safe defaults.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Extend protocols ───────────────────────────────────────────────────────

ALTER TABLE public.protocols
  ADD COLUMN IF NOT EXISTS supports_live_pose_coaching BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS live_coaching_config        JSONB    DEFAULT NULL;

-- Optional: constraint to keep config consistent with the flag
-- (only enforce that config is not set when flag is false; flag=true allows null
--  during a transition period where config is being authored)
ALTER TABLE public.protocols
  DROP CONSTRAINT IF EXISTS protocols_coaching_config_check;

ALTER TABLE public.protocols
  ADD CONSTRAINT protocols_coaching_config_check
    CHECK (
      -- If coaching is disabled, config must be null
      (supports_live_pose_coaching = FALSE AND live_coaching_config IS NULL)
      OR
      -- If coaching is enabled, config can be null (being authored) or present
      (supports_live_pose_coaching = TRUE)
    );

-- ── 2. Extend session_logs ────────────────────────────────────────────────────

ALTER TABLE public.session_logs
  ADD COLUMN IF NOT EXISTS live_coaching_used    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS live_coaching_summary JSONB   NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS pose_metrics          JSONB   NOT NULL DEFAULT '{}'::jsonb;

-- ── 3. Seed live_coaching_config for the starter protocol set ─────────────────
--
-- Enabled protocols (chosen because they are stationary / posture-focused):
--
--   settle_s1 — Foundation settle: dog learns to go to mat and lie down.
--               Target posture: down.  Simple stationary hold, low motion.
--
--   settle_s2 — Intermediate settle: hold on mat with household distractions.
--               Target posture: down.  Longer hold, mild external stimuli.
--
-- These two are the safest first candidates because:
--   1. The target body position (down on mat) is the posture the classifier
--      handles most distinctly.
--   2. The sessions are stationary — low motion makes pose tracking reliable.
--   3. Stage 1 / 2 (not stage 3) keeps the initial surface area small.
-- ─────────────────────────────────────────────────────────────────────────────

-- settle_s1: Foundation settle (down-hold, stationary)
UPDATE public.protocols
SET
  supports_live_pose_coaching = TRUE,
  live_coaching_config = '{
    "mode": "stationary_hold",
    "targetPostures": ["down"],
    "minTrackingQuality": "fair",
    "minPostureConfidence": 0.45,
    "stabilizationProfile": "stationary",
    "successRules": [
      {
        "type": "hold_duration",
        "postureLabel": "down",
        "minHoldMs": 5000,
        "description": "Dog holds a down position for at least 5 seconds"
      }
    ],
    "resetRules": [
      {
        "type": "broke_posture",
        "postureLabel": "down",
        "description": "Dog breaks the down — rep resets"
      },
      {
        "type": "significant_motion",
        "description": "Dog moves significantly while in down"
      }
    ],
    "feedbackTemplates": [
      "Nice! {dog_name} is holding the down.",
      "Good settle! Keep rewarding on the mat.",
      "{dog_name} got up — calmly lure back and try again.",
      "That was {hold_seconds}s — great start!"
    ],
    "holdDurationMs": 5000,
    "requiredRepCount": 8
  }'::jsonb
WHERE id = 'settle_s1';

-- settle_s2: Intermediate settle with distractions (longer hold)
UPDATE public.protocols
SET
  supports_live_pose_coaching = TRUE,
  live_coaching_config = '{
    "mode": "stationary_hold",
    "targetPostures": ["down"],
    "minTrackingQuality": "fair",
    "minPostureConfidence": 0.45,
    "stabilizationProfile": "stationary",
    "successRules": [
      {
        "type": "hold_duration",
        "postureLabel": "down",
        "minHoldMs": 30000,
        "description": "Dog holds a down position for at least 30 seconds"
      }
    ],
    "resetRules": [
      {
        "type": "broke_posture",
        "postureLabel": "down",
        "description": "Dog breaks the down — rep resets"
      },
      {
        "type": "significant_motion",
        "description": "Dog moves significantly while in down"
      }
    ],
    "feedbackTemplates": [
      "{dog_name} is settled — keep treating on the mat.",
      "30 seconds! Great hold.",
      "{dog_name} got up — lure back calmly, no scolding.",
      "Reduce distraction level if {dog_name} is breaking frequently."
    ],
    "holdDurationMs": 30000,
    "requiredRepCount": 6
  }'::jsonb
WHERE id = 'settle_s2';
