import { useAuthStore } from './firebase/useAuthStore'; // adjust path
import { User } from 'firebase/auth';
import axios from 'axios';


//const BASE_URL = 'http://10.0.0.10:3000';
const BASE_URL = ' https://a36432cbf2db.ngrok-free.app';

/**
 * Builds headers including authorization if user is signed in.
 */
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const user: User | null = useAuthStore.getState().user;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (user) {
    const idToken = await user.getIdToken();
    headers['authorization'] = `Bearer ${idToken}`;
  }

  return headers;
};

/**
 * Fetch a single recipe by its ID
 */
export const getRecipeById = async (recipeId: string) => {
  const headers = await getAuthHeaders();
  try {
  const response = await axios.get(`${BASE_URL}/api/recipe`, {
      params: { recipeId },
      headers,
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const uploadRecipeFromWeb = async (url: string) => {
  const headers = await getAuthHeaders();

  try {
    const response = await axios.post(
      `${BASE_URL}/api/upload`,
      { url },
      {
        headers,
        timeout: 10000,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieves similar recipes based on a given recipe ID
 */
export const searchRecipes = async (recipeId: string) => {
  const headers = await getAuthHeaders();

   try {
    const response = await axios.get(`${BASE_URL}/api/search`, {
      params: { recipeId },
      headers,
      timeout: 50000,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
