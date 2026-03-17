-- ─────────────────────────────────────────────────────────────────────────────
-- PR 18: Multi-Course Plans
-- Adds course_title, priority, and is_primary to the plans table so a dog
-- can have multiple active plans (courses) with one optionally marked primary.
-- ─────────────────────────────────────────────────────────────────────────────

-- Human-readable course name for multi-plan UI display
ALTER TABLE plans
  ADD COLUMN IF NOT EXISTS course_title TEXT;

-- Display priority: higher value = shown first; default 0
ALTER TABLE plans
  ADD COLUMN IF NOT EXISTS priority INTEGER NOT NULL DEFAULT 0;

-- At most one active plan per dog should be primary (enforced by partial unique index below)
ALTER TABLE plans
  ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT false;

-- ── Partial unique index: only one active plan per dog may be primary ────────
-- This enforces the at-most-one-primary constraint at the DB level for active plans.
-- Completed/paused plans are excluded from the uniqueness check.
CREATE UNIQUE INDEX IF NOT EXISTS plans_dog_primary_active_unique
  ON plans (dog_id)
  WHERE (is_primary = true AND status = 'active');

-- ── Backfill: mark the most recently created active plan per dog as primary ──
-- This ensures existing dogs have a primary plan set after migration.
UPDATE plans p
SET is_primary = true
FROM (
  SELECT DISTINCT ON (dog_id) id
  FROM plans
  WHERE status = 'active'
  ORDER BY dog_id, created_at DESC
) latest
WHERE p.id = latest.id
  AND p.status = 'active';
