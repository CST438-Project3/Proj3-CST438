import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Plant {
  id: string;
  plantName: string;
  scientificName: string;
  description?: string;
  waterLevel?: number;
  sunType?: string;
  temperature?: number;
  imageUrl: string | null;
  category?: 'indoor' | 'outdoor' | 'both';
}

interface UsePlantsResult {
  plants: Plant[];
  loading: boolean;
  error: Error | null;
  searchPlants: (query: string) => Promise<void>;
  getPlantById: (id: string) => Promise<Plant | null>;
  resetSearch: () => Promise<void>;
}

export function usePlants(): UsePlantsResult {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [originalPlants, setOriginalPlants] = useState<Plant[]>([]);
  const [currentQuery, setCurrentQuery] = useState<string>('');

  const fetchAllPlants = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('plant')
        .select('*')
        .order('plantName');

      if (fetchError) throw fetchError;

      setPlants(data || []);
      setOriginalPlants(data || []);
      return data;
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching plants:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const searchPlants = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentQuery(query);

      if (!query.trim()) {
        setPlants(originalPlants);
        return;
      }

      const filteredPlants = originalPlants.filter(
        plant => 
          plant.plantName.toLowerCase().includes(query.toLowerCase()) || 
          (plant.scientificName && plant.scientificName.toLowerCase().includes(query.toLowerCase()))
      );
      
      setPlants(filteredPlants);
    } catch (err) {
      setError(err as Error);
      console.error('Error searching plants:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = async () => {
    setPlants(originalPlants);
    setCurrentQuery('');
    return Promise.resolve();
  };

  const getPlantById = async (id: string): Promise<Plant | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('plant')
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
    fetchAllPlants();
  }, []);

  return {
    plants,
    loading,
    error,
    searchPlants,
    getPlantById,
    resetSearch,
    currentQuery,
  };
}