-- Create property_images table for managing property images
CREATE TABLE IF NOT EXISTS public.property_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  alt_text text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT property_images_pkey PRIMARY KEY (id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON public.property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_display_order ON public.property_images(display_order);
CREATE INDEX IF NOT EXISTS idx_property_images_is_primary ON public.property_images(is_primary);

-- Create RLS policies for property_images
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read property images
CREATE POLICY "Anyone can view property images" 
ON public.property_images 
FOR SELECT 
USING (true);

-- Allow authenticated users to manage property images
CREATE POLICY "Authenticated users can manage property images" 
ON public.property_images 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);





