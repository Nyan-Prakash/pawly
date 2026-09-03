-- PR 09: Fix coach conversation uniqueness so resets can archive old chats
--
-- The original unique(user_id, dog_id, is_active) constraint only allows:
-- - one active conversation
-- - one inactive conversation
-- per user/dog pair.
--
-- Resetting a chat archives the current active conversation, so over time
-- users need to be able to keep multiple inactive conversations. What we
-- actually want to enforce is only one ACTIVE conversation at a time.

alter table public.coach_conversations
  drop constraint if exists coach_conversations_user_id_dog_id_is_active_key;

create unique index if not exists coach_conversations_one_active_per_dog_idx
  on public.coach_conversations(user_id, dog_id)
  where is_active = true;
