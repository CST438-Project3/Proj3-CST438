import { supabase } from '@/lib/supabase';

// Fetch all plants in a user's collection
export const getUserPlants = async (userId: string) => {
  const { data, error } = await supabase
    .from('collection')
    .select('*, plant(*)')
    .eq('userId', userId);

  if (error) {
    console.error('❌ Error fetching user plants:', error.message);
    return [];
  }

  return data;
};

// Add a specific plant to a user's collection
export const addPlantToCollection = async (userId: string, plantId: number) => {
  const { data, error } = await supabase
    .from('collection')
    .insert([{ userId, plantId }]);

  if (error) {
    console.error('❌ Error adding plant to collection:', error.message);
    return null;
  }

  return data;
};