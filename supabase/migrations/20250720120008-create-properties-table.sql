-- Create properties table (main table for apartment listings)
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title varchar(255) NOT NULL,
  description text,
  property_type varchar(50),
  property_subtype varchar(50),
  listing_type varchar(50),
  room_type varchar(50),
  max_guests integer DEFAULT 1,
  bedrooms integer DEFAULT 1,
  bathrooms integer DEFAULT 1,
  beds integer DEFAULT 1,
  base_price decimal(10,2) NOT NULL,
  currency varchar(3) DEFAULT 'USD',
  host_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Location details
  address_line1 varchar(255),
  address_line2 varchar(255),
  city varchar(100),
  state varchar(100),
  country varchar(100),
  postal_code varchar(20),
  latitude decimal(10,8),
  longitude decimal(11,8),
  -- Additional details
  square_feet integer,
  minimum_stay integer DEFAULT 1,
  maximum_stay integer,
  check_in_time time DEFAULT '15:00:00',
  check_out_time time DEFAULT '11:00:00',
  is_instant_book boolean DEFAULT true,
  is_active boolean DEFAULT true,
  featured boolean DEFAULT false,
  -- Building details
  building_floors integer,
  listing_floor integer,
  building_age varchar(50),
  unit_size varchar(50),
  unit_size_unit varchar(10),
  -- Legacy fields for backward compatibility
  name varchar(255), -- Legacy field, maps to title
  location varchar(255), -- Legacy field, maps to city
  price_per_night decimal(10,2), -- Legacy field, maps to base_price
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT properties_pkey PRIMARY KEY (id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_host_id ON public.properties(host_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_base_price ON public.properties(base_price);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_is_active ON public.properties(is_active);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at);

-- Create RLS policies for properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active properties
CREATE POLICY "Anyone can view active properties" 
ON public.properties 
FOR SELECT 
USING (is_active = true);

-- Allow authenticated users to manage their own properties
CREATE POLICY "Users can manage their own properties" 
ON public.properties 
FOR ALL 
USING (
  host_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_properties_updated_at()
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

CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION public.update_properties_updated_at();








