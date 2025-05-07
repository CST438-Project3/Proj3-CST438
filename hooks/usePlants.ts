import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Plant {
  id: number;
  name: string;
  scientific_name: string;
  description: string;
  water_level: number;
  sun_type: string;
  temperature: number;
  image_url: string;
  category: 'indoor' | 'outdoor' | 'both';
}

interface UsePlantsResult {
  plants: Plant[];
  loading: boolean;
  error: Error | null;
  searchPlants: (query: string) => Promise<void>;
  getPlantById: (id: number) => Promise<Plant | null>;
}

export function usePlants(): UsePlantsResult {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const searchPlants = async (query: string) => {
    try {
      setLoading(true);
      setError(null);

      let queryBuilder = supabase
        .from('plants')
        .select('*');

      if (query) {
        queryBuilder = queryBuilder.or(
          `name.ilike.%${query}%,scientific_name.ilike.%${query}%,description.ilike.%${query}%`
        );
      }

      const { data, error: searchError } = await queryBuilder;

      if (searchError) throw searchError;

      setPlants(data || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error searching plants:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPlantById = async (id: number): Promise<Plant | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('plants')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return data;
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching plant:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Initial load of plants
  useEffect(() => {
    searchPlants('');
  }, []);

  return {
    plants,
    loading,
    error,
    searchPlants,
    getPlantById,
  };
}
