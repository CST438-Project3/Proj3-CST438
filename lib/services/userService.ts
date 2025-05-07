import { supabase } from '../supabase';

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateUserProfileData = async (userId: string, fields: any) => {
    return await supabase
      .from('profiles')
      .update(fields)
      .eq('id', userId);
  };