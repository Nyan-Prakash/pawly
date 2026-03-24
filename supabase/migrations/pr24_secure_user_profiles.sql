-- PR 24: Secure user_profiles by preventing unauthorized subscription_tier updates

-- 1. Create a trigger function to protect sensitive columns
CREATE OR REPLACE FUNCTION protect_user_profile_sensitive_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- If the user is not a service role (admin) and is trying to change the subscription_tier
  IF (current_setting('role') != 'service_role') AND (OLD.subscription_tier IS DISTINCT FROM NEW.subscription_tier) THEN
    -- Revert the subscription_tier to the OLD value
    NEW.subscription_tier := OLD.subscription_tier;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach the trigger to the user_profiles table
DROP TRIGGER IF EXISTS tr_protect_subscription_tier ON public.user_profiles;
CREATE TRIGGER tr_protect_subscription_tier
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION protect_user_profile_sensitive_columns();

-- 3. Update the existing RLS policy for clarity (though the trigger provides the main enforcement)
-- The user_profiles_update policy still exists and allows updating other columns like onboarding_completed_at.
