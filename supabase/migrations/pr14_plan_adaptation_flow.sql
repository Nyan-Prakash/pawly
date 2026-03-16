-- PR 14: Continuous short-horizon plan adaptation flow

alter table public.plans
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create or replace function public.apply_plan_adaptation(
  p_plan_id uuid,
  p_dog_id uuid,
  p_sessions jsonb,
  p_metadata_patch jsonb,
  p_current_stage text,
  p_current_week integer,
  p_triggered_by_session_log_id uuid,
  p_adaptation_type text,
  p_status text,
  p_reason_code text,
  p_reason_summary text,
  p_evidence jsonb,
  p_previous_snapshot jsonb,
  p_new_snapshot jsonb,
  p_changed_session_ids text[],
  p_changed_fields text[],
  p_model_name text,
  p_latency_ms integer,
  p_was_user_visible boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_adaptation_id uuid;
begin
  if p_status = 'applied' then
    update public.plans
    set
      sessions = p_sessions,
      metadata = coalesce(metadata, '{}'::jsonb) || coalesce(p_metadata_patch, '{}'::jsonb),
      current_stage = coalesce(p_current_stage, current_stage),
      current_week = coalesce(p_current_week, current_week),
      updated_at = now()
    where id = p_plan_id
      and dog_id = p_dog_id;

    if not found then
      raise exception 'plan not found for adaptation';
    end if;
  end if;

  insert into public.plan_adaptations (
    dog_id,
    plan_id,
    triggered_by_session_log_id,
    adaptation_type,
    status,
    reason_code,
    reason_summary,
    evidence,
    previous_snapshot,
    new_snapshot,
    changed_session_ids,
    changed_fields,
    model_name,
    latency_ms,
    was_user_visible
  ) values (
    p_dog_id,
    p_plan_id,
    p_triggered_by_session_log_id,
    p_adaptation_type,
    p_status,
    p_reason_code,
    p_reason_summary,
    coalesce(p_evidence, '{}'::jsonb),
    coalesce(p_previous_snapshot, '{}'::jsonb),
    coalesce(p_new_snapshot, '{}'::jsonb),
    coalesce(p_changed_session_ids, '{}'::text[]),
    coalesce(p_changed_fields, '{}'::text[]),
    p_model_name,
    p_latency_ms,
    coalesce(p_was_user_visible, true)
  )
  returning id into v_adaptation_id;

  return v_adaptation_id;
end;
$$;

revoke all on function public.apply_plan_adaptation(
  uuid, uuid, jsonb, jsonb, text, integer, uuid, text, text, text, text, jsonb, jsonb, jsonb, text[], text[], text, integer, boolean
) from public, anon, authenticated;

grant execute on function public.apply_plan_adaptation(
  uuid, uuid, jsonb, jsonb, text, integer, uuid, text, text, text, text, jsonb, jsonb, jsonb, text[], text[], text, integer, boolean
) to service_role;
