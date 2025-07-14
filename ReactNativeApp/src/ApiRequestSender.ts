import { useAuthStore } from './firebase/useAuthStore'; // adjust path
import { User } from 'firebase/auth';
import axios from 'axios';



const BASE_URL = 'https://recipeapp-a8po.onrender.com';



export const getRecipeById = async (recipeId: string) => {
  const user: User | null = useAuthStore.getState().user;

  const headers: any = {
    'Content-Type': 'application/json',
  };

  if (user) {
    const idToken = await user.getIdToken();
    headers['authorization'] = `Bearer ${idToken}`;
  }
  const response = await axios.get(
    `${BASE_URL}/api/recipe?recipeId=${recipeId}`,
    { 
      headers,
      timeout: 10000 
    }
  );

  // Success: response.data contains the JSON
  return response.data;


}

export const uploadRecipeFromWeb = async (url: string) => {
  const user: User | null = useAuthStore.getState().user;

  const headers: any = {'Content-Type': 'application/json' };

  if (user) {
    const idToken = await user.getIdToken();
    headers['authorization'] = `Bearer ${idToken}`;
  }

  const response = await axios.post(
    `${BASE_URL}/api/upload`,
    { url },
    { 
      headers,
      timeout: 10000 
    }
  );

  return response.data;
}

export const searchRecipes = async (recipeId: string) => {
  const user: User | null = useAuthStore.getState().user;

  const headers: any = {
    'Content-Type': 'application/json',
  };

  if (user) {
    const idToken = await user.getIdToken();
    headers['authorization'] = `Bearer ${idToken}`;
  }
  const response = await axios.get(
    `${BASE_URL}/api/search?recipeId=${recipeId}`,
    { headers,
      timeout: 20000 }
  );

  return response.data;

}
