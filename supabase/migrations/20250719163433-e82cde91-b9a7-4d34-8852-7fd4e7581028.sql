-- Fix function security by adding proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_total_bedrooms(apartment_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    RETURN COALESCE((
        SELECT bedrooms 
        FROM apartments 
        WHERE id = apartment_uuid
    ), 0);
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_total_beds_from_columns(apartment_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    total_beds_count INTEGER := 0;
BEGIN
    SELECT 
        COALESCE(bedroom_1_beds, 0) + 
        COALESCE(bedroom_2_beds, 0) + 
        COALESCE(bedroom_3_beds, 0) + 
        COALESCE(bedroom_4_beds, 0) + 
        COALESCE(bedroom_5_beds, 0)
    INTO total_beds_count
    FROM apartments 
    WHERE id = apartment_uuid;
    
    RETURN total_beds_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_bed_details_text_from_columns(apartment_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    bed_details TEXT := '';
    bedroom_1_types TEXT[];
    bedroom_2_types TEXT[];
    bedroom_3_types TEXT[];
    bedroom_4_types TEXT[];
    bedroom_5_types TEXT[];
    bed_type TEXT;
BEGIN
    SELECT 
        bedroom_1_bed_types, bedroom_2_bed_types, bedroom_3_bed_types,
        bedroom_4_bed_types, bedroom_5_bed_types
    INTO 
        bedroom_1_types, bedroom_2_types, bedroom_3_types,
        bedroom_4_types, bedroom_5_types
    FROM apartments 
    WHERE id = apartment_uuid;
    
    -- Combine all bed types
    IF bedroom_1_types IS NOT NULL THEN
        FOREACH bed_type IN ARRAY bedroom_1_types
        LOOP
            IF bed_details != '' THEN
                bed_details := bed_details || ', ';
            END IF;
            bed_details := bed_details || bed_type;
        END LOOP;
    END IF;
    
    IF bedroom_2_types IS NOT NULL THEN
        FOREACH bed_type IN ARRAY bedroom_2_types
        LOOP
            IF bed_details != '' THEN
                bed_details := bed_details || ', ';
            END IF;
            bed_details := bed_details || bed_type;
        END LOOP;
    END IF;
    
    IF bedroom_3_types IS NOT NULL THEN
        FOREACH bed_type IN ARRAY bedroom_3_types
        LOOP
            IF bed_details != '' THEN
                bed_details := bed_details || ', ';
            END IF;
            bed_details := bed_details || bed_type;
        END LOOP;
    END IF;
    
    IF bedroom_4_types IS NOT NULL THEN
        FOREACH bed_type IN ARRAY bedroom_4_types
        LOOP
            IF bed_details != '' THEN
                bed_details := bed_details || ', ';
            END IF;
            bed_details := bed_details || bed_type;
        END LOOP;
    END IF;
    
    IF bedroom_5_types IS NOT NULL THEN
        FOREACH bed_type IN ARRAY bedroom_5_types
        LOOP
            IF bed_details != '' THEN
                bed_details := bed_details || ', ';
            END IF;
            bed_details := bed_details || bed_type;
        END LOOP;
    END IF;
    
    RETURN bed_details;
END;
$function$;

-- Create apartment-images storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('apartment-images', 'apartment-images', true);

-- Create storage policies for apartment images
CREATE POLICY "Anyone can view apartment images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'apartment-images');

CREATE POLICY "Admins can upload apartment images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'apartment-images' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update apartment images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'apartment-images' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete apartment images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'apartment-images' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Update apartments table to support better availability tracking
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS available_from DATE;
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS available_until DATE;
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add missing RLS policies for apartments
CREATE POLICY "Admins can update their listings" 
ON apartments 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete their listings" 
ON apartments 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Add missing RLS policies for bookings
CREATE POLICY "Admins can view all bookings" 
ON bookings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update all bookings" 
ON bookings 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Update bookings table for better status tracking
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS admin_notes TEXT;