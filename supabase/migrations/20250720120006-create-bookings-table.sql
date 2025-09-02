-- Create bookings table with all required fields
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  guest_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  host_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  guests integer NOT NULL DEFAULT 1,
  adults integer DEFAULT 1,
  children integer DEFAULT 0,
  infants integer DEFAULT 0,
  base_amount decimal(10,2) NOT NULL,
  cleaning_fee decimal(10,2) DEFAULT 0,
  service_fee decimal(10,2) DEFAULT 0,
  tax_amount decimal(10,2) DEFAULT 0,
  total_amount decimal(10,2) NOT NULL,
  currency varchar(3) DEFAULT 'USD',
  status varchar(20) DEFAULT 'pending',
  special_requests text,
  booking_date timestamp with time zone DEFAULT timezone('utc'::text, now()),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  -- Payment fields
  payment_type varchar(20) DEFAULT 'full',
  online_amount decimal(10,2) DEFAULT 0,
  cash_amount decimal(10,2) DEFAULT 0,
  cash_received boolean DEFAULT false,
  cash_received_at timestamp with time zone,
  cash_received_by uuid REFERENCES auth.users(id),
  stripe_payment_intent_id varchar(255),
  -- Refund fields
  refund_status varchar(20),
  refund_amount decimal(10,2),
  refund_reason text,
  refund_processed_at timestamp with time zone,
  -- Guest information for non-authenticated users
  guest_name varchar(255),
  guest_email varchar(255),
  guest_phone varchar(20),
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_check_dates CHECK (check_out_date > check_in_date),
  CONSTRAINT bookings_positive_amounts CHECK (total_amount > 0 AND base_amount > 0)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON public.bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_id ON public.bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_host_id ON public.bookings(host_id);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in_date ON public.bookings(check_in_date);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out_date ON public.bookings(check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at);

-- Create RLS policies for bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own bookings
CREATE POLICY "Users can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (
  guest_id = auth.uid() OR 
  host_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow users to create bookings
CREATE POLICY "Users can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (
  guest_id = auth.uid() OR 
  guest_id IS NULL -- Allow guest bookings
);

-- Allow users to update their own bookings
CREATE POLICY "Users can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (
  guest_id = auth.uid() OR 
  host_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to delete bookings
CREATE POLICY "Admins can delete bookings" 
ON public.bookings 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_bookings_updated_at()
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

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_bookings_updated_at();





