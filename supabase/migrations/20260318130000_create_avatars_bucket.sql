-- Create public avatars storage bucket for dog avatar images
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow authenticated users to upload to their own avatar path
DO $$ BEGIN
  CREATE POLICY "Authenticated users can upload avatars"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow anyone to read avatars (bucket is public)
DO $$ BEGIN
  CREATE POLICY "Anyone can read avatars"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow authenticated users to update/replace their own avatars
DO $$ BEGIN
  CREATE POLICY "Authenticated users can update avatars"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
