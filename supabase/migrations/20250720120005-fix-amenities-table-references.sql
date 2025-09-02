-- Fix amenities table references to use properties instead of apartments
-- This migration corrects the table references in the amenities system

-- 1. Drop the existing apartment_amenities table and recreate it with correct references
DROP TABLE IF EXISTS public.apartment_amenities CASCADE;

-- 2. Create property_amenities junction table (corrected name and references)
CREATE TABLE public.property_amenities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  amenity_id uuid NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT property_amenities_pkey PRIMARY KEY (id),
  CONSTRAINT property_amenities_unique UNIQUE (property_id, amenity_id)
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_amenities_property_id ON public.property_amenities(property_id);
CREATE INDEX IF NOT EXISTS idx_property_amenities_amenity_id ON public.property_amenities(amenity_id);

-- 4. Update the view to use the correct table names
DROP VIEW IF EXISTS public.apartment_amenities_view;

CREATE VIEW public.property_amenities_view AS
SELECT 
    pa.property_id,
    p.title as property_name,
    am.name as amenity_name,
    am.icon as amenity_icon,
    ac.name as category_name,
    ac.icon as category_icon
FROM public.property_amenities pa
JOIN public.properties p ON pa.property_id = p.id
JOIN public.amenities am ON pa.amenity_id = am.id
LEFT JOIN public.amenity_categories ac ON am.category_id = ac.id
ORDER BY pa.property_id, ac.name, am.name;

-- 5. Update the function to use the correct table names
CREATE OR REPLACE FUNCTION get_property_amenities(property_uuid UUID)
RETURNS TABLE (
    amenity_name TEXT,
    amenity_icon TEXT,
    category_name TEXT,
    category_icon TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        am.name::TEXT,
        am.icon::TEXT,
        ac.name::TEXT,
        ac.icon::TEXT
    FROM public.property_amenities pa
    JOIN public.amenities am ON pa.amenity_id = am.id
    LEFT JOIN public.amenity_categories ac ON am.category_id = ac.id
    WHERE pa.property_id = property_uuid
    ORDER BY ac.name, am.name;
END;
$$ LANGUAGE plpgsql;





