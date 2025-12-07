-- Make storage buckets private for security
UPDATE storage.buckets SET public = false WHERE id = 'journal-images';
UPDATE storage.buckets SET public = false WHERE id = 'journal-videos';
UPDATE storage.buckets SET public = false WHERE id = 'voice-notes';

-- Drop existing policies if any (to avoid duplicates)
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own voice notes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own voice notes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own voice notes" ON storage.objects;

-- Create RLS policies for journal-images bucket
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'journal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'journal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'journal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create RLS policies for journal-videos bucket
CREATE POLICY "Users can upload their own videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'journal-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own videos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'journal-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'journal-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create RLS policies for voice-notes bucket
CREATE POLICY "Users can upload their own voice notes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own voice notes"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own voice notes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'voice-notes' AND auth.uid()::text = (storage.foldername(name))[1]);