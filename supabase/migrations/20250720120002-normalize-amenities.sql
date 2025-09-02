-- Normalize amenities by moving them from apartments table to dedicated tables
-- This creates a proper many-to-many relationship between apartments and amenities

-- 1. Create amenities table
CREATE TABLE public.amenities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying(100) NOT NULL,
  category_id uuid REFERENCES public.amenity_categories(id),
  icon character varying(50),
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT amenities_pkey PRIMARY KEY (id),
  CONSTRAINT amenities_name_unique UNIQUE (name)
);

-- 2. Create apartment_amenities junction table
CREATE TABLE public.apartment_amenities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  apartment_id uuid NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
  amenity_id uuid NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT apartment_amenities_pkey PRIMARY KEY (id),
  CONSTRAINT apartment_amenities_unique UNIQUE (apartment_id, amenity_id)
);

-- 3. Insert default amenities based on the columns in apartments table
INSERT INTO public.amenities (name, category_id, icon, description) VALUES
-- Essentials
('Wi-Fi', (SELECT id FROM public.amenity_categories WHERE name = 'Essentials'), 'wifi', 'High-speed wireless internet'),
('Air Conditioning', (SELECT id FROM public.amenity_categories WHERE name = 'Essentials'), 'snowflake', 'Central air conditioning'),
('Heating', (SELECT id FROM public.amenity_categories WHERE name = 'Essentials'), 'thermometer', 'Central heating system'),
('Kitchen', (SELECT id FROM public.amenity_categories WHERE name = 'Kitchen'), 'utensils', 'Full kitchen with appliances'),
('Washer', (SELECT id FROM public.amenity_categories WHERE name = 'Essentials'), 'washing-machine', 'Washing machine available'),
('Dryer', (SELECT id FROM public.amenity_categories WHERE name = 'Essentials'), 'wind', 'Clothes dryer available'),
('Parking', (SELECT id FROM public.amenity_categories WHERE name = 'Location'), 'car', 'Free parking on premises'),
('Elevator', (SELECT id FROM public.amenity_categories WHERE name = 'Features'), 'arrow-up', 'Building has elevator'),
('Gym', (SELECT id FROM public.amenity_categories WHERE name = 'Features'), 'dumbbell', 'Fitness center or gym'),
('Pool', (SELECT id FROM public.amenity_categories WHERE name = 'Features'), 'waves', 'Swimming pool'),
('Balcony', (SELECT id FROM public.amenity_categories WHERE name = 'Outdoor'), 'sun', 'Private balcony'),
('Terrace', (SELECT id FROM public.amenity_categories WHERE name = 'Outdoor'), 'mountain', 'Private terrace'),
('TV', (SELECT id FROM public.amenity_categories WHERE name = 'Entertainment'), 'tv', 'Television'),
('Netflix', (SELECT id FROM public.amenity_categories WHERE name = 'Entertainment'), 'play', 'Netflix subscription'),
('Workspace', (SELECT id FROM public.amenity_categories WHERE name = 'Features'), 'monitor', 'Dedicated workspace'),
('Iron', (SELECT id FROM public.amenity_categories WHERE name = 'Essentials'), 'iron', 'Iron and ironing board'),
('Hair Dryer', (SELECT id FROM public.amenity_categories WHERE name = 'Bathroom'), 'scissors', 'Hair dryer'),
('Shampoo', (SELECT id FROM public.amenity_categories WHERE name = 'Bathroom'), 'droplet', 'Shampoo provided'),
('Soap', (SELECT id FROM public.amenity_categories WHERE name = 'Bathroom'), 'droplet', 'Soap provided'),
('Towels', (SELECT id FROM public.amenity_categories WHERE name = 'Bathroom'), 'square', 'Fresh towels provided'),
('Bed Linen', (SELECT id FROM public.amenity_categories WHERE name = 'Bedroom'), 'bed', 'Fresh bed linen'),
('Coffee Maker', (SELECT id FROM public.amenity_categories WHERE name = 'Kitchen'), 'coffee', 'Coffee maker'),
('Microwave', (SELECT id FROM public.amenity_categories WHERE name = 'Kitchen'), 'zap', 'Microwave oven'),
('Dishwasher', (SELECT id FROM public.amenity_categories WHERE name = 'Kitchen'), 'utensils', 'Dishwasher'),
('Refrigerator', (SELECT id FROM public.amenity_categories WHERE name = 'Kitchen'), 'snowflake', 'Refrigerator'),
('Oven', (SELECT id FROM public.amenity_categories WHERE name = 'Kitchen'), 'flame', 'Oven'),
('Stove', (SELECT id FROM public.amenity_categories WHERE name = 'Kitchen'), 'flame', 'Stove top'),
('BBQ', (SELECT id FROM public.amenity_categories WHERE name = 'Outdoor'), 'flame', 'BBQ grill'),
('Garden', (SELECT id FROM public.amenity_categories WHERE name = 'Outdoor'), 'tree', 'Private garden'),
('Security', (SELECT id FROM public.amenity_categories WHERE name = 'Safety'), 'shield', 'Security system'),
('Smoke Detector', (SELECT id FROM public.amenity_categories WHERE name = 'Safety'), 'alert-triangle', 'Smoke detector'),
('First Aid', (SELECT id FROM public.amenity_categories WHERE name = 'Safety'), 'heart', 'First aid kit'),
('Fire Extinguisher', (SELECT id FROM public.amenity_categories WHERE name = 'Safety'), 'flame', 'Fire extinguisher');

