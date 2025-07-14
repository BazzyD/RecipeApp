import { initializeApp, cert, getApps  } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };
  initializeApp({
        credential: cert(serviceAccount as any),
    projectId: serviceAccount.projectId, // Optional but safe
  });
}

const db = getFirestore();
const auth = getAuth();

export { db, auth };



