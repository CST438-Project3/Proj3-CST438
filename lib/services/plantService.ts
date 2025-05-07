import { supabase } from '@/lib/supabase';

export const getAllPlants = async () => {
  const { data, error } = await supabase
    .from('plant')
    .select('*')
    .order('plantName', { ascending: true });

  if (error) {
    console.error('Error fetching plants:', error.message);
    throw error;
  }

  return data;
};

export const deleteAllPlants = async () => {
  const { error } = await supabase
    .from('plant')
    .delete()
    .neq('id', 0); // delete where id != 0

  if (error) {
    console.error('Error deleting plants:', error.message);
    throw error;
  }

  console.log('All plants deleted!');
};