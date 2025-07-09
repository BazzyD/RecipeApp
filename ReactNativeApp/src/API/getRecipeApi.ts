import { useAuthStore } from '../store/useAuthStore'; // adjust path
import { User } from 'firebase/auth';
import axios from 'axios';
import Constants from 'expo-constants';


const getIp = () => {
  const config = Constants.expoConfig as any; // cast to any to bypass typings
  if (!config) return null;

  const debuggerHost = config.debuggerHost ?? config.hostUri ?? (config.extra?.debuggerHost);
  if (!debuggerHost) return null;

  return debuggerHost.split(':')[0];
};



export const getRecipeById = async (recipeId: string) => {

const ip = getIp();

const BASE_URL = `http://${ip}:3000`;
  const user: User | null = useAuthStore.getState().user;
  const headers: any = {
    'Content-Type': 'application/json',
  };

  if (user) {
    const idToken = await user.getIdToken();
    headers['Authorization'] = `Bearer ${idToken}`;
  }
  const response = await axios.get(
    BASE_URL.concat("/api/recipe?recipeId=").concat(recipeId),
    { timeout: 10000 }
  );

  // Success: response.data contains the JSON
  return response.data;


}
