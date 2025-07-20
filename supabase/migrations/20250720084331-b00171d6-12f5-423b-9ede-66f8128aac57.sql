-- Drop all existing policies on storage.objects for apartment-images bucket and create very simple ones
DROP POLICY IF EXISTS "Allow all authenticated users to upload to apartment-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from apartment-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update apartment-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete apartment-images" ON storage.objects;

-- Create very simple policies that should work
CREATE POLICY "apartment_images_upload_policy" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'apartment-images');

CREATE POLICY "apartment_images_select_policy" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'apartment-images');

CREATE POLICY "apartment_images_update_policy" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'apartment-images');

CREATE POLICY "apartment_images_delete_policy" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'apartment-images');