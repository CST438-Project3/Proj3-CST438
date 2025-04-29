import axios from 'axios';
import Constants from 'expo-constants';

const TREFLE_API_KEY =
  Constants.expoConfig?.extra?.TREFLE_API_KEY || Constants.manifest?.extra?.TREFLE_API_KEY;

const TREFLE_BASE_URL = 'https://trefle.io/api/v1';

export const searchPlants = async (query: string) => {
  console.log("🔍 Searching:", query);
  console.log("🔑 API Key:", TREFLE_API_KEY);

  const response = await axios.get(`${TREFLE_BASE_URL}/plants/search`, {
    headers: {
      Accept: 'application/json',
    },
    params: {
      q: query,
      token: TREFLE_API_KEY,
    },
  });

  return response.data.data;
};