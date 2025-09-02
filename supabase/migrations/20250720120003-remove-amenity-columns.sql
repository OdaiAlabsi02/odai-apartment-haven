-- Remove amenity columns from apartments table after migration to amenities table
-- This should be run after the amenities migration is complete

-- Remove all the boolean amenity columns from the apartments table
ALTER TABLE public.apartments 
DROP COLUMN IF EXISTS wifi,
DROP COLUMN IF EXISTS air_conditioning,
DROP COLUMN IF EXISTS heating,
DROP COLUMN IF EXISTS kitchen,
DROP COLUMN IF EXISTS washer,
DROP COLUMN IF EXISTS dryer,
DROP COLUMN IF EXISTS parking,
DROP COLUMN IF EXISTS elevator,
DROP COLUMN IF EXISTS gym,
DROP COLUMN IF EXISTS pool,
DROP COLUMN IF EXISTS balcony,
DROP COLUMN IF EXISTS terrace,
DROP COLUMN IF EXISTS tv,
DROP COLUMN IF EXISTS netflix,
DROP COLUMN IF EXISTS workspace,
DROP COLUMN IF EXISTS iron,
DROP COLUMN IF EXISTS hair_dryer,
DROP COLUMN IF EXISTS shampoo,
DROP COLUMN IF EXISTS soap,
DROP COLUMN IF EXISTS towels,
DROP COLUMN IF EXISTS bed_linen,
DROP COLUMN IF EXISTS coffee_maker,
DROP COLUMN IF EXISTS microwave,
DROP COLUMN IF EXISTS dishwasher,
DROP COLUMN IF EXISTS refrigerator,
DROP COLUMN IF EXISTS oven,
DROP COLUMN IF EXISTS stove,
DROP COLUMN IF EXISTS bbq,
DROP COLUMN IF EXISTS garden,
DROP COLUMN IF EXISTS security,
DROP COLUMN IF EXISTS smoke_detector,
DROP COLUMN IF EXISTS first_aid,
DROP COLUMN IF EXISTS fire_extinguisher;

-- Also remove the old amenities jsonb column since we now have a proper amenities table
ALTER TABLE public.apartments DROP COLUMN IF EXISTS amenities;

-- Remove amenity_details jsonb column as well
ALTER TABLE public.apartments DROP COLUMN IF EXISTS amenity_details; 