-- ─────────────────────────────────────────────────────────────────────────────
-- PR 19: Add-Another-Course Flow
--
-- No schema changes needed — the columns (course_title, priority, is_primary)
-- and the partial unique index were added in PR-18.
--
-- This migration fixes two data-quality issues for existing rows that were
-- created after the PR-18 migration ran (i.e., newly onboarded dogs whose
-- first plan was never explicitly marked primary because the Edge Function
-- and rules-based fallback path did not set is_primary=true at insert time).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Backfill: any active plan that is the *only* active plan for its dog
--    should be primary.  Dogs with multiple active plans are left alone —
--    their primary was either set by PR-18 or needs a human/product decision.
UPDATE plans p
SET is_primary = true
WHERE p.status = 'active'
  AND p.is_primary = false
  AND NOT EXISTS (
    SELECT 1
    FROM plans other
    WHERE other.dog_id = p.dog_id
      AND other.status = 'active'
      AND other.id <> p.id
  );
