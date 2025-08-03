// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
const firebaseConfig = {
   apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);


const auth = getAuth(app);

export const db = getFirestore(app);
export { auth };
export default app;
