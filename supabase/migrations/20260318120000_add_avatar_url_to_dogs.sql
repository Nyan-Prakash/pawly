-- Add avatar_url column to dogs table
-- Nullable: existing rows are unaffected, avatar is optional
ALTER TABLE dogs
ADD COLUMN IF NOT EXISTS avatar_url text NULL;

COMMENT ON COLUMN dogs.avatar_url IS 'Public URL of the dog cartoon avatar image stored in Supabase Storage (avatars/{dog_id}/avatar.png)';
