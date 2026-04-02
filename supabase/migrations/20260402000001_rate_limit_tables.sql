-- Rate limiting tables for AI edge functions
--
-- avatar_generation_logs: tracks per-user daily avatar gen calls (generate-dog-avatar)
-- live_trainer_calls:     tracks per-user per-session live-ai-trainer calls

-- ── avatar_generation_logs ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.avatar_generation_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_avatar_gen_logs_user_created
  ON public.avatar_generation_logs (user_id, created_at DESC);

ALTER TABLE public.avatar_generation_logs ENABLE ROW LEVEL SECURITY;

-- Users cannot read/write these logs directly; only service_role (edge functions) can.
CREATE POLICY "No direct user access to avatar_generation_logs"
  ON public.avatar_generation_logs
  FOR ALL
  TO authenticated
  USING (false);

-- ── live_trainer_calls ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.live_trainer_calls (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_trainer_calls_user_session
  ON public.live_trainer_calls (user_id, session_id, created_at DESC);

ALTER TABLE public.live_trainer_calls ENABLE ROW LEVEL SECURITY;

-- Users cannot read/write these logs directly; only service_role (edge functions) can.
CREATE POLICY "No direct user access to live_trainer_calls"
  ON public.live_trainer_calls
  FOR ALL
  TO authenticated
  USING (false);

-- ── Auto-cleanup old rows to keep tables small ───────────────────────────────
-- Avatar logs older than 2 days are irrelevant (daily limit only looks back 1 day).
-- Live trainer call logs older than 7 days are irrelevant.
-- These can be wired to pg_cron or a scheduled function later; indexes above
-- keep queries fast in the meantime.
