// Initialize Firebase Admin SDK using a service account key
import { initializeApp, cert, getApps  } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from './serviceAccountKey.json'; // Service account credentials
import type { ServiceAccount } from 'firebase-admin';

// Avoid re-initializing if Firebase has already been initialized
if (getApps().length === 0) {
  initializeApp({
        credential: cert(serviceAccount as ServiceAccount),
    projectId: serviceAccount.project_id,
  });
}

// Export Firestore and Auth instances for use across the app
const db = getFirestore();
const auth = getAuth();

export { db, auth };



