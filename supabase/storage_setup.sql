-- Storage Bucket Setup for item-images
-- This script creates the storage bucket and sets up proper policies

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'item-images',
  'item-images', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for item-images bucket

-- Allow public read access to all files
CREATE POLICY "Public read access for item images" ON storage.objects
  FOR SELECT USING (bucket_id = 'item-images');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'item-images' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to update their own files
CREATE POLICY "Users can update their own images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'item-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'item-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to list files in their own folders
CREATE POLICY "Users can list their own images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'item-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
