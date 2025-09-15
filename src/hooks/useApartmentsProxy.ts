import { useState, useEffect } from 'react';
import { supabaseProxy } from '../lib/supabaseProxyClient';
import { Apartment } from '../data/apartments';
import { apartments as demoApartments } from '../data/apartments';

// Real apartment data from Supabase (hardcoded as fallback)
const realApartments: Apartment[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "Apartment in Amman 3Bedroom with Terrace",
    city: "Amman",
    base_price: 60,
    primary_image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    image_urls: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"
    ],
    image_count: 2,
    featured: true,
    wifi: true,
    air_conditioning: true,
    heating: true,
    kitchen: true,
    washer: true,
    dryer: true,
    parking: true,
    elevator: true,
    gym: false,
    pool: false,
    balcony: true,
    terrace: true,
    tv: true,
    netflix: true,
    workspace: true,
    iron: true,
    hair_dryer: true,
    shampoo: true,
    soap: true,
    towels: true,
    bed_linen: true,
    coffee_maker: true,
    microwave: true,
    dishwasher: true,
    refrigerator: true,
    oven: true,
    stove: true,
    bbq: false,
    garden: false,
    security: true,
    smoke_detector: true,
    first_aid: true,
    fire_extinguisher: true,
    description: "Beautiful 3-bedroom apartment with terrace in Amman",
    property_type: "Apartment",
    property_subtype: "3 Bedroom",
    listing_type: "Entire place",
    building_floors: 5,
    listing_floor: 3,
    building_age: 10,
    unit_size: 120,
    unit_size_unit: "sqm"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    title: "Gather 'n' Gab Gateway",
    city: "Amman",
    base_price: 50,
    primary_image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
    image_urls: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"
    ],
    image_count: 2,
    featured: true,
    wifi: true,
    air_conditioning: true,
    heating: true,
    kitchen: true,
    washer: false,
    dryer: false,
    parking: true,
    elevator: false,
    gym: false,
    pool: false,
    balcony: false,
    terrace: false,
    tv: true,
    netflix: true,
    workspace: true,
    iron: true,
    hair_dryer: true,
    shampoo: true,
    soap: true,
    towels: true,
    bed_linen: true,
    coffee_maker: false,
    microwave: true,
    dishwasher: false,
    refrigerator: true,
    oven: true,
    stove: true,
    bbq: false,
    garden: false,
    security: true,
    smoke_detector: true,
    first_aid: true,
    fire_extinguisher: true,
    description: "Cozy apartment perfect for gatherings",
    property_type: "Apartment",
    property_subtype: "2 Bedroom",
    listing_type: "Entire place",
    building_floors: 3,
    listing_floor: 2,
    building_age: 5,
    unit_size: 80,
    unit_size_unit: "sqm"
  }
];

export function useApartmentsProxy() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed' | 'fallback'>('connecting');

  const fetchApartments = async () => {
    try {
      setLoading(true);
      setConnectionStatus('connecting');
      
      console.log('Attempting to connect via proxy...');
      
      // Try to connect via proxy with a timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 15000)
      );
      
      const proxyPromise = (async () => {
        // Make direct API call to the proxy
        const response = await fetch('/api/supabase-proxy?endpoint=properties&select=*&order=created_at.desc&limit=10', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`Proxy request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
      })();
      
      try {
        const data = await Promise.race([proxyPromise, timeoutPromise]);
        console.log('Successfully connected via proxy!');
        setConnectionStatus('connected');
        setApartments(data || []);
        setUsingFallback(false);
      } catch (proxyError) {
        console.warn('Proxy connection failed, using real data fallback:', proxyError);
        setConnectionStatus('fallback');
        setApartments(realApartments);
        setUsingFallback(true);
      }
      
    } catch (err) {
      console.error('All connection methods failed, using demo data:', err);
      setConnectionStatus('failed');
      setApartments(demoApartments);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  const insertApartment = async (apartmentData: any) => {
    try {
      if (connectionStatus === 'connected') {
        const response = await fetch('/api/supabase-proxy?endpoint=properties&method=POST', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apartmentData)
        });

        if (!response.ok) {
          throw new Error(`Insert failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        await fetchApartments();
        return data[0];
      } else {
        // In fallback mode, just add to local state
        const newApartment = { ...apartmentData, id: Date.now().toString() };
        setApartments(prev => [newApartment, ...prev]);
        return newApartment;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to insert apartment');
      throw err;
    }
  };

  const updateApartment = async (id: string, updates: Partial<Apartment>) => {
    try {
      if (connectionStatus === 'connected') {
        const response = await fetch(`/api/supabase-proxy?endpoint=properties?id=eq.${id}&method=PATCH`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates)
        });

        if (!response.ok) {
          throw new Error(`Update failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        await fetchApartments();
        return data[0];
      } else {
        // In fallback mode, update local state
        setApartments(prev => 
          prev.map(apt => apt.id === id ? { ...apt, ...updates } : apt)
        );
        return { id, ...updates };
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update apartment');
      throw err;
    }
  };

  const deleteApartment = async (id: string) => {
    try {
      if (connectionStatus === 'connected') {
        const response = await fetch(`/api/supabase-proxy?endpoint=properties?id=eq.${id}&method=DELETE`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
        }

        await fetchApartments();
      } else {
        // In fallback mode, remove from local state
        setApartments(prev => prev.filter(apt => apt.id !== id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete apartment');
      throw err;
    }
  };

  const getApartmentById = async (id: string) => {
    if (connectionStatus === 'connected') {
      try {
        const response = await fetch(`/api/supabase-proxy?endpoint=properties?select=*&id=eq.${id}&limit=1`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`Get failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data[0];
      } catch (err) {
        // Fallback to local data
        return realApartments.find(apt => apt.id === id) || demoApartments.find(apt => apt.id === id);
      }
    } else {
      // Return from local data
      return realApartments.find(apt => apt.id === id) || demoApartments.find(apt => apt.id === id);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  return {
    apartments,
    loading,
    error,
    usingDemoData: usingFallback,
    connectionStatus,
    fetchApartments,
    insertApartment,
    addApartment: insertApartment,
    updateApartment,
    deleteApartment,
    getApartmentById
  };
}
