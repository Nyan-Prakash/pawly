-- PR 06: AI Coach — coach_conversations + coach_messages tables

-- ─────────────────────────────────────────────────────────────────────────────
-- coach_conversations
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.coach_conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  dog_id     uuid not null references public.dogs(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_active  boolean not null default true,
  unique(user_id, dog_id, is_active)
);

create index if not exists coach_conversations_user_id_idx on public.coach_conversations(user_id);
create index if not exists coach_conversations_dog_id_idx on public.coach_conversations(dog_id);

alter table public.coach_conversations enable row level security;

create policy "Users can read their own conversations"
  on public.coach_conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own conversations"
  on public.coach_conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own conversations"
  on public.coach_conversations for update
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- coach_messages
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.coach_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.coach_conversations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  created_at      timestamptz not null default now(),
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  tokens_used     integer,
  model_version   text,
  context_snapshot jsonb default '{}'
);

create index if not exists coach_messages_conversation_id_idx on public.coach_messages(conversation_id);
create index if not exists coach_messages_user_id_idx on public.coach_messages(user_id);

alter table public.coach_messages enable row level security;

create policy "Users can read their own messages"
  on public.coach_messages for select
  using (auth.uid() = user_id);

-- Note: coach_messages are inserted by the Edge Function using the service role key,
-- so no INSERT policy is needed for authenticated users.
-- The Edge Function validates the JWT before writing.
