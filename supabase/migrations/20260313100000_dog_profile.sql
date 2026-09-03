-- Dogs table
CREATE TABLE IF NOT EXISTS dogs (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id                  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                      TEXT NOT NULL,
  breed                     TEXT NOT NULL DEFAULT '',
  breed_group               TEXT NOT NULL DEFAULT '',
  age_months                INTEGER NOT NULL DEFAULT 12,
  sex                       TEXT NOT NULL CHECK (sex IN ('male','female')),
  neutered                  BOOLEAN NOT NULL DEFAULT false,
  environment_type          TEXT NOT NULL CHECK (environment_type IN ('apartment','house_no_yard','house_yard')),
  behavior_goals            TEXT[] NOT NULL DEFAULT '{}',
  training_experience       TEXT NOT NULL CHECK (training_experience IN ('none','some','experienced')),
  equipment                 TEXT[] NOT NULL DEFAULT '{}',
  available_days_per_week   INTEGER NOT NULL DEFAULT 3 CHECK (available_days_per_week BETWEEN 1 AND 7),
  available_minutes_per_day INTEGER NOT NULL DEFAULT 10,
  lifecycle_stage           TEXT NOT NULL DEFAULT 'adult',
  has_kids                  BOOLEAN NOT NULL DEFAULT false,
  has_other_pets            BOOLEAN NOT NULL DEFAULT false,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dogs_select" ON dogs FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "dogs_insert" ON dogs FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "dogs_update" ON dogs FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "dogs_delete" ON dogs FOR DELETE USING (auth.uid() = owner_id);

-- Behavior goals table
CREATE TABLE IF NOT EXISTS behavior_goals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id            UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  goal              TEXT NOT NULL,
  is_primary        BOOLEAN NOT NULL DEFAULT false,
  severity          TEXT NOT NULL CHECK (severity IN ('mild','moderate','severe')) DEFAULT 'moderate',
  video_upload_path TEXT,
  video_context     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE behavior_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bg_select" ON behavior_goals FOR SELECT
  USING (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = behavior_goals.dog_id AND dogs.owner_id = auth.uid()));
CREATE POLICY "bg_insert" ON behavior_goals FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = behavior_goals.dog_id AND dogs.owner_id = auth.uid()));
CREATE POLICY "bg_update" ON behavior_goals FOR UPDATE
  USING (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = behavior_goals.dog_id AND dogs.owner_id = auth.uid()));
CREATE POLICY "bg_delete" ON behavior_goals FOR DELETE
  USING (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = behavior_goals.dog_id AND dogs.owner_id = auth.uid()));

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id            UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  goal              TEXT NOT NULL,
  status            TEXT NOT NULL CHECK (status IN ('active','completed','paused')) DEFAULT 'active',
  duration_weeks    INTEGER NOT NULL DEFAULT 4,
  sessions_per_week INTEGER NOT NULL DEFAULT 3,
  current_week      INTEGER NOT NULL DEFAULT 1,
  current_stage     TEXT NOT NULL DEFAULT 'Stage 1',
  sessions          JSONB NOT NULL DEFAULT '[]',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_select" ON plans FOR SELECT
  USING (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = plans.dog_id AND dogs.owner_id = auth.uid()));
CREATE POLICY "plans_insert" ON plans FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = plans.dog_id AND dogs.owner_id = auth.uid()));
CREATE POLICY "plans_update" ON plans FOR UPDATE
  USING (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = plans.dog_id AND dogs.owner_id = auth.uid()));
CREATE POLICY "plans_delete" ON plans FOR DELETE
  USING (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = plans.dog_id AND dogs.owner_id = auth.uid()));

-- User profiles table (mirrors auth.users with extra app metadata)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id                        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_completed_at   TIMESTAMPTZ,
  subscription_tier         TEXT NOT NULL DEFAULT 'free',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_profiles_select" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "user_profiles_insert" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "user_profiles_update" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;
CREATE TRIGGER dogs_updated_at BEFORE UPDATE ON dogs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER plans_updated_at BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Storage (run via Supabase dashboard):
-- Create bucket: pawly-videos (private)
-- Insert policy: (storage.foldername(name))[2] = auth.uid()::text
-- Select policy: (storage.foldername(name))[2] = auth.uid()::text
