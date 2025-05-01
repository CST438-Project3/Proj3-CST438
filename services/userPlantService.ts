import { supabase } from '@/lib/supabase';

export const addPlantToUser = async (plantId: number, plantName: string) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('User not authenticated');

  const userId = user.id;

  // Count how many of this plant already exist for this user
  const { data: existing, error: countError } = await supabase
    .from('my_plants')
    .select('nickname', { count: 'exact', head: false })
    .eq('user_id', userId)
    .eq('plant_id', plantId);

  if (countError) throw countError;

  const count = existing.length;
  const nickname = count === 0 ? plantName : `${plantName} #${count + 1}`;

  const { error: insertError } = await supabase
    .from('my_plants')
    .insert([{ user_id: userId, plant_id: plantId, nickname }]);

  if (insertError) throw insertError;

  return nickname;
};