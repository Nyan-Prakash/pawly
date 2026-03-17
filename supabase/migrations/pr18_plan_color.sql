-- PR 18: Add color column to plans table
-- This column will store the deterministic goal-based color assigned at creation.
-- Nullable for backward compatibility; app-layer mapper handles derivation for existing rows.

ALTER TABLE plans ADD COLUMN IF NOT EXISTS color TEXT;
