-- Add new property type fields to the properties table
-- This migration adds the fields needed for the Airbnb-style property type selection

-- Add property type detail fields
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS property_subtype VARCHAR(100),
ADD COLUMN IF NOT EXISTS listing_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS building_floors INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS listing_floor INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS building_age VARCHAR(50),
ADD COLUMN IF NOT EXISTS unit_size VARCHAR(50),
ADD COLUMN IF NOT EXISTS unit_size_unit VARCHAR(20) DEFAULT 'sq_meters';

-- Add comments to document the new fields
COMMENT ON COLUMN public.properties.property_subtype IS 'Property subtype (e.g., rental unit, condo, loft for apartments)';
COMMENT ON COLUMN public.properties.listing_type IS 'Listing type (entire place, shared room, room)';
COMMENT ON COLUMN public.properties.building_floors IS 'Total number of floors in the building';
COMMENT ON COLUMN public.properties.listing_floor IS 'Which floor the listing is on';
COMMENT ON COLUMN public.properties.building_age IS 'Year the building was constructed';
COMMENT ON COLUMN public.properties.unit_size IS 'Size of the unit';
COMMENT ON COLUMN public.properties.unit_size_unit IS 'Unit of measurement for size (sq_meters, sq_feet, acres)';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_property_subtype ON public.properties(property_subtype);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON public.properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_building_floors ON public.properties(building_floors);









