// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
const firebaseConfig = {
  apiKey: "AIzaSyDlfUX21FQcvbo23WRK3IAbQLYmd_076VM",
  authDomain: "recipeapp-56bba.firebaseapp.com",
  projectId: "recipeapp-56bba",
  storageBucket: "recipeapp-56bba.firebasestorage.app",
  messagingSenderId: "307239307589",
  appId: "1:307239307589:web:a02db90fd0dc645241962c"
};

const app = initializeApp(firebaseConfig);


const auth = getAuth(app);

export const db = getFirestore(app);
export { auth };
export default app;
