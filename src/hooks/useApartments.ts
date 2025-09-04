import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Apartment } from '../data/apartments';
import { apartments as demoApartments } from '../data/apartments';

export function useApartments() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingDemoData, setUsingDemoData] = useState(false);

  // Simple retry helper with exponential backoff for transient network hiccups
  const retry = async <T>(fn: () => PromiseLike<T>, attempts = 3, baseDelayMs = 500): Promise<T> => {
    let lastError: any;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (attempt === attempts - 1) break;
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw lastError;
  };

  const fetchApartments = async () => {
    try {
      setLoading(true);
      
      console.log('Connecting to Supabase...');
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL || 'https://zwgnhwnrlekinkvpchhs.supabase.co');
      console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      const fetchPromise = (async () => {
        // Test basic connection first with a simple fetch to check DNS resolution
        console.log('Testing DNS resolution and basic connection...');
        
        try {
          // First test if we can reach the Supabase domain at all
          const testResponse = await fetch('https://zwgnhwnrlekinkvpchhs.supabase.co/rest/v1/', {
            method: 'HEAD',
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3Z25od25ybGVraW5rdnBjaGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTEyNjksImV4cCI6MjA2NzYyNzI2OX0.9ybNKhkQW6U7Soml3DftRDUpkiW6MNLv7YH1N60HT6s',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3Z25od25ybGVraW5rdnBjaGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTEyNjksImV4cCI6MjA2NzYyNzI2OX0.9ybNKhkQW6U7Soml3DftRDUpkiW6MNLv7YH1N60HT6s'}`
            }
          });
          
          if (!testResponse.ok) {
            throw new Error(`DNS/Connection test failed: ${testResponse.status} ${testResponse.statusText}`);
          }
          
          console.log('DNS resolution successful, testing Supabase client...');
        } catch (dnsError) {
          console.error('DNS resolution failed:', dnsError);
          throw new Error(`Network error: Unable to reach Supabase server. This may be a temporary DNS issue.`);
        }
        
        // Test basic connection with Supabase client
        const { data: testData, error: testError } = await supabase
          .from('properties')
          .select('id')
          .limit(1);
        
        if (testError) {
          console.error('Supabase client test failed:', testError);
          throw testError;
        }
        console.log('Supabase client test successful, found', testData?.length || 0, 'properties');
        
        // First fetch all properties
        const { data: properties, error: propertiesError } = await (retry(() =>
          supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false }) as any
        ) as unknown as Promise<{ data: any[]; error: any }>);

        if (propertiesError) {
          console.error('Supabase properties error:', propertiesError);
          console.error('Error details:', {
            message: propertiesError.message,
            details: propertiesError.details,
            hint: propertiesError.hint,
            code: propertiesError.code
          });
          throw propertiesError;
        }

        // Then fetch images and amenities for each property
        const apartmentsWithImages = await Promise.all(
          (properties || []).map(async (property) => {
            try {
              // Fetch images
              const { data: images, error: imagesError } = await supabase
                .from('property_images')
                .select('*')
                .eq('property_id', property.id)
                .order('display_order', { ascending: true });

              if (imagesError) {
                console.warn(`Error fetching images for property ${property.id}:`, imagesError);
              }

              // Fetch amenities
              const { data: amenities, error: amenitiesError } = await supabase
                .from('property_amenities')
                .select(`
                  amenity_id,
                  amenities!inner (
                    name,
                    icon
                  )
                `)
                .eq('property_id', property.id);

              if (amenitiesError) {
                console.warn(`Error fetching amenities for property ${property.id}:`, amenitiesError);
              } else {
                console.log(`Fetched amenities for property ${property.id}:`, amenities);
              }

              // Ensure primary photo is first
              const orderedImages = (images || []).slice().sort((a: any, b: any) => {
                if (a.is_primary === b.is_primary) {
                  return (a.display_order || 0) - (b.display_order || 0);
                }
                return a.is_primary ? -1 : 1;
              });

              // Transform amenities to boolean fields for backward compatibility
              const amenityBooleans: { [key: string]: boolean } = {};
              if (amenities && amenities.length > 0) {
                // Map database amenity names to frontend IDs
                const amenityNameToId: { [key: string]: string } = {
                  'Wi-Fi': 'wifi',
                  'Air Conditioning': 'air_conditioning',
                  'Heating': 'heating',
                  'Kitchen': 'kitchen',
                  'Washer': 'washer',
                  'Dryer': 'dryer',
                  'Parking': 'parking',
                  'Elevator': 'elevator',
                  'Gym': 'gym',
                  'Pool': 'pool',
                  'Balcony': 'balcony',
                  'Terrace': 'terrace',
                  'TV': 'tv',
                  'Netflix': 'netflix',
                  'Workspace': 'workspace',
                  'Iron': 'iron',
                  'Hair Dryer': 'hair_dryer',
                  'Shampoo': 'shampoo',
                  'Soap': 'soap',
                  'Towels': 'towels',
                  'Bed Linen': 'bed_linen',
                  'Coffee Maker': 'coffee_maker',
                  'Microwave': 'microwave',
                  'Dishwasher': 'dishwasher',
                  'Refrigerator': 'refrigerator',
                  'Oven': 'oven',
                  'Stove': 'stove',
                  'BBQ': 'bbq',
                  'Garden': 'garden',
                  'Security': 'security',
                  'Smoke Detector': 'smoke_detector',
                  'First Aid': 'first_aid',
                  'Fire Extinguisher': 'fire_extinguisher'
                };

                amenities.forEach((item: any) => {
                  const amenityId = amenityNameToId[item.amenities.name] || item.amenities.name.toLowerCase().replace(/\s+/g, '_');
                  amenityBooleans[amenityId] = true;
                });
              }

              // Transform the data to match the Apartment interface
              const apartment = {
                ...property,
                // Map database fields to interface fields
                title: property.title || property.name,
                city: property.city || property.location,
                base_price: property.base_price || property.price_per_night,
                // Property type fields
                property_type: property.property_type,
                property_subtype: property.property_subtype,
                listing_type: property.listing_type,
                building_floors: property.building_floors,
                listing_floor: property.listing_floor,
                building_age: property.building_age,
                unit_size: property.unit_size,
                unit_size_unit: property.unit_size_unit,
                // Image fields (primary first)
                primary_image: orderedImages?.[0]?.image_url || null,
                image_urls: orderedImages?.filter((img: any) => !img.is_primary).map((img: any) => img.image_url) || [],
                image_count: orderedImages?.length || 0,
                // Amenity fields (from normalized table)
                ...amenityBooleans
              };

              return apartment;
            } catch (error) {
              console.warn(`Error processing property ${property.id}:`, error);
              return property;
            }
          })
        );

        return apartmentsWithImages;
      })();

      // Race between fetch and timeout
      const result = await Promise.race([fetchPromise, timeoutPromise]) as Apartment[];
      
      setApartments(result);
      setUsingDemoData(false);
      
    } catch (err) {
      console.warn('Failed to fetch from Supabase, using demo data:', err);
      // Fallback to demo data
      setApartments(demoApartments);
      setUsingDemoData(true);
    } finally {
      setLoading(false);
    }
  };

  const insertApartment = async (apartmentData: any) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([apartmentData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Refresh the apartments list
      await fetchApartments();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to insert apartment');
      throw err;
    }
  };

  const updateApartment = async (id: string, updates: Partial<Apartment>) => {
    try {
      // Remove fields that do not belong to the properties table
      const { image_urls, image_count, primary_image, ...sanitized } = updates as any;

      const { data, error } = await supabase
        .from('properties')
        .update(sanitized)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Refresh the apartments list
      await fetchApartments();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update apartment');
      throw err;
    }
  };

  const deleteApartment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Refresh the apartments list
      await fetchApartments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete apartment');
      throw err;
    }
  };

  const getApartmentById = async (id: string) => {
    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      
      const fetchPromise = (async () => {
        const { data: property, error: propertyError } = await (retry(() =>
          supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .single() as any
        ) as unknown as Promise<{ data: any; error: any }>);

        if (propertyError) {
          // Fallback to demo data
          const demoApartment = demoApartments.find(apt => apt.id === id);
          if (demoApartment) {
            return demoApartment;
          }
          throw propertyError;
        }

        // Fetch images and amenities for this property
        try {
          const { data: images, error: imagesError } = await supabase
            .from('property_images')
            .select('*')
            .eq('property_id', id)
            .order('display_order', { ascending: true });

          if (imagesError) {
            console.warn(`Error fetching images for property ${id}:`, imagesError);
          }

          // Fetch amenities
          const { data: amenities, error: amenitiesError } = await supabase
            .from('property_amenities')
            .select(`
              amenity_id,
              amenities!inner (
                name,
                icon
              )
            `)
            .eq('property_id', id);

          if (amenitiesError) {
            console.warn(`Error fetching amenities for property ${id}:`, amenitiesError);
          } else {
            console.log(`Fetched amenities for property ${id}:`, amenities);
          }

          // Transform amenities to boolean fields for backward compatibility
          const amenityBooleans: { [key: string]: boolean } = {};
          if (amenities && amenities.length > 0) {
            amenities.forEach((item: any) => {
              const amenityName = item.amenities.name.toLowerCase().replace(/\s+/g, '_');
              amenityBooleans[amenityName] = true;
            });
          }

          // Transform the data to match the Apartment interface
          const apartment = {
            ...property,
            // Map database fields to interface fields
            title: property.title || property.name,
            city: property.city || property.location,
            base_price: property.base_price || property.price_per_night,
            // Property type fields
            property_type: property.property_type,
            property_subtype: property.property_subtype,
            listing_type: property.listing_type,
            building_floors: property.building_floors,
            listing_floor: property.listing_floor,
            building_age: property.building_age,
            unit_size: property.unit_size,
            unit_size_unit: property.unit_size_unit,
            // Image fields
            primary_image: images?.[0]?.image_url || null,
            image_urls: images?.map(img => img.image_url) || [],
            image_count: images?.length || 0,
            // Amenity fields (from normalized table)
            ...amenityBooleans
          };

          return apartment;
        } catch (error) {
          console.warn(`Error fetching images for property ${id}:`, error);
          // Return property without images and amenities
          return {
            ...property,
            title: property.title || property.name,
            city: property.city || property.location,
            base_price: property.base_price || property.price_per_night,
            // Property type fields
            property_type: property.property_type,
            property_subtype: property.property_subtype,
            listing_type: property.listing_type,
            building_floors: property.building_floors,
            listing_floor: property.listing_floor,
            building_age: property.building_age,
            unit_size: property.unit_size,
            unit_size_unit: property.unit_size_unit,
            primary_image: null,
            image_urls: [],
            image_count: 0
          };
        }
      })();

      // Race between fetch and timeout
      return await Promise.race([fetchPromise, timeoutPromise]);
      
    } catch (err) {
      console.warn('Failed to fetch apartment, trying demo data:', err);
      // Final fallback to demo data
      const demoApartment = demoApartments.find(apt => apt.id === id);
      if (demoApartment) {
        return demoApartment;
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch apartment');
      throw err;
    }
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  return {
    apartments,
    loading,
    error,
    usingDemoData,
    fetchApartments,
    insertApartment,
    addApartment: insertApartment, // Alias for backward compatibility
    updateApartment,
    deleteApartment,
    getApartmentById
  };
} 