import { supabase } from '@/lib/supabase';
import axios from 'axios';
import Constants from 'expo-constants';

const TREFLE_API_KEY =
  Constants.expoConfig?.extra?.TREFLE_API_KEY || Constants.manifest?.extra?.TREFLE_API_KEY;

const TREFLE_BASE_URL = 'https://trefle.io/api/v1/plants';

// helper functions
const getRandomLight = () => Math.floor(Math.random() * 5) + 3; // 3–7

const getRandomMinTemp = () => Math.floor(Math.random() * 16); // 0–15 °C
const getRandomMaxTemp = (minTemp: number) => minTemp + Math.floor(Math.random() * 16) + 5; // +5–20 °C above min

const getRandomMinPrecip = () => Math.floor(Math.random() * 301) + 100; // 100–400 mm
const getRandomMaxPrecip = (minPrecip: number) => minPrecip + Math.floor(Math.random() * 1001) + 100; // +100–1100 mm above min

const getRandomDuration = () => {
  const options = ['annual', 'biennial', 'perennial'];
  return options[Math.floor(Math.random() * options.length)];
};

const getRandomGrowthRate = () => {
  const options = ['slow', 'medium', 'fast'];
  return options[Math.floor(Math.random() * options.length)];
};

export const populatePlantDatabase = async () => {
  const pagesToFetch = 5;
  const pageSize = 20;
  let insertedCount = 0;
  let skippedCount = 0;

  for (let page = 1; page <= pagesToFetch; page++) {
    console.log(`📦 Fetching page ${page}...`);

    try {
      const response = await axios.get(TREFLE_BASE_URL, {
        headers: { Accept: 'application/json' },
        params: {
          token: TREFLE_API_KEY,
          page,
          page_size: pageSize,
        },
      });

      const plants = response.data.data;

      for (const plant of plants) {
        const { common_name, scientific_name, main_species, image_url } = plant;
        const growth = main_species?.growth;

        if (!common_name || !scientific_name) {
          console.warn(`⚠️ Skipping ${common_name || '[Unnamed]'} — missing name fields`);
          skippedCount++;
          continue;
        }

        const minTempValue = growth?.minimum_temperature?.deg_c ?? getRandomMinTemp();
        const maxTempValue = growth?.maximum_temperature?.deg_c ?? getRandomMaxTemp(minTempValue);

        const minPrecipValue = growth?.precipitation_minimum ?? getRandomMinPrecip();
        const maxPrecipValue = growth?.precipitation_maximum ?? getRandomMaxPrecip(minPrecipValue);

        const insertData = {
          plantName: common_name,
          scientificName: scientific_name,
          minTemp: minTempValue.toString(),
          maxTemp: maxTempValue.toString(),
          light: growth?.light?.toString() || getRandomLight().toString(),
          minPrecip: minPrecipValue.toString(),
          maxPrecip: maxPrecipValue.toString(),
          duration: growth?.duration || getRandomDuration(),
          growthRate: growth?.growth_rate || getRandomGrowthRate(),
          imageUrl: image_url || '',
        };

        console.log("➡️ Attempting to insert:", insertData);

        const { error } = await supabase.from('plant').insert(insertData);

        if (error) {
          console.error(`❌ Error inserting ${common_name}:`, JSON.stringify(error, null, 2));
        } else {
          console.log(`✅ Inserted: ${common_name}`);
          insertedCount++;
        }
      }
    } catch (err: any) {
      console.error(`❌ Failed fetching page ${page}:`, err.response?.data || err.message);
    }
  }

  console.log(`🌿 Done populating: ${insertedCount} inserted, ${skippedCount} skipped`);
};