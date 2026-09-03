-- PR 13: Learning-state signal persistence
-- Extends logs so heuristic learning state can be recomputed from source data

alter table public.session_logs
  add column if not exists success_score integer check (success_score between 1 and 5),
  add column if not exists step_results jsonb not null default '[]',
  add column if not exists session_status text not null default 'completed'
    check (session_status in ('completed', 'abandoned')),
  add column if not exists skill_id text,
  add column if not exists session_kind text
    check (session_kind in ('core', 'repeat', 'regress', 'advance', 'detour', 'proofing')),
  add column if not exists environment_tag text;

create index if not exists session_logs_dog_completed_idx
  on public.session_logs(dog_id, completed_at desc);

alter table public.walk_logs
  add column if not exists goal_achieved boolean;

create index if not exists walk_logs_dog_logged_idx
  on public.walk_logs(dog_id, logged_at desc);
