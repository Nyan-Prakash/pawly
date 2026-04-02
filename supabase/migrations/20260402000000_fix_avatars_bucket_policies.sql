-- Fix avatars bucket storage policies to scope uploads to each user's own path.
-- Previously the INSERT and UPDATE policies only checked bucket_id, allowing any
-- authenticated user to upload to any path (including overwriting other users' avatars).
-- The client uses the convention avatars/{userId}_{timestamp}.png so we enforce
-- that the first path segment starts with the caller's uid.

-- Drop the old unscoped policies
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;

-- INSERT: user may only upload to a path that begins with their own uid
CREATE POLICY "Users can upload their own avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.filename(name) LIKE (auth.uid()::text || '_%'))
  );

-- UPDATE: user may only replace a file that belongs to their own uid
CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.filename(name) LIKE (auth.uid()::text || '_%'))
  );

-- DELETE: user may only delete their own avatar files (policy was missing before)
CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.filename(name) LIKE (auth.uid()::text || '_%'))
  );
