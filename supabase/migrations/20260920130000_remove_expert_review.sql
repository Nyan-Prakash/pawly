-- ─────────────────────────────────────────────────────────────────────────────
-- Remove video upload & expert review (cut from 1.0; never reachable in-app)
-- ─────────────────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS on_new_user_create_review_credits ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_review_credits();

DROP TABLE IF EXISTS public.expert_reviews;
DROP TABLE IF EXISTS public.review_credits;
DROP TABLE IF EXISTS public.videos;

-- Nothing uploads to pawly-videos any more. The bucket itself is left in place
-- (Supabase blocks deleting buckets/objects from SQL); delete-account still
-- clears a user's folder, and the bucket can be removed from the dashboard.
DROP POLICY IF EXISTS "Users can upload own videos pr08" ON storage.objects;

UPDATE public.user_profiles
SET notification_prefs = notification_prefs - 'expert_review'
WHERE notification_prefs ? 'expert_review';
