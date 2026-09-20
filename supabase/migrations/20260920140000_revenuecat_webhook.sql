-- RevenueCat → Supabase subscription sync.
-- The revenuecat-webhook edge function (service role) writes these columns;
-- ai-coach-message reads subscription_tier to pick the coach limit.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  -- Timestamp of the last RevenueCat event applied, so late events are ignored.
  ADD COLUMN IF NOT EXISTS subscription_event_at   TIMESTAMPTZ;

-- Extend the service-role-only guard to the new columns.
CREATE OR REPLACE FUNCTION public.protect_subscription_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    IF TG_OP = 'INSERT' THEN
      NEW.subscription_tier := 'free';
      NEW.subscription_expires_at := NULL;
      NEW.subscription_event_at := NULL;
    ELSE
      NEW.subscription_tier := OLD.subscription_tier;
      NEW.subscription_expires_at := OLD.subscription_expires_at;
      NEW.subscription_event_at := OLD.subscription_event_at;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
