import { supabase } from '../supabase';

// get all plants for a user
export const getPlants = async (userId: string) => {
  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return data;
};

// add a new plant
export const addPlant = async (
  userId: string,
  plantName: string,
  plantFamily: string,
  habitat: string,
  description: string,
  scientificName: string,
  maxTemp: string,
  minTemp: string,
  light: string,
  minPrecip: string,
  maxPrecip: string,
  growthRate: string,
  toxicity: string,
  wateringFreq: number,
  notes?: string
) => {
  const { error } = await supabase.from('plants').insert({
    user_id: userId,
    plant_name: plantName,
    plant_family: plantFamily,
    habitat: habitat,
    description: description,
    scientific_name: scientificName,
    max_temp: maxTemp,
    min_temp: minTemp,
    light: light,
    min_precip: minPrecip,
    max_precip: maxPrecip,
    growth_rate: growthRate,
    toxicity: toxicity,
    watering_freq: wateringFreq,
    last_watered: new Date().toISOString(),
    notes: notes || '',
  });

  if (error) throw new Error(error.message);
};