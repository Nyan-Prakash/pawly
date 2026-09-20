-- Streaks: one writer, in the dog's own timezone.
--
-- Before this, two writers disagreed about what "today" was: these triggers
-- used CURRENT_DATE (UTC) and the app wrote the device's local date to the same
-- rows. For anyone west of UTC an evening session lands on the next UTC day, so
-- each writer saw the other's date as neither today nor yesterday and reset the
-- streak to 1. The app no longer writes streak rows; these triggers are the only
-- writer and they use dogs.timezone.
--
-- The session trigger also stops counting abandoned sessions, which matches what
-- the app counted (completed sessions and quick reps).

-- ─────────────────────────────────────────────────────────────────────────────
-- dog_local_date(): today's calendar date where the dog lives
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.dog_local_date(p_dog_id UUID)
RETURNS DATE
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tz TEXT;
BEGIN
  SELECT timezone INTO tz FROM dogs WHERE id = p_dog_id;

  BEGIN
    RETURN (NOW() AT TIME ZONE COALESCE(NULLIF(tz, ''), 'UTC'))::DATE;
  EXCEPTION WHEN OTHERS THEN
    -- Unknown timezone name stored on the dog row.
    RETURN (NOW() AT TIME ZONE 'UTC')::DATE;
  END;
END;
$$;

REVOKE ALL ON FUNCTION public.dog_local_date(UUID) FROM PUBLIC, anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- update_streak(): session_logs AFTER INSERT
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today_date DATE;
  existing_record RECORD;
  new_streak INTEGER;
BEGIN
  -- An abandoned session is logged for the planner, but it is not a training day.
  IF NEW.session_status = 'abandoned' THEN
    RETURN NEW;
  END IF;

  today_date := public.dog_local_date(NEW.dog_id);

  SELECT *
  INTO existing_record
  FROM streaks
  WHERE user_id = NEW.user_id
    AND dog_id  = NEW.dog_id;

  IF NOT FOUND THEN
    INSERT INTO streaks (user_id, dog_id, current_streak, longest_streak, last_session_date)
    VALUES (NEW.user_id, NEW.dog_id, 1, 1, today_date);
    RETURN NEW;
  END IF;

  -- Already trained today. ">=" also covers a row the app wrote with a local
  -- date that is ahead of the dog's timezone.
  IF existing_record.last_session_date >= today_date THEN
    RETURN NEW;
  END IF;

  IF existing_record.last_session_date = today_date - 1 THEN
    new_streak := existing_record.current_streak + 1;
  ELSE
    new_streak := 1;
  END IF;

  UPDATE streaks
  SET
    current_streak    = new_streak,
    longest_streak    = GREATEST(new_streak, COALESCE(existing_record.longest_streak, 0)),
    last_session_date = today_date,
    updated_at        = NOW()
  WHERE id = existing_record.id;

  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- update_walk_streak_on_log(): walk_logs AFTER INSERT
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_walk_streak_on_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today_date DATE;
  existing_record RECORD;
  new_streak INTEGER;
BEGIN
  today_date := public.dog_local_date(NEW.dog_id);

  SELECT *
  INTO existing_record
  FROM walk_streaks
  WHERE user_id = NEW.user_id
    AND dog_id  = NEW.dog_id;

  IF NOT FOUND THEN
    INSERT INTO walk_streaks (user_id, dog_id, current_streak, longest_streak, last_walk_date)
    VALUES (NEW.user_id, NEW.dog_id, 1, 1, today_date);
    RETURN NEW;
  END IF;

  IF existing_record.last_walk_date >= today_date THEN
    RETURN NEW;
  END IF;

  IF existing_record.last_walk_date = today_date - 1 THEN
    new_streak := existing_record.current_streak + 1;
  ELSE
    new_streak := 1;
  END IF;

  UPDATE walk_streaks
  SET
    current_streak = new_streak,
    longest_streak = GREATEST(new_streak, COALESCE(existing_record.longest_streak, 0)),
    last_walk_date = today_date,
    updated_at     = NOW()
  WHERE id = existing_record.id;

  RETURN NEW;
END;
$$;
