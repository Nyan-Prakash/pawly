-- PR 15: In-app notifications inbox for plan updates

create table if not exists public.in_app_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  dog_id uuid references public.dogs(id) on delete cascade,
  type text not null check (type in ('plan_updated')),
  title text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table public.in_app_notifications enable row level security;

create policy "Users can read their own in-app notifications"
  on public.in_app_notifications for select
  using (auth.uid() = user_id);

create policy "Users can insert their own in-app notifications"
  on public.in_app_notifications for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own in-app notifications"
  on public.in_app_notifications for update
  using (auth.uid() = user_id);

create index if not exists in_app_notifications_user_created_idx
  on public.in_app_notifications(user_id, created_at desc);

create index if not exists in_app_notifications_user_read_idx
  on public.in_app_notifications(user_id, is_read);

create unique index if not exists in_app_notifications_plan_update_event_idx
  on public.in_app_notifications(user_id, type, ((metadata ->> 'adaptationId')))
  where type = 'plan_updated' and metadata ? 'adaptationId';

alter publication supabase_realtime add table public.in_app_notifications;
