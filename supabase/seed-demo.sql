-- Semi-real demo data seed for properties, images, and amenities links
-- Run this in Supabase SQL editor (project database) before testing

-- 1) Create an admin profile for your email if not exists (replace with your email)
-- UPDATE this email to your own before running
DO $$
DECLARE
  admin_user_id uuid;
  admin_email text := 'you@example.com';
BEGIN
  SELECT id INTO admin_user_id FROM auth.users WHERE email = admin_email LIMIT 1;
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (admin_user_id, admin_email, 'Site Admin', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin', email = EXCLUDED.email;
  END IF;
END $$;

-- 2) Insert two properties
WITH ins AS (
  INSERT INTO public.properties (
    title, description, property_type, room_type, max_guests, bedrooms, bathrooms, beds,
    base_price, currency, address_line1, city, state, country, postal_code,
    check_in_time, check_out_time, is_instant_book, is_active, featured
  ) VALUES
  (
    'Modern Downtown Loft',
    'A stunning modern loft in the heart of downtown with floor-to-ceiling windows and designer furnishings.',
    'apartment', 'entire_place', 4, 2, 2, 2,
    120.00, 'USD', '100 Main St', 'City Center', 'State', 'Country', '10000',
    '15:00', '11:00', true, true, true
  ),
  (
    'Cozy Garden Apartment',
    'A peaceful ground-floor apartment with a private garden and fully equipped kitchen.',
    'apartment', 'entire_place', 3, 1, 1, 2,
    85.00, 'USD', '50 Elm Road', 'Suburbia', 'State', 'Country', '20000',
    '15:00', '11:00', true, true, false
  )
  RETURNING id, title
)
SELECT * FROM ins;

-- 3) Attach images to properties (Unsplash placeholders)
WITH props AS (
  SELECT id, title FROM public.properties WHERE title IN ('Modern Downtown Loft','Cozy Garden Apartment')
)
INSERT INTO public.property_images (property_id, image_url, display_order, is_primary)
SELECT p.id,
  img.url,
  img.ord,
  img.is_primary
FROM props p
CROSS JOIN LATERAL (
  SELECT unnest(ARRAY[
    ROW('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200', 0, true),
    ROW('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200', 1, false),
    ROW('https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200', 2, false)
  ]) AS t(url text, ord int, is_primary boolean)
) AS img
ON CONFLICT DO NOTHING;

-- 4) Optionally attach some common amenities if they exist
WITH props AS (
  SELECT id FROM public.properties WHERE title IN ('Modern Downtown Loft','Cozy Garden Apartment')
), am AS (
  SELECT id, name FROM public.amenities WHERE name IN ('Wi-Fi','Kitchen','TV','Heating','Air Conditioning','Washer','Parking')
)
INSERT INTO public.property_amenities (property_id, amenity_id)
SELECT p.id, a.id
FROM props p
CROSS JOIN am a
ON CONFLICT (property_id, amenity_id) DO NOTHING;


