-- PR 25: Secure apply_plan_adaptation RPC ownership check

CREATE OR REPLACE FUNCTION public.apply_plan_adaptation(
  p_plan_id uuid,
  p_dog_id uuid,
  p_user_id uuid, -- Pass user_id explicitly from the Edge Function
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
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_adaptation_id uuid;
BEGIN
  -- SEC-03: Ownership Check
  -- This ensures that the user context from the authenticated Edge Function
  -- matches the owner of the dog being modified.
  IF NOT EXISTS (
    SELECT 1 FROM public.dogs
    WHERE id = p_dog_id
      AND owner_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Dog ownership check failed.';
  END IF;

  IF p_status = 'applied' THEN
    UPDATE public.plans
    SET
      sessions = p_sessions,
      metadata = COALESCE(metadata, '{}'::jsonb) || COALESCE(p_metadata_patch, '{}'::jsonb),
      current_stage = COALESCE(p_current_stage, current_stage),
      current_week = COALESCE(p_current_week, current_week),
      updated_at = NOW()
    WHERE id = p_plan_id
      AND dog_id = p_dog_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'plan not found for adaptation';
    END IF;
  END IF;

  INSERT INTO public.plan_adaptations (
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
  ) VALUES (
    p_dog_id,
    p_plan_id,
    p_triggered_by_session_log_id,
    p_adaptation_type,
    p_status,
    p_reason_code,
    p_reason_summary,
    COALESCE(p_evidence, '{}'::jsonb),
    COALESCE(p_previous_snapshot, '{}'::jsonb),
    COALESCE(p_new_snapshot, '{}'::jsonb),
    COALESCE(p_changed_session_ids, '{}'::text[]),
    COALESCE(p_changed_fields, '{}'::text[]),
    p_model_name,
    p_latency_ms,
    COALESCE(p_was_user_visible, true)
  )
  RETURNING id INTO v_adaptation_id;

  RETURN v_adaptation_id;
END;
$$;

-- Note: revoking/granting again to ensure it stays locked down to service_role
REVOKE ALL ON FUNCTION public.apply_plan_adaptation(
  uuid, uuid, uuid, jsonb, jsonb, text, integer, uuid, text, text, text, text, jsonb, jsonb, jsonb, text[], text[], text, integer, boolean
) FROM public, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.apply_plan_adaptation(
  uuid, uuid, uuid, jsonb, jsonb, text, integer, uuid, text, text, text, text, jsonb, jsonb, jsonb, text[], text[], text, integer, boolean
) TO service_role;
