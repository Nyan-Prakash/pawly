-- PR 05: Session logs & streaks
-- Tracks completed training sessions and per-dog streaks

-- ─────────────────────────────────────────────────────────────────────────────
-- session_logs
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.session_logs (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  dog_id            uuid not null references public.dogs(id) on delete cascade,
  plan_id           uuid not null references public.plans(id) on delete cascade,
  session_id        text not null,           -- PlanSession.id (from plan JSONB)
  exercise_id       text not null,           -- e.g. "llw_s1_d1"
  protocol_id       text not null,           -- e.g. "llw_s1"
  duration_seconds  integer not null default 0,
  difficulty        text not null check (difficulty in ('easy', 'okay', 'hard')),
  notes             text,
  completed_at      timestamptz not null default now(),
  created_at        timestamptz not null default now()
);

-- Index for fast per-dog queries
create index if not exists session_logs_dog_id_idx on public.session_logs(dog_id);
create index if not exists session_logs_user_id_idx on public.session_logs(user_id);

-- RLS
alter table public.session_logs enable row level security;

create policy "Users can read their own session logs"
  on public.session_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own session logs"
  on public.session_logs for insert
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- streaks
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.streaks (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  dog_id            uuid not null references public.dogs(id) on delete cascade,
  current_streak    integer not null default 0,
  longest_streak    integer not null default 0,
  last_session_date date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique(user_id, dog_id)
);

-- RLS
alter table public.streaks enable row level security;

create policy "Users can read their own streaks"
  on public.streaks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own streaks"
  on public.streaks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own streaks"
  on public.streaks for update
  using (auth.uid() = user_id);
