import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface AvailabilityCheck {
  date: string;
  is_available: boolean;
  price: number;
  minimum_stay: number;
  is_instant_book: boolean;
}

export interface AvailabilityRange {
  startDate: string;
  endDate: string;
  nights: number;
  totalPrice: number;
  isAvailable: boolean;
  minimumStayMet: boolean;
  conflicts: string[];
}

function applyLocalOverrides(propertyId: string, list: AvailabilityCheck[]): AvailabilityCheck[] {
  try {
    const overrides = JSON.parse(localStorage.getItem('availabilityOverrides') || '{}');
    const map = overrides?.[propertyId] || {};
    if (!map) return list;
    return list.map(item => {
      const override = map[item.date];
      if (!override) return item;
      return {
        ...item,
        is_available: typeof override.is_available === 'boolean' ? override.is_available : item.is_available,
        price: typeof override.price === 'number' ? override.price : item.price,
        minimum_stay: typeof override.minimum_stay === 'number' ? override.minimum_stay : item.minimum_stay,
      };
    });
  } catch {
    return list;
  }
}

export function useAvailability(propertyId: string) {
  const [availability, setAvailability] = useState<AvailabilityCheck[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<{ startDate: string; endDate: string } | null>(null);

  const generateDefaultAvailability = useCallback((
    startDate: string,
    endDate: string,
    basePrice: number,
    minimumStay: number
  ): AvailabilityCheck[] => {
    const availability: AvailabilityCheck[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const isPast = d < new Date();

      availability.push({
        date: dateStr,
        is_available: !isPast,
        price: basePrice,
        minimum_stay: minimumStay,
        is_instant_book: true
      });
    }

    return availability;
  }, []);

  const fetchAvailability = useCallback(async (startDate: string, endDate: string) => {
    if (!propertyId) return;

    // Prevent duplicate fetches for the same date range
    if (lastFetchRef.current &&
        lastFetchRef.current.startDate === startDate &&
        lastFetchRef.current.endDate === endDate) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('availability_settings')
        .select('*')
        .eq('property_id', propertyId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      // If no custom availability settings, use default property settings
      if (!data || data.length === 0) {
        try {
          const { data: propertyData, error: propertyError } = await supabase
            .from('properties')
            .select('base_price, minimum_stay')
            .eq('id', propertyId)
            .single();

          if (propertyError || !propertyData) {
            const defaultAvailability = generateDefaultAvailability(
              startDate,
              endDate,
              100, // Default price
              1     // Default minimum stay
            );
            const withOverrides = applyLocalOverrides(propertyId, defaultAvailability);
            setAvailability(withOverrides);
            lastFetchRef.current = { startDate, endDate };
            return;
          }

          const defaultAvailability = generateDefaultAvailability(
            startDate,
            endDate,
            propertyData.base_price,
            propertyData.minimum_stay
          );
          const withOverrides = applyLocalOverrides(propertyId, defaultAvailability);
          setAvailability(withOverrides);
          lastFetchRef.current = { startDate, endDate };
          return;
        } catch (error) {
          const defaultAvailability = generateDefaultAvailability(
            startDate,
            endDate,
            100, // Default price
            1     // Default minimum stay
          );
          const withOverrides = applyLocalOverrides(propertyId, defaultAvailability);
          setAvailability(withOverrides);
          lastFetchRef.current = { startDate, endDate };
          return;
        }
      }

      const normalized: AvailabilityCheck[] = data.map((row: any) => ({
        date: row.date,
        is_available: row.is_available ?? true,
        price: row.price ?? 100,
        minimum_stay: row.minimum_stay ?? 1,
        is_instant_book: row.is_instant_book ?? true
      }));

      const withOverrides = applyLocalOverrides(propertyId, normalized);
      setAvailability(withOverrides);
      lastFetchRef.current = { startDate, endDate };
    } catch (err) {
      const defaultAvailability = generateDefaultAvailability(
        startDate,
        endDate,
        100,
        1
      );
      const withOverrides = applyLocalOverrides(propertyId, defaultAvailability);
      setAvailability(withOverrides);
      lastFetchRef.current = { startDate, endDate };
    } finally {
      setLoading(false);
    }
  }, [propertyId, generateDefaultAvailability]);

  const checkAvailabilityRange = useCallback((
    startDate: string,
    endDate: string
  ): AvailabilityRange => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // Get availability for the selected range (inclusive start, exclusive end)
    const rangeAvailability = availability.filter(item =>
      item.date >= startDate && item.date < endDate
    );

    const isAvailable = rangeAvailability.every(item => item.is_available);

    const maxMinimumStay = Math.max(...rangeAvailability.map(item => item.minimum_stay), 1);
    const minimumStayMet = nights >= maxMinimumStay;

    const totalPrice = rangeAvailability.reduce((sum, item) => sum + item.price, 0);

    const conflicts = rangeAvailability
      .filter(item => !item.is_available)
      .map(item => item.date);

    return {
      startDate,
      endDate,
      nights,
      totalPrice,
      isAvailable,
      minimumStayMet,
      conflicts
    };
  }, [availability]);

  const isDateAvailable = useCallback((date: string): boolean => {
    const availabilityItem = availability.find(item => item.date === date);
    if (!availabilityItem) return true;
    return availabilityItem.is_available;
  }, [availability]);

  const getDatePrice = useCallback((date: string): number => {
    const availabilityItem = availability.find(item => item.date === date);
    if (!availabilityItem) {
      return 0;
    }
    return availabilityItem.price;
  }, [availability]);

  const getMinimumStay = useCallback((date: string): number => {
    const availabilityItem = availability.find(item => item.date === date);
    if (!availabilityItem) return 1;
    return availabilityItem.minimum_stay;
  }, [availability]);

  return {
    availability,
    loading,
    error,
    fetchAvailability,
    checkAvailabilityRange,
    isDateAvailable,
    getDatePrice,
    getMinimumStay
  };
}
