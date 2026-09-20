-- ─────────────────────────────────────────────────────────────────────────────
-- Launch security hardening
--   1. ai_usage + consume_ai_quota(): DB-backed per-subject quotas for AI calls
--   2. user_profiles.subscription_tier is writable by the service role only
--   3. avatars bucket: owner-scoped paths, size + mime limits
--   4. handle_new_user_review_credits(): pin search_path
--   5. Hot-path indexes
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. AI usage quotas ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ai_usage (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subject    TEXT NOT NULL,          -- 'user:<uuid>' | 'ip:<sha256>' | 'global'
  feature    TEXT NOT NULL,          -- 'avatar' | 'live_trainer' | 'plan' | ...
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_subject_feature_created
  ON public.ai_usage (subject, feature, created_at DESC);

-- No policies: only the service role (edge functions) may touch this table.
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Atomically checks the window and records one use. Returns false when the
-- subject is already at the limit (nothing is recorded in that case).
CREATE OR REPLACE FUNCTION public.consume_ai_quota(
  p_subject        TEXT,
  p_feature        TEXT,
  p_limit          INTEGER,
  p_window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_subject || ':' || p_feature, 0));

  SELECT count(*) INTO v_count
  FROM ai_usage
  WHERE subject = p_subject
    AND feature = p_feature
    AND created_at > NOW() - make_interval(secs => p_window_seconds);

  IF v_count >= p_limit THEN
    RETURN FALSE;
  END IF;

  INSERT INTO ai_usage (subject, feature) VALUES (p_subject, p_feature);

  -- Opportunistic cleanup so the table stays small without a cron job.
  IF random() < 0.01 THEN
    DELETE FROM ai_usage WHERE created_at < NOW() - INTERVAL '7 days';
  END IF;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_ai_quota(TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_quota(TEXT, TEXT, INTEGER, INTEGER) TO service_role;

-- ── 2. Lock subscription_tier to the service role ────────────────────────────
-- user_profiles_update lets a user update their own row; without this guard
-- they could set subscription_tier = 'pro' themselves.

CREATE OR REPLACE FUNCTION public.protect_subscription_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    IF TG_OP = 'INSERT' THEN
      NEW.subscription_tier := 'free';
    ELSE
      NEW.subscription_tier := OLD.subscription_tier;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_profiles_protect_tier ON public.user_profiles;
CREATE TRIGGER user_profiles_protect_tier
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_subscription_tier();

-- ── 3. avatars bucket: owner-scoped writes ───────────────────────────────────
-- New objects live at {auth.uid()}/{timestamp}.png. Objects uploaded under the
-- old flat "avatars/{userId}_{ts}.png" layout stay readable but can no longer
-- be overwritten by other users.

UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp']
WHERE id = 'avatars';

DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;

CREATE POLICY "Users can upload own avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── 4. Pin search_path on the signup trigger function ────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user_review_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.review_credits (user_id, credits_remaining)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ── 5. Hot-path indexes ──────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_plans_dog_id ON public.plans (dog_id);
CREATE INDEX IF NOT EXISTS idx_behavior_goals_dog_id ON public.behavior_goals (dog_id);
CREATE INDEX IF NOT EXISTS idx_coach_messages_conversation_created
  ON public.coach_messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_coach_messages_user_role_created
  ON public.coach_messages (user_id, role, created_at);
