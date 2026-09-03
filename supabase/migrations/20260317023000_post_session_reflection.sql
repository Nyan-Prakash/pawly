-- ─────────────────────────────────────────────────────────────────────────────
-- PR 17: Post-Session Reflection — session_logs extension
--
-- Adds a nullable JSONB column to session_logs for storing the structured
-- handler reflection captured after each training session.
--
-- Design notes:
--   • Column is nullable (no DEFAULT) so rows without a reflection are
--     distinguishable from rows where the handler explicitly skipped it.
--   • The JSONB shape is enforced in TypeScript (PostSessionReflection) and
--     is not constrained in SQL so the shape can evolve without migrations.
--   • All existing rows are unaffected: NULL is the implicit default for a
--     newly added nullable column.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.session_logs
  ADD COLUMN IF NOT EXISTS post_session_reflection JSONB DEFAULT NULL;
