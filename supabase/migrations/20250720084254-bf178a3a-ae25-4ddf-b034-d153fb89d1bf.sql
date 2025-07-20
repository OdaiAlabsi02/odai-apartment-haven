-- Drop the existing restrictive policies and create more permissive ones for testing

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated uploads to apartment-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read from apartment-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update to apartment-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete from apartment-images" ON storage.objects;

-- Create more permissive policies for the apartment-images bucket
CREATE POLICY "Allow all authenticated users to upload to apartment-images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'apartment-images' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access to apartment images
CREATE POLICY "Allow public read from apartment-images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'apartment-images');

-- Allow authenticated users to update their uploads
CREATE POLICY "Allow authenticated users to update apartment-images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'apartment-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their uploads
CREATE POLICY "Allow authenticated users to delete apartment-images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'apartment-images' 
  AND auth.role() = 'authenticated'
);