-- 4. Migrate existing amenities from apartments table to apartment_amenities
-- We'll do this for each amenity column that exists in the apartments table

-- Helper function to migrate boolean amenities
CREATE OR REPLACE FUNCTION migrate_apartment_amenities()
RETURNS void AS $$
DECLARE
    apartment_record RECORD;
    amenity_id UUID;
BEGIN
    -- Loop through all apartments
    FOR apartment_record IN SELECT * FROM public.apartments LOOP
        -- Check each amenity column that might exist and migrate if true
        -- We'll use dynamic SQL to check if columns exist first
        
        -- Wi-Fi
        IF apartment_record.wifi = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Wi-Fi';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Air Conditioning
        IF apartment_record.air_conditioning = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Air Conditioning';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Heating
        IF apartment_record.heating = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Heating';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Kitchen
        IF apartment_record.kitchen = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Kitchen';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Washer
        IF apartment_record.washer = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Washer';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Dryer
        IF apartment_record.dryer = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Dryer';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Parking
        IF apartment_record.parking = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Parking';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Elevator
        IF apartment_record.elevator = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Elevator';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Gym
        IF apartment_record.gym = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Gym';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Pool
        IF apartment_record.pool = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Pool';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Balcony
        IF apartment_record.balcony = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Balcony';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Terrace
        IF apartment_record.terrace = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Terrace';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- TV
        IF apartment_record.tv = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'TV';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Netflix
        IF apartment_record.netflix = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Netflix';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Workspace
        IF apartment_record.workspace = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Workspace';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Iron
        IF apartment_record.iron = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Iron';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Hair Dryer
        IF apartment_record.hair_dryer = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Hair Dryer';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Shampoo
        IF apartment_record.shampoo = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Shampoo';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Soap
        IF apartment_record.soap = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Soap';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Towels
        IF apartment_record.towels = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Towels';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Bed Linen
        IF apartment_record.bed_linen = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Bed Linen';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Coffee Maker
        IF apartment_record.coffee_maker = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Coffee Maker';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Microwave
        IF apartment_record.microwave = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Microwave';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Dishwasher
        IF apartment_record.dishwasher = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Dishwasher';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Refrigerator
        IF apartment_record.refrigerator = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Refrigerator';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Oven
        IF apartment_record.oven = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Oven';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Stove
        IF apartment_record.stove = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Stove';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- BBQ
        IF apartment_record.bbq = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'BBQ';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Garden
        IF apartment_record.garden = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Garden';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Security
        IF apartment_record.security = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Security';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Smoke Detector
        IF apartment_record.smoke_detector = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Smoke Detector';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- First Aid
        IF apartment_record.first_aid = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'First Aid';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
        -- Fire Extinguisher
        IF apartment_record.fire_extinguisher = true THEN
            SELECT id INTO amenity_id FROM public.amenities WHERE name = 'Fire Extinguisher';
            IF amenity_id IS NOT NULL THEN
                INSERT INTO public.apartment_amenities (apartment_id, amenity_id)
                VALUES (apartment_record.id, amenity_id)
                ON CONFLICT (apartment_id, amenity_id) DO NOTHING;
            END IF;
        END IF;
        
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration function
SELECT migrate_apartment_amenities();

-- Drop the helper function
DROP FUNCTION migrate_apartment_amenities();

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_amenities_category_id ON public.amenities(category_id);
CREATE INDEX IF NOT EXISTS idx_amenities_name ON public.amenities(name);

CREATE INDEX IF NOT EXISTS idx_apartment_amenities_apartment_id ON public.apartment_amenities(apartment_id);
CREATE INDEX IF NOT EXISTS idx_apartment_amenities_amenity_id ON public.apartment_amenities(amenity_id);

-- 6. Create a view for easy querying of apartment amenities
CREATE VIEW public.apartment_amenities_view AS
SELECT 
    aa.apartment_id,
    a.name as apartment_name,
    am.name as amenity_name,
    am.icon as amenity_icon,
    ac.name as category_name,
    ac.icon as category_icon
FROM public.apartment_amenities aa
JOIN public.apartments a ON aa.apartment_id = a.id
JOIN public.amenities am ON aa.amenity_id = am.id
LEFT JOIN public.amenity_categories ac ON am.category_id = ac.id
ORDER BY aa.apartment_id, ac.name, am.name;

-- 7. Create a function to get amenities for an apartment
CREATE OR REPLACE FUNCTION get_apartment_amenities(apartment_uuid UUID)
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
    FROM public.apartment_amenities aa
    JOIN public.amenities am ON aa.amenity_id = am.id
    LEFT JOIN public.amenity_categories ac ON am.category_id = ac.id
    WHERE aa.apartment_id = apartment_uuid
    ORDER BY ac.name, am.name;
END;
$$ LANGUAGE plpgsql; 