import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Apartment } from '../data/apartments';

export function useApartments() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApartments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('apartments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setApartments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch apartments');
    } finally {
      setLoading(false);
    }
  };

  const insertApartment = async (apartmentData: any) => {
    try {
      const { data, error } = await supabase
        .from('apartments')
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
      const { data, error } = await supabase
        .from('apartments')
        .update(updates)
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
        .from('apartments')
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
      const { data, error } = await supabase
        .from('apartments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
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
    fetchApartments,
    insertApartment,
    addApartment: insertApartment, // Alias for backward compatibility
    updateApartment,
    deleteApartment,
    getApartmentById
  };
} 