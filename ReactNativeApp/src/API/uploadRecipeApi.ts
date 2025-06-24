import { useAuthStore } from '../store/useAuthStore'; // adjust path
import { User } from 'firebase/auth';
export const uploadRecipeFromWeb = async (url: string) => {
  const user: User | null = useAuthStore.getState().user;
  const headers: any = {
    'Content-Type': 'application/json',
  };

  if (user) {
    const idToken = await user.getIdToken();
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  const response = await fetch("http://192.168.28.91:3000/api/upload", {
    method: "POST",
    headers,
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return await response.json(); // return saved recipe or message
};
