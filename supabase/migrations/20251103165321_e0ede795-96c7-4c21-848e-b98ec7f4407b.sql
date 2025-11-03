-- Create storage buckets for media files
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('journal-images', 'journal-images', true),
  ('journal-videos', 'journal-videos', true),
  ('voice-notes', 'voice-notes', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for journal-images bucket
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'journal-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'journal-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'journal-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for journal-videos bucket
CREATE POLICY "Users can upload their own videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'journal-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'journal-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'journal-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for voice-notes bucket
CREATE POLICY "Users can upload their own voice notes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'voice-notes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own voice notes"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'voice-notes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own voice notes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'voice-notes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Make images and videos publicly accessible (since buckets are public)
CREATE POLICY "Public images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'journal-images');

CREATE POLICY "Public videos are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'journal-videos');