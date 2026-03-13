-- ─────────────────────────────────────────────────────────────────────────────
-- PR 08: Video Upload & Expert Review
-- ─────────────────────────────────────────────────────────────────────────────

-- ── videos table ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.videos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dog_id           UUID NOT NULL REFERENCES public.dogs(id) ON DELETE CASCADE,
  storage_path     TEXT NOT NULL,                      -- videos/{userId}/{dogId}/{context}_{ts}.mp4
  thumbnail_path   TEXT,                               -- thumbnails/{userId}/{dogId}/{ts}.jpg
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  context          TEXT NOT NULL CHECK (context IN ('onboarding', 'session', 'behavior')),
  behavior_context TEXT,                               -- which of the 8 behavior categories
  before_context   TEXT,                               -- what happened before the clip
  goal_context     TEXT,                               -- what the owner hoped to see
  uploaded_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_user_dog ON public.videos (user_id, dog_id);
CREATE INDEX IF NOT EXISTS idx_videos_uploaded_at ON public.videos (uploaded_at DESC);

-- ── expert_reviews table ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.expert_reviews (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id          UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'queued'
                      CHECK (status IN ('queued', 'in_review', 'complete')),
  trainer_name      TEXT,
  trainer_photo_url TEXT,
  feedback          TEXT,
  timestamps        JSONB NOT NULL DEFAULT '[]',       -- [{time: seconds, note: string}]
  requested_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at      TIMESTAMPTZ,
  -- Prevent duplicate reviews for the same video
  UNIQUE (video_id)
);

CREATE INDEX IF NOT EXISTS idx_expert_reviews_user ON public.expert_reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_expert_reviews_status ON public.expert_reviews (status);

-- ── review_credits table ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.review_credits (
  user_id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_remaining INTEGER NOT NULL DEFAULT 0 CHECK (credits_remaining >= 0),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create a credits row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_review_credits()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.review_credits (user_id, credits_remaining)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Only create trigger if users table trigger doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_new_user_create_review_credits'
  ) THEN
    CREATE TRIGGER on_new_user_create_review_credits
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_review_credits();
  END IF;
END $$;

-- ── Storage bucket ────────────────────────────────────────────────────────────

-- The pawly-videos bucket was created in PR 03.
-- We extend policies here for the new path prefixes.

-- Allow users to insert thumbnails into their own folder
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('pawly-videos', 'pawly-videos', false)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Drop and recreate policies to be idempotent
DROP POLICY IF EXISTS "Users can upload own videos pr08" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own videos pr08" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own videos pr08" ON storage.objects;

-- Upload: only your own user folder (videos/ and thumbnails/)
CREATE POLICY "Users can upload own videos pr08"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pawly-videos'
    AND auth.uid()::text = (string_to_array(name, '/'))[2]
  );

-- Read: only your own user folder
CREATE POLICY "Users can read own videos pr08"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'pawly-videos'
    AND auth.uid()::text = (string_to_array(name, '/'))[2]
  );

-- Delete: only your own user folder
CREATE POLICY "Users can delete own videos pr08"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pawly-videos'
    AND auth.uid()::text = (string_to_array(name, '/'))[2]
  );

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_credits ENABLE ROW LEVEL SECURITY;

-- videos RLS
CREATE POLICY "Users can view own videos"
  ON public.videos FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own videos"
  ON public.videos FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own videos"
  ON public.videos FOR DELETE USING (auth.uid() = user_id);

-- expert_reviews RLS
CREATE POLICY "Users can view own reviews"
  ON public.expert_reviews FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can request reviews for own videos"
  ON public.expert_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trainers update reviews via service role (Edge Function) — no user UPDATE policy needed

-- review_credits RLS
CREATE POLICY "Users can view own credits"
  ON public.review_credits FOR SELECT USING (auth.uid() = user_id);

-- Credits are updated by service role (Edge Function deducts credits) — no user UPDATE policy
