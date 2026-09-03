ALTER TABLE dogs
  ADD COLUMN IF NOT EXISTS preferred_training_days TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_training_windows JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS preferred_training_times JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS usual_walk_times JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS session_style TEXT NOT NULL DEFAULT 'balanced'
    CHECK (session_style IN ('micro', 'balanced', 'focused')),
  ADD COLUMN IF NOT EXISTS schedule_flexibility TEXT NOT NULL DEFAULT 'move_next_slot'
    CHECK (schedule_flexibility IN ('skip', 'move_next_slot', 'move_tomorrow')),
  ADD COLUMN IF NOT EXISTS schedule_intensity TEXT NOT NULL DEFAULT 'balanced'
    CHECK (schedule_intensity IN ('gentle', 'balanced', 'aggressive')),
  ADD COLUMN IF NOT EXISTS blocked_days TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS blocked_dates JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS schedule_notes TEXT,
  ADD COLUMN IF NOT EXISTS schedule_version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'UTC';

ALTER TABLE plans
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB NOT NULL DEFAULT jsonb_build_object(
    'daily_reminder', true,
    'daily_reminder_time', '19:00',
    'walk_reminders', true,
    'post_walk_check_in', true,
    'streak_alerts', true,
    'milestone_alerts', true,
    'insights', true,
    'expert_review', true,
    'lifecycle', true,
    'weekly_summary', true,
    'scheduled_session_reminders', true,
    'reminder_lead_minutes', 15,
    'fallback_missed_session_reminders', true
  );
