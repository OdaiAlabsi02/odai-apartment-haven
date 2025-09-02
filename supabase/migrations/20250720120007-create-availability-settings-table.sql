-- Create availability_settings table for managing property availability
CREATE TABLE IF NOT EXISTS public.availability_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  date date NOT NULL,
  is_available boolean DEFAULT true,
  price decimal(10,2),
  minimum_stay integer DEFAULT 1,
  maximum_stay integer,
  is_instant_book boolean DEFAULT true,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT availability_settings_pkey PRIMARY KEY (id),
  CONSTRAINT availability_settings_unique UNIQUE (property_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_availability_settings_property_id ON public.availability_settings(property_id);
CREATE INDEX IF NOT EXISTS idx_availability_settings_date ON public.availability_settings(date);
CREATE INDEX IF NOT EXISTS idx_availability_settings_available ON public.availability_settings(is_available);

-- Create RLS policies for availability_settings
ALTER TABLE public.availability_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read availability settings
CREATE POLICY "Anyone can view availability settings" 
ON public.availability_settings 
FOR SELECT 
USING (true);

-- Allow authenticated users to manage availability settings
CREATE POLICY "Authenticated users can manage availability settings" 
ON public.availability_settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_availability_settings_updated_at()
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

CREATE TRIGGER update_availability_settings_updated_at
    BEFORE UPDATE ON public.availability_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_availability_settings_updated_at();





