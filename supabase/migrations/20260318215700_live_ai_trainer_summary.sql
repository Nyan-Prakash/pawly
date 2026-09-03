-- ─────────────────────────────────────────────────────────────────────────────
-- PR 22: Live AI Trainer Summary
--
-- Adds a new column to session_logs to store the structured summary
-- from the multimodal Live AI Trainer sessions.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.session_logs
  ADD COLUMN IF NOT EXISTS live_ai_trainer_summary JSONB DEFAULT NULL;

COMMENT ON COLUMN public.session_logs.live_ai_trainer_summary IS 'Structured summary of the multimodal Live AI Trainer interaction (interaction counts, fallback status, average confidence).';
