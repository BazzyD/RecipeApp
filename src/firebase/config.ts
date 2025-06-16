// firebase/config.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDlfUX21FQcvbo23WRK3IAbQLYmd_076VM",
  authDomain: "recipeapp-56bba.firebaseapp.com",
  projectId: "recipeapp-56bba",
  storageBucket: "recipeapp-56bba.firebasestorage.app",
  messagingSenderId: "307239307589",
  appId: "1:307239307589:web:a02db90fd0dc645241962c"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const firestore = getFirestore(app);
