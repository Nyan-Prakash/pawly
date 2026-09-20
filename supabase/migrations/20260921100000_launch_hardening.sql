-- ─────────────────────────────────────────────────────────────────────────────
-- Launch hardening
--   1. handle_new_user(): every auth user gets a user_profiles row (+ backfill)
--   2. apple_credentials: Sign in with Apple refresh tokens, for revocation
--   3. release_ai_quota(): hand back a unit when the metered call never ran
--   4. is_pro_user(): the one server-side Pro rule (tier + expiry + grace)
--   5. Free session limit enforced on session_logs
--   6. session_logs / walk_logs writes must name one of the caller's own dogs
--   7. protocols readable by signed-in users only
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Profile row on signup ─────────────────────────────────────────────────
-- The app used to create this row lazily, so the RevenueCat webhook and the
-- tier checks could find nothing to read or update.
--
-- user_profiles_protect_tier also fires on this insert. Signup runs without a
-- service-role JWT, so it pins the tier columns to 'free' / NULL / NULL, which
-- are the column defaults anyway; the insert goes through unchanged.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    INSERT INTO public.user_profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- A missing profile is recoverable (the app and the webhook both upsert);
    -- a failed signup is not.
    RAISE WARNING 'handle_new_user: could not create profile for %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.user_profiles (id)
SELECT u.id
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.user_profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- ── 2. Sign in with Apple refresh tokens ─────────────────────────────────────
-- App Store guideline 5.1.1(v): deleting the account must revoke the Apple
-- token. apple-token-exchange stores it, delete-account revokes it.

CREATE TABLE IF NOT EXISTS public.apple_credentials (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- No policies: only the service role (edge functions) may touch this table.
ALTER TABLE public.apple_credentials ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.apple_credentials FROM anon, authenticated;

-- ── 3. Quota release ─────────────────────────────────────────────────────────
-- consume_ai_quota() records the use before the model call so the check is
-- atomic. When that call then fails, the newest unit is handed back so a free
-- user does not lose one of three daily coach messages to an outage.

CREATE OR REPLACE FUNCTION public.release_ai_quota(
  p_subject TEXT,
  p_feature TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_subject || ':' || p_feature, 0));

  DELETE FROM ai_usage
  WHERE id = (
    SELECT id FROM ai_usage
    WHERE subject = p_subject AND feature = p_feature
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  );
END;
$$;

REVOKE ALL ON FUNCTION public.release_ai_quota(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_ai_quota(TEXT, TEXT) TO service_role;

-- ── 4. Server-side Pro rule ──────────────────────────────────────────────────
-- Mirrors isProProfile() in supabase/functions/_shared/subscription.ts: a paid
-- tier, and either no expiry (lifetime) or one no more than 3 days in the past.
-- The grace covers a late RENEWAL webhook and store billing retries.

CREATE OR REPLACE FUNCTION public.is_pro_user(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE id = p_user_id
      AND subscription_tier <> 'free'
      AND (
        subscription_expires_at IS NULL
        OR subscription_expires_at > NOW() - INTERVAL '3 days'
      )
  );
$$;

REVOKE ALL ON FUNCTION public.is_pro_user(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_pro_user(UUID) TO service_role;

-- ── 5. Free session limit ────────────────────────────────────────────────────
-- The app stops free users at FREE_LIMITS.sessions (3) completed sessions; this
-- is the backstop for a patched client. It is deliberately looser than the app:
--   • only 'completed' rows count or are blocked (abandoned attempts pass);
--   • sessions are counted once per (plan_id, session_id), and repeating one
--     that is already completed always passes, as it does in the app;
--   • it blocks at 5, not 3, so a session in flight at the boundary (or logged
--     from a second device) is never lost;
--   • Pro users and the service role are never blocked.

CREATE OR REPLACE FUNCTION public.enforce_free_session_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_completed INTEGER;
BEGIN
  IF COALESCE(auth.role(), '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.session_status IS DISTINCT FROM 'completed' THEN
    RETURN NEW;
  END IF;

  IF public.is_pro_user(NEW.user_id) THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1 FROM session_logs
    WHERE user_id = NEW.user_id
      AND plan_id = NEW.plan_id
      AND session_id = NEW.session_id
      AND session_status = 'completed'
  ) THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO v_completed
  FROM (
    SELECT DISTINCT plan_id, session_id
    FROM session_logs
    WHERE user_id = NEW.user_id
      AND session_status = 'completed'
  ) AS done;

  IF v_completed >= 5 THEN
    RAISE EXCEPTION 'free_session_limit'
      USING ERRCODE = 'P0001',
            HINT = 'Free plan session limit reached. Pawly Pro removes the limit.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS session_logs_free_limit ON public.session_logs;
CREATE TRIGGER session_logs_free_limit
  BEFORE INSERT ON public.session_logs
  FOR EACH ROW EXECUTE FUNCTION public.enforce_free_session_limit();

-- ── 6. Log writes must reference the caller's own dog ────────────────────────
-- auth.uid() = user_id alone let a user attach logs to someone else's dog_id,
-- which adapt-plan and the coach then read as that dog's history.

DROP POLICY IF EXISTS "Users can insert their own session logs" ON public.session_logs;
CREATE POLICY "Users can insert their own session logs"
  ON public.session_logs FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.dogs WHERE dogs.id = session_logs.dog_id AND dogs.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert own walk logs" ON public.walk_logs;
CREATE POLICY "Users can insert own walk logs"
  ON public.walk_logs FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.dogs WHERE dogs.id = walk_logs.dog_id AND dogs.owner_id = auth.uid())
  );

-- WITH CHECK as well as USING, so an update cannot move a row to another dog
-- or another user.
DROP POLICY IF EXISTS "Users can update own walk logs" ON public.walk_logs;
CREATE POLICY "Users can update own walk logs"
  ON public.walk_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.dogs WHERE dogs.id = walk_logs.dog_id AND dogs.owner_id = auth.uid())
  );

-- ── 7. protocols: signed-in readers only ─────────────────────────────────────

DROP POLICY IF EXISTS "protocols_public_read" ON public.protocols;
CREATE POLICY "protocols_public_read"
  ON public.protocols FOR SELECT
  TO authenticated
  USING (true);
