-- PR 11: Adaptive Planning Foundation
-- Adds dog_learning_state, plan_adaptations, skill_nodes, skill_edges

-- ─── dog_learning_state ──────────────────────────────────────────────────────

create table dog_learning_state (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null unique references dogs(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  motivation_score integer not null default 3 check (motivation_score between 1 and 5),
  distraction_sensitivity integer not null default 3 check (distraction_sensitivity between 1 and 5),
  confidence_score integer not null default 3 check (confidence_score between 1 and 5),
  impulse_control_score integer not null default 3 check (impulse_control_score between 1 and 5),
  handler_consistency_score integer not null default 3 check (handler_consistency_score between 1 and 5),
  fatigue_risk_score integer not null default 3 check (fatigue_risk_score between 1 and 5),
  recovery_speed_score integer not null default 3 check (recovery_speed_score between 1 and 5),
  environment_confidence jsonb not null default '{}',
  behavior_signals jsonb not null default '{}',
  recent_trends jsonb not null default '{}',
  current_hypotheses jsonb not null default '[]',
  last_evaluated_at timestamptz,
  version integer not null default 1
);

alter table dog_learning_state enable row level security;

create policy "owners read own dog learning state"
  on dog_learning_state for select to authenticated
  using (dog_id in (select id from dogs where owner_id = auth.uid()));

create policy "owners write own dog learning state"
  on dog_learning_state for insert to authenticated
  with check (dog_id in (select id from dogs where owner_id = auth.uid()));

create policy "owners update own dog learning state"
  on dog_learning_state for update to authenticated
  using (dog_id in (select id from dogs where owner_id = auth.uid()));

create index idx_dog_learning_state_dog_id on dog_learning_state(dog_id);

create trigger set_dog_learning_state_updated_at
  before update on dog_learning_state
  for each row execute function update_updated_at();

-- ─── plan_adaptations ────────────────────────────────────────────────────────

create table plan_adaptations (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references dogs(id) on delete cascade,
  plan_id uuid not null references plans(id) on delete cascade,
  triggered_by_session_log_id uuid references session_logs(id) on delete set null,
  created_at timestamptz not null default now(),
  adaptation_type text not null check (adaptation_type in (
    'repeat','regress','advance','detour',
    'difficulty_adjustment','schedule_adjustment','environment_adjustment'
  )),
  status text not null default 'applied' check (status in ('applied','skipped','rolled_back')),
  reason_code text not null,
  reason_summary text not null,
  evidence jsonb not null default '{}',
  previous_snapshot jsonb not null,
  new_snapshot jsonb not null,
  changed_session_ids text[] not null default '{}',
  changed_fields text[] not null default '{}',
  model_name text,
  latency_ms integer,
  was_user_visible boolean not null default true
);

alter table plan_adaptations enable row level security;

create policy "owners read own plan adaptations"
  on plan_adaptations for select to authenticated
  using (dog_id in (select id from dogs where owner_id = auth.uid()));

create index idx_plan_adaptations_plan_created on plan_adaptations(plan_id, created_at desc);
create index idx_plan_adaptations_dog_created on plan_adaptations(dog_id, created_at desc);

-- ─── skill_nodes ─────────────────────────────────────────────────────────────

create table skill_nodes (
  id text primary key,
  behavior text not null,
  skill_code text not null unique,
  title text not null,
  description text,
  stage integer not null check (stage between 1 and 5),
  difficulty integer not null check (difficulty between 1 and 5),
  kind text not null check (kind in ('foundation','core','proofing','recovery','diagnostic')),
  protocol_id text references protocols(id) on delete set null,
  metadata jsonb not null default '{}',
  is_active boolean not null default true
);

alter table skill_nodes enable row level security;

create policy "authenticated read skill nodes"
  on skill_nodes for select to authenticated
  using (true);

create index idx_skill_nodes_behavior_stage on skill_nodes(behavior, stage);

-- ─── skill_edges ─────────────────────────────────────────────────────────────

create table skill_edges (
  id uuid primary key default gen_random_uuid(),
  from_skill_id text not null references skill_nodes(id) on delete cascade,
  to_skill_id text not null references skill_nodes(id) on delete cascade,
  edge_type text not null check (edge_type in ('prerequisite','advance','regress','detour','proofing')),
  condition_summary text,
  metadata jsonb not null default '{}',
  unique(from_skill_id, to_skill_id, edge_type)
);

alter table skill_edges enable row level security;

create policy "authenticated read skill edges"
  on skill_edges for select to authenticated
  using (true);

create index idx_skill_edges_from on skill_edges(from_skill_id);
create index idx_skill_edges_to on skill_edges(to_skill_id);
