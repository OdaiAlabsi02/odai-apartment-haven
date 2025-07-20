-- Check and create missing RLS policies for apartment-images bucket

-- Create policy to allow authenticated users to upload to apartment-images bucket
CREATE POLICY "Allow authenticated uploads to apartment-images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'apartment-images' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to view apartment-images
CREATE POLICY "Allow authenticated read from apartment-images" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'apartment-images' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to update their uploads in apartment-images
CREATE POLICY "Allow authenticated update to apartment-images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'apartment-images' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to delete their uploads in apartment-images
CREATE POLICY "Allow authenticated delete from apartment-images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'apartment-images' 
  AND auth.role() = 'authenticated'
);