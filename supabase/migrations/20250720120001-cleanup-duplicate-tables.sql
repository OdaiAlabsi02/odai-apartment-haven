-- Cleanup migration to remove duplicate tables and ensure correct schema
-- This migration should be run after the initial migration to clean up any duplicates

-- First, let's check what tables exist and clean up duplicates
-- We'll drop any duplicate tables and recreate them properly

-- Drop any duplicate amenity_categories tables (keep only one)
DROP TABLE IF EXISTS public.amenity_categories CASCADE;

-- Drop any duplicate apartment_availability tables (keep only one)
DROP TABLE IF EXISTS public.apartment_availability CASCADE;

-- Drop any duplicate apartment_images tables (keep only one)
DROP TABLE IF EXISTS public.apartment_images CASCADE;

-- Drop any duplicate apartment_pricing tables (keep only one)
DROP TABLE IF EXISTS public.apartment_pricing CASCADE;

-- Drop any duplicate host_settings tables (keep only one)
DROP TABLE IF EXISTS public.host_settings CASCADE;

-- Drop any duplicate messages tables (keep only one)
DROP TABLE IF EXISTS public.messages CASCADE;

-- Drop any duplicate notifications tables (keep only one)
DROP TABLE IF EXISTS public.notifications CASCADE;

-- Drop any duplicate reviews tables (keep only one)
DROP TABLE IF EXISTS public.reviews CASCADE;

-- Now recreate the tables with the correct schema
-- 1. Amenity Categories Table
CREATE TABLE public.amenity_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(100) NOT NULL,
  description text,
  icon character varying(50),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT amenity_categories_pkey PRIMARY KEY (id)
);

-- 2. Apartment Availability Table
CREATE TABLE public.apartment_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  apartment_id uuid NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
  date date NOT NULL,
  is_available boolean DEFAULT true,
  price_override numeric(10,2),
  minimum_stay integer DEFAULT 1,
  maximum_stay integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT apartment_availability_pkey PRIMARY KEY (id),
  CONSTRAINT apartment_availability_unique UNIQUE (apartment_id, date)
);

-- 3. Apartment Images Table
CREATE TABLE public.apartment_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  apartment_id uuid NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_order integer DEFAULT 0,
  category character varying(100),
  is_primary boolean DEFAULT false,
  alt_text text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT apartment_images_pkey PRIMARY KEY (id)
);

-- 4. Apartment Pricing Table
CREATE TABLE public.apartment_pricing (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  apartment_id uuid NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
  base_price numeric(10,2) NOT NULL,
  weekend_price numeric(10,2),
  holiday_price numeric(10,2),
  weekly_discount integer DEFAULT 0,
  monthly_discount integer DEFAULT 0,
  cleaning_fee numeric(10,2) DEFAULT 0,
  service_fee numeric(10,2) DEFAULT 0,
  security_deposit numeric(10,2) DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT apartment_pricing_pkey PRIMARY KEY (id),
  CONSTRAINT apartment_pricing_unique_apartment UNIQUE (apartment_id)
);

-- 5. Host Settings Table
CREATE TABLE public.host_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instant_book boolean DEFAULT false,
  manual_approval boolean DEFAULT true,
  auto_accept_booking boolean DEFAULT false,
  min_stay_nights integer DEFAULT 1,
  max_stay_nights integer,
  check_in_time time DEFAULT '15:00:00',
  check_out_time time DEFAULT '11:00:00',
  self_check_in boolean DEFAULT false,
  late_check_out boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT host_settings_pkey PRIMARY KEY (id),
  CONSTRAINT host_settings_unique_user UNIQUE (user_id)
);

-- 6. Messages Table
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id),
  receiver_id uuid NOT NULL REFERENCES auth.users(id),
  apartment_id uuid REFERENCES public.apartments(id),
  booking_id uuid REFERENCES public.bookings(id),
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT messages_pkey PRIMARY KEY (id)
);

-- 7. Notifications Table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title character varying(255) NOT NULL,
  message text NOT NULL,
  type character varying(50) NOT NULL,
  is_read boolean DEFAULT false,
  related_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

-- 8. Reviews Table
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  apartment_id uuid NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  booking_id uuid REFERENCES public.bookings(id),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  cleanliness_rating integer CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  communication_rating integer CHECK (communication_rating >= 1 AND communication_rating <= 5),
  check_in_rating integer CHECK (check_in_rating >= 1 AND check_in_rating <= 5),
  accuracy_rating integer CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
  location_rating integer CHECK (location_rating >= 1 AND location_rating <= 5),
  value_rating integer CHECK (value_rating >= 1 AND value_rating <= 5),
  comment text,
  host_response text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_unique_booking UNIQUE (booking_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_apartment_id ON public.reviews(apartment_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_apartment_id ON public.messages(apartment_id);
CREATE INDEX IF NOT EXISTS idx_messages_booking_id ON public.messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

CREATE INDEX IF NOT EXISTS idx_apartment_images_apartment_id ON public.apartment_images(apartment_id);
CREATE INDEX IF NOT EXISTS idx_apartment_images_order ON public.apartment_images(image_order);
CREATE INDEX IF NOT EXISTS idx_apartment_images_primary ON public.apartment_images(is_primary);

CREATE INDEX IF NOT EXISTS idx_apartment_availability_apartment_id ON public.apartment_availability(apartment_id);
CREATE INDEX IF NOT EXISTS idx_apartment_availability_date ON public.apartment_availability(date);
CREATE INDEX IF NOT EXISTS idx_apartment_availability_available ON public.apartment_availability(is_available);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Insert default amenity categories
INSERT INTO public.amenity_categories (name, description, icon) VALUES
('Essentials', 'Basic amenities every guest expects', 'check'),
('Features', 'Special features of your property', 'star'),
('Location', 'Location-based amenities', 'map-pin'),
('Safety', 'Safety and security features', 'shield'),
('Kitchen', 'Kitchen and dining amenities', 'utensils'),
('Bathroom', 'Bathroom amenities', 'droplet'),
('Bedroom', 'Bedroom amenities', 'bed'),
('Entertainment', 'Entertainment options', 'tv'),
('Outdoor', 'Outdoor and garden features', 'tree');

-- Create trigger for updating updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apartment_availability_updated_at BEFORE UPDATE ON public.apartment_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_host_settings_updated_at BEFORE UPDATE ON public.host_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apartment_pricing_updated_at BEFORE UPDATE ON public.apartment_pricing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 