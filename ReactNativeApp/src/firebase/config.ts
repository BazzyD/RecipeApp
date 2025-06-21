// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDlfUX21FQcvbo23WRK3IAbQLYmd_076VM",
  authDomain: "recipeapp-56bba.firebaseapp.com",
  projectId: "recipeapp-56bba",
  storageBucket: "recipeapp-56bba.firebasestorage.app",
  messagingSenderId: "307239307589",
  appId: "1:307239307589:web:a02db90fd0dc645241962c"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Export services
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
