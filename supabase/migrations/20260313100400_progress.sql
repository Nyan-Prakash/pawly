-- ─────────────────────────────────────────────────────────────────────────────
-- PR 07: Walk Integration & Progress Tracking
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- walk_logs
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS walk_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dog_id          UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  quality         SMALLINT NOT NULL CHECK (quality IN (1, 2, 3)),
  -- 1 = harder today, 2 = about the same, 3 = better than before
  notes           TEXT,
  duration_minutes INTEGER CHECK (duration_minutes > 0 AND duration_minutes < 600),
  logged_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS walk_logs_dog_id_idx ON walk_logs(dog_id);
CREATE INDEX IF NOT EXISTS walk_logs_user_id_idx ON walk_logs(user_id);
CREATE INDEX IF NOT EXISTS walk_logs_logged_at_idx ON walk_logs(logged_at DESC);

ALTER TABLE walk_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own walk logs"
  ON walk_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own walk logs"
  ON walk_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own walk logs"
  ON walk_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- walk_streaks
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS walk_streaks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dog_id            UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  current_streak    INTEGER NOT NULL DEFAULT 0,
  longest_streak    INTEGER NOT NULL DEFAULT 0,
  last_walk_date    DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, dog_id)
);

ALTER TABLE walk_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own walk streaks"
  ON walk_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own walk streaks"
  ON walk_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own walk streaks"
  ON walk_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_walk_streak_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER walk_streaks_updated_at
  BEFORE UPDATE ON walk_streaks
  FOR EACH ROW EXECUTE FUNCTION update_walk_streak_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- milestones
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS milestones (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dog_id          UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  milestone_id    TEXT NOT NULL,
  -- matches MilestoneDefinition.id in lib/milestoneEngine.ts
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  emoji           TEXT NOT NULL DEFAULT '🏆',
  achieved_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, dog_id, milestone_id)
);

CREATE INDEX IF NOT EXISTS milestones_dog_id_idx ON milestones(dog_id);
CREATE INDEX IF NOT EXISTS milestones_user_id_idx ON milestones(user_id);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own milestones"
  ON milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can upsert own milestones"
  ON milestones FOR UPDATE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- update_streak() trigger function
-- Called after session_logs INSERT to auto-update the streaks table
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_streak()
RETURNS TRIGGER AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  yesterday_date DATE := CURRENT_DATE - INTERVAL '1 day';
  existing_record RECORD;
  new_streak INTEGER;
BEGIN
  -- Look up existing streak row for this user+dog
  SELECT *
  INTO existing_record
  FROM streaks
  WHERE user_id = NEW.user_id
    AND dog_id  = NEW.dog_id;

  IF NOT FOUND THEN
    -- First ever session — create streak row
    INSERT INTO streaks (user_id, dog_id, current_streak, longest_streak, last_session_date)
    VALUES (NEW.user_id, NEW.dog_id, 1, 1, today_date);
  ELSE
    -- Already trained today — no change needed
    IF existing_record.last_session_date = today_date THEN
      RETURN NEW;
    END IF;

    -- Consecutive day — extend streak
    IF existing_record.last_session_date = yesterday_date THEN
      new_streak := existing_record.current_streak + 1;
    ELSE
      -- Streak broken
      new_streak := 1;
    END IF;

    UPDATE streaks
    SET
      current_streak    = new_streak,
      longest_streak    = GREATEST(new_streak, existing_record.longest_streak),
      last_session_date = today_date,
      updated_at        = NOW()
    WHERE id = existing_record.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to session_logs
DROP TRIGGER IF EXISTS session_logs_update_streak ON session_logs;

CREATE TRIGGER session_logs_update_streak
  AFTER INSERT ON session_logs
  FOR EACH ROW EXECUTE FUNCTION update_streak();

-- ─────────────────────────────────────────────────────────────────────────────
-- update_walk_streak() trigger function
-- Called after walk_logs INSERT to auto-update the walk_streaks table
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_walk_streak_on_log()
RETURNS TRIGGER AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  yesterday_date DATE := CURRENT_DATE - INTERVAL '1 day';
  existing_record RECORD;
  new_streak INTEGER;
BEGIN
  SELECT *
  INTO existing_record
  FROM walk_streaks
  WHERE user_id = NEW.user_id
    AND dog_id  = NEW.dog_id;

  IF NOT FOUND THEN
    INSERT INTO walk_streaks (user_id, dog_id, current_streak, longest_streak, last_walk_date)
    VALUES (NEW.user_id, NEW.dog_id, 1, 1, today_date);
  ELSE
    IF existing_record.last_walk_date = today_date THEN
      RETURN NEW;
    END IF;

    IF existing_record.last_walk_date = yesterday_date THEN
      new_streak := existing_record.current_streak + 1;
    ELSE
      new_streak := 1;
    END IF;

    UPDATE walk_streaks
    SET
      current_streak  = new_streak,
      longest_streak  = GREATEST(new_streak, existing_record.longest_streak),
      last_walk_date  = today_date,
      updated_at      = NOW()
    WHERE id = existing_record.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS walk_logs_update_streak ON walk_logs;

CREATE TRIGGER walk_logs_update_streak
  AFTER INSERT ON walk_logs
  FOR EACH ROW EXECUTE FUNCTION update_walk_streak_on_log();